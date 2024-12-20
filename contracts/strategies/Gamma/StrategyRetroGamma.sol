// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../interfaces/common/ISolidlyPair.sol";
import "../../interfaces/common/IERC20Extended.sol";
import "../Common/StratFeeManagerInitializable.sol";
import "../../utils/GasFeeThrottler.sol";
import "../../utils/UniV3Actions.sol";
import "../../utils/UniswapV3Utils.sol";
import "../Common/StratFeeManagerAccessableInitializable.sol";

interface IGammaUniProxy {
    function getDepositAmount(
        address pos,
        address token,
        uint _deposit
    ) external view returns (uint amountStart, uint amountEnd);

    function deposit(
        uint deposit0,
        uint deposit1,
        address to,
        address pos,
        uint[4] memory minIn
    ) external returns (uint shares);
}

interface IUniV3Pool {
    function pool() external view returns (address);

    function slot0()
        external
        view
        returns (
            // the current price
            uint160 sqrtPriceX96,
            // the current tick
            int24 tick,
            // the most-recently updated index of the observations array
            uint16 observationIndex,
            // the current maximum number of observations that are being stored
            uint16 observationCardinality,
            // the next maximum number of observations to store, triggered in observations.write
            uint16 observationCardinalityNext,
            // the current protocol fee as a percentage of the swap fee taken on withdrawal
            // represented as an integer denominator (1/x)%
            uint8 feeProtocol,
            // whether the pool is locked
            bool unlocked
        );

    function flash(
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external;

    function fee() external view returns (uint24);
}

interface IUniV3Quoter {
    function quoteExactInput(
        bytes memory path,
        uint amountIn
    ) external returns (uint amountOut);
}

interface IHypervisor {
    function whitelistedAddress() external view returns (address uniProxy);

    function withdraw(
        uint256 shares,
        address to,
        address from,
        uint256[4] memory minAmounts
    ) external returns (uint256 amount0, uint256 amount1);
}

interface IMerklClaimer {
    function claim(
        address[] calldata users,
        address[] calldata tokens,
        uint256[] calldata amounts,
        bytes32[][] calldata proofs
    ) external;
}

interface IOToken {
    function exercise(
        uint256 _amount,
        uint256 _maxPaymentAmount,
        address _recipient
    ) external returns (uint256);

    function getDiscountedPrice(
        uint256 _amount
    ) external view returns (uint256 amount);

    function discount() external view returns (uint256);
}

contract StrategyRetroGamma is StratFeeManagerAccessableInitializable {
    using SafeERC20 for IERC20;

    // Tokens used
    address public constant native = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address public constant output = 0xBFA35599c7AEbb0dAcE9b5aa3ca5f2a79624D8Eb;
    address public constant oRetro = 0x3A29CAb2E124919d14a6F735b6033a3AaD2B260F;
    address public constant cash = 0x5D066D022EDE10eFa2717eD3D79f22F949F8C175;
    address public constant merklClaimer =
        0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae;
    address public want;
    address public lpToken0;
    address public lpToken1;

    // Third party contracts
    IUniV3Quoter public constant quoter =
        IUniV3Quoter(0xddc9Ef56c6bf83F7116Fad5Fbc41272B07ac70C1);

    struct Flash {
        address pool;
        bytes outputToCash;
        bytes cashToNative;
        bool token0;
        bool flashEntered;
    }

    Flash public flash;

    bool public isFastQuote;
    bool public flashQuote;
    bool public harvestOnDeposit;
    uint256 public lastHarvest;

    uint256 public totalLocked;
    uint256 public constant DURATION = 1 days;

    bytes public outputToNativePath;
    bytes public nativeToLp0Path;
    bytes public nativeToLp1Path;
    bytes public oRetroToRetroPath;

    event StratHarvest(
        address indexed harvester,
        uint256 wantHarvested,
        uint256 tvl
    );
    event Deposit(uint256 tvl);
    event Withdraw(uint256 tvl);
    event ChargedFees(
        uint256 callFees,
        uint256 batcherFees,
        uint256 strategistFees
    );

    error NotPair();
    error InvalidFlash();

    function initialize(
        address _want,
        bytes calldata _outputToNativePath,
        bytes calldata _nativeToLp0Path,
        bytes calldata _nativeToLp1Path,
        Flash calldata _flash,
        CommonAddressesAccessable calldata _commonAddresses
    ) public initializer {
        __StratFeeManagerAccessableInitializable_init(_commonAddresses);
        want = _want;

        lpToken0 = ISolidlyPair(want).token0();
        lpToken1 = ISolidlyPair(want).token1();

        setOutputToNative(_outputToNativePath);
        setNativeToLp0(_nativeToLp0Path);
        setNativeToLp1(_nativeToLp1Path);

        flash = _flash;
        flash.flashEntered = false;
        flashQuote = true;

        address[] memory path = new address[](2);
        path[0] = oRetro;
        path[1] = output;

        uint24[] memory fee = new uint24[](1);
        fee[0] = 10000;

        oRetroToRetroPath = UniswapV3Utils.routeToPath(path, fee);

        _giveAllowances();
    }

    // puts the funds to work
    function deposit() public whenNotPaused {
        emit Deposit(balanceOf());
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "!vault");

        IERC20(want).safeTransfer(vault, _amount);

        emit Withdraw(balanceOf());
    }

    function beforeDeposit() external virtual override {
        if (harvestOnDeposit) {
            require(msg.sender == vault, "!vault");
            _harvest(tx.origin);
        }
    }

    function claim(
        address[] calldata _tokens,
        uint256[] calldata _amounts,
        bytes32[][] calldata _proofs
    ) external {
        address[] memory users = new address[](1);
        users[0] = address(this);

        IMerklClaimer(merklClaimer).claim(users, _tokens, _amounts, _proofs);
    }

    function harvest() external virtual {
        _harvest(tx.origin);
    }

    function harvest(address callFeeRecipient) external virtual {
        _harvest(callFeeRecipient);
    }

    // compounds earnings and charges performance fee
    function _harvest(address callFeeRecipient) internal whenNotPaused {
        uint256 bal = IERC20(oRetro).balanceOf(address(this));
        if (bal > 0) {
            uint256 before = balanceOfWant();
            swapRewardsToNative();
            chargeFees(callFeeRecipient);
            addLiquidity();
            uint256 wantHarvested = balanceOfWant() - before;
            totalLocked = wantHarvested + lockedProfit();

            lastHarvest = block.timestamp;
            emit StratHarvest(msg.sender, wantHarvested, balanceOf());
        }
    }

    function swapRewardsToNative() internal {
        uint bal = IERC20(oRetro).balanceOf(address(this));
        if (flashQuote) {
            uint256 discount = 100 - IOToken(oRetro).discount();
            uint expectedRetro = (bal * discount) / 100;
            uint256 swappedRetro = quoter.quoteExactInput(
                oRetroToRetroPath,
                bal
            );

            if (swappedRetro > expectedRetro)
                UniV3Actions.swapV3WithDeadline(
                    unirouter,
                    outputToNativePath,
                    bal
                );
            else flashExercise(bal);
        } else flashExercise(bal);
    }

    function flashExercise(uint256 _amount) internal {
        uint256 amountNeeded = IOToken(oRetro).getDiscountedPrice(_amount);
        uint256 token0Amt = flash.token0 ? amountNeeded : 0;
        uint256 token1Amt = flash.token0 ? 0 : amountNeeded;
        flash.flashEntered = true;
        IUniV3Pool(flash.pool).flash(address(this), token0Amt, token1Amt, "");
    }

    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata
    ) external {
        if (msg.sender != flash.pool) revert NotPair();
        if (!flash.flashEntered) revert InvalidFlash();

        uint256 cashAmount = IERC20(cash).balanceOf(address(this));
        uint256 oRetroAmt = IERC20(oRetro).balanceOf(address(this));
        IOToken(oRetro).exercise(oRetroAmt, cashAmount, address(this));

        UniV3Actions.swapV3WithDeadline(
            unirouter,
            flash.outputToCash,
            IERC20(output).balanceOf(address(this))
        );

        uint256 fee = flash.token0 ? fee0 : fee1;
        uint256 pairDebt = cashAmount + fee;
        IERC20(cash).transfer(flash.pool, pairDebt);
        UniV3Actions.swapV3WithDeadline(
            unirouter,
            flash.cashToNative,
            IERC20(cash).balanceOf(address(this))
        );
        flash.flashEntered = false;
    }

    // performance fees
    function chargeFees(address callFeeRecipient) internal {
        IFeeConfig.FeeCategory memory fees = getFees();
        uint256 nativeBal = (IERC20(native).balanceOf(address(this)) *
            fees.total) / DIVISOR;

        uint256 callFeeAmount = (nativeBal * fees.call) / DIVISOR;
        IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

        uint256 batcherFeeAmount = (nativeBal * fees.batcher) / DIVISOR;
        IERC20(native).safeTransfer(feeRecipient, batcherFeeAmount);

        uint256 strategistFeeAmount = (nativeBal * fees.strategist) / DIVISOR;
        IERC20(native).safeTransfer(getStrategist(), strategistFeeAmount);

        emit ChargedFees(callFeeAmount, batcherFeeAmount, strategistFeeAmount);
    }

    // Adds liquidity to AMM and gets more LP tokens.
    function addLiquidity() internal {
        (uint toLp0, uint toLp1) = quoteAddLiquidity(address(this));

        if (nativeToLp0Path.length > 0) {
            UniV3Actions.swapV3WithDeadline(unirouter, nativeToLp0Path, toLp0);
        }
        if (nativeToLp1Path.length > 0) {
            UniV3Actions.swapV3WithDeadline(unirouter, nativeToLp1Path, toLp1);
        }

        uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
        uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));

        (uint amount1Start, uint amount1End) = gammaProxy().getDepositAmount(
            want,
            lpToken0,
            lp0Bal
        );
        if (lp1Bal > amount1End) {
            lp1Bal = amount1End;
        } else if (lp1Bal < amount1Start) {
            (, lp0Bal) = gammaProxy().getDepositAmount(want, lpToken1, lp1Bal);
        }

        uint[4] memory minIn;
        gammaProxy().deposit(lp0Bal, lp1Bal, address(this), want, minIn);
    }

    function quoteAddLiquidity(
        address addressToCheck
    ) public returns (uint toLp0, uint toLp1) {
        uint nativeBal = IERC20(native).balanceOf(addressToCheck);
        uint ratio;

        if (isFastQuote) {
            uint lp0Decimals = 10 ** IERC20Extended(lpToken0).decimals();
            uint lp1Decimals = 10 ** IERC20Extended(lpToken1).decimals();
            uint decimalsDiff = (1e18 * lp0Decimals) / lp1Decimals;
            uint decimalsDenominator = decimalsDiff > 1e12 ? 1e6 : 1;
            (uint sqrtPriceX96, , , , , , ) = IUniV3Pool(
                IUniV3Pool(want).pool()
            ).slot0();
            uint price = ((sqrtPriceX96 ** 2 *
                (decimalsDiff / decimalsDenominator)) / (2 ** 192)) *
                decimalsDenominator;
            (uint amountStart, uint amountEnd) = gammaProxy().getDepositAmount(
                want,
                lpToken0,
                lp0Decimals
            );
            uint amountB = (((amountStart + amountEnd) / 2) * 1e18) /
                lp1Decimals;
            ratio = (amountB * 1e18) / price;
        } else {
            uint lp0Amt = nativeBal / 2;
            uint lp1Amt = nativeBal - lp0Amt;
            uint out0 = lp0Amt;
            uint out1 = lp1Amt;
            if (nativeToLp0Path.length > 0) {
                out0 = quoter.quoteExactInput(nativeToLp0Path, lp0Amt);
            }
            if (nativeToLp1Path.length > 0) {
                out1 = quoter.quoteExactInput(nativeToLp1Path, lp1Amt);
            }
            (uint amountStart, uint amountEnd) = gammaProxy().getDepositAmount(
                want,
                lpToken0,
                out0
            );
            uint amountB = (amountStart + amountEnd) / 2;
            ratio = (amountB * 1e18) / out1;
        }

        toLp0 = (nativeBal * 1e18) / (ratio + 1e18);
        toLp1 = nativeBal - toLp0;
    }

    function setFastQuote(bool _isFastQuote) external onlyManager {
        isFastQuote = _isFastQuote;
    }

    function setFlashQuote(bool _flashQuote) external onlyManager {
        flashQuote = _flashQuote;
    }

    function lockedProfit() public view returns (uint256) {
        uint256 elapsed = block.timestamp - lastHarvest;
        uint256 remaining = elapsed < DURATION ? DURATION - elapsed : 0;
        return (totalLocked * remaining) / DURATION;
    }

    // calculate the total underlaying 'want' held by the strat.
    function balanceOf() public view returns (uint256) {
        return balanceOfWant() - lockedProfit();
    }

    // it calculates how much 'want' this contract holds.
    function balanceOfWant() public view returns (uint256) {
        return IERC20(want).balanceOf(address(this));
    }

    // it calculates how much 'want' the strategy has working in the farm.
    function balanceOfPool() public pure returns (uint256) {
        return 0;
    }

    // returns rewards unharvested
    function rewardsAvailable() public pure returns (uint256) {
        return 0;
    }

    // native reward amount for calling harvest
    function callReward() public pure returns (uint256) {
        return 0;
    }

    function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyManager {
        harvestOnDeposit = _harvestOnDeposit;
    }

    // called as part of strat migration. Sends all the available funds back to the vault.
    function retireStrat() external {
        require(msg.sender == vault, "!vault");

        uint256 wantBal = IERC20(want).balanceOf(address(this));
        IERC20(want).transfer(vault, wantBal);
    }

    // pauses deposits and withdraws all funds from third party systems.
    function panic() public onlyManager {
        pause();
    }

    function pause() public onlyManager {
        _pause();

        _removeAllowances();
    }

    function unpause() external onlyManager {
        _unpause();

        _giveAllowances();

        deposit();
    }

    function _giveAllowances() internal {
        IERC20(output).approve(unirouter, type(uint).max);
        IERC20(native).approve(unirouter, type(uint).max);
        IERC20(cash).approve(unirouter, type(uint).max);
        IERC20(cash).approve(oRetro, type(uint).max);

        IERC20(lpToken0).approve(want, 0);
        IERC20(lpToken0).approve(want, type(uint).max);
        IERC20(lpToken1).approve(want, 0);
        IERC20(lpToken1).approve(want, type(uint).max);
    }

    function _removeAllowances() internal {
        IERC20(output).approve(unirouter, 0);
        IERC20(native).approve(unirouter, 0);
        IERC20(cash).approve(unirouter, type(uint).max);
        IERC20(cash).approve(oRetro, type(uint).max);

        IERC20(lpToken0).approve(want, 0);
        IERC20(lpToken1).approve(want, 0);
    }

    function setOutputToNative(
        bytes calldata _outputToNativePath
    ) public onlyOwner {
        if (_outputToNativePath.length > 0) {
            address[] memory route = UniswapV3Utils.pathToRoute(
                _outputToNativePath
            );
            require(route[0] == output, "!output");
        }
        outputToNativePath = _outputToNativePath;
    }

    function setNativeToLp0(bytes calldata _nativeToLp0Path) public onlyOwner {
        if (_nativeToLp0Path.length > 0) {
            address[] memory route = UniswapV3Utils.pathToRoute(
                _nativeToLp0Path
            );
            require(route[0] == native, "!native");
            require(route[route.length - 1] == lpToken0, "!lp0");
        }
        nativeToLp0Path = _nativeToLp0Path;
    }

    function setNativeToLp1(bytes calldata _nativeToLp1Path) public onlyOwner {
        if (_nativeToLp1Path.length > 0) {
            address[] memory route = UniswapV3Utils.pathToRoute(
                _nativeToLp1Path
            );
            require(route[0] == native, "!native");
            require(route[route.length - 1] == lpToken1, "!lp1");
        }
        nativeToLp1Path = _nativeToLp1Path;
    }

    function gammaProxy() public view returns (IGammaUniProxy uniProxy) {
        uniProxy = IGammaUniProxy(IHypervisor(want).whitelistedAddress());
    }

    function outputToNative() external view returns (address[] memory) {
        return UniswapV3Utils.pathToRoute(outputToNativePath);
    }

    function nativeToLp0() external view returns (address[] memory) {
        return UniswapV3Utils.pathToRoute(nativeToLp0Path);
    }

    function nativeToLp1() external view returns (address[] memory) {
        return UniswapV3Utils.pathToRoute(nativeToLp1Path);
    }
}
