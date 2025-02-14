// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../../interfaces/common/ISolidlyPair.sol";
import "../../interfaces/common/IRewardPool.sol";
import "../../interfaces/common/IERC20Extended.sol";
import "../Common/StratFeeManagerInitializable.sol";
import "../../utils/GasFeeThrottler.sol";
import "../../utils/AlgebraUtils.sol";

interface IGammaUniProxy {
    function getDepositAmount(address pos, address token, uint _deposit) external view returns (uint amountStart, uint amountEnd);
    function deposit(uint deposit0, uint deposit1, address to, address pos, uint[4] memory minIn) external returns (uint shares);
}

interface IAlgebraPool {
    function pool() external view returns(address);
    function globalState() external view returns(uint);
}

interface IAlgebraQuoter {
    function quoteExactInput(bytes memory path, uint amountIn) external returns (uint amountOut, uint16[] memory fees);
}

interface IHypervisor {
    function whitelistedAddress() external view returns (address uniProxy);
}

contract StrategyThenaGamma is StratFeeManagerInitializable, GasFeeThrottler {
    using SafeERC20 for IERC20;

    // Tokens used
    address public constant native = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address public constant output = 0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11;
    address public want;
    address public lpToken0;
    address public lpToken1;

    // Third party contracts
    address public rewardPool;
    IAlgebraQuoter public constant quoter = IAlgebraQuoter(0xeA68020D6A9532EeC42D4dB0f92B83580c39b2cA);

    bool public isFastQuote;
    bool public harvestOnDeposit;
    uint256 public lastHarvest;
    
    bytes public outputToNativePath;
    bytes public nativeToLp0Path;
    bytes public nativeToLp1Path;

    event StratHarvest(address indexed harvester, uint256 wantHarvested, uint256 tvl);
    event Deposit(uint256 tvl);
    event Withdraw(uint256 tvl);
    event ChargedFees(uint256 callFees, uint256 batcherFees, uint256 strategistFees);

    function initialize(
        address _want,
        address _rewardPool,
        bytes calldata _outputToNativePath,
        bytes calldata _nativeToLp0Path,
        bytes calldata _nativeToLp1Path,
        CommonAddresses calldata _commonAddresses
     ) public initializer  {
        __StratFeeManager_init(_commonAddresses);
        want = _want;
        rewardPool = _rewardPool;

        lpToken0 = ISolidlyPair(want).token0();
        lpToken1 = ISolidlyPair(want).token1();

        setOutputToNative(_outputToNativePath);
        setNativeToLp0(_nativeToLp0Path);
        setNativeToLp1(_nativeToLp1Path);

        harvestOnDeposit = true;
        withdrawalFee = 0;

        _giveAllowances();
    }

    // puts the funds to work
    function deposit() public whenNotPaused {
        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal > 0) {
            IRewardPool(rewardPool).deposit(wantBal);
            emit Deposit(balanceOf());
        }
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "!vault");

        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal < _amount) {
            IRewardPool(rewardPool).withdraw(_amount - wantBal);
            wantBal = IERC20(want).balanceOf(address(this));
        }

        if (wantBal > _amount) {
            wantBal = _amount;
        }

        if (tx.origin != owner() && !paused()) {
            uint256 withdrawalFeeAmount = wantBal * withdrawalFee / WITHDRAWAL_MAX;
            wantBal = wantBal - withdrawalFeeAmount;
        }

        IERC20(want).safeTransfer(vault, wantBal);

        emit Withdraw(balanceOf());
    }

    function beforeDeposit() external virtual override {
        if (harvestOnDeposit) {
            require(msg.sender == vault, "!vault");
            _harvest(tx.origin);
        }
    }

    function harvest() external gasThrottle virtual {
        _harvest(tx.origin);
    }

    function harvest(address callFeeRecipient) external gasThrottle virtual {
        _harvest(callFeeRecipient);
    }

    // compounds earnings and charges performance fee
    function _harvest(address callFeeRecipient) internal whenNotPaused {
        IRewardPool(rewardPool).getReward();
        uint256 outputBal = IERC20(output).balanceOf(address(this));
        if (outputBal > 0) {
            swapRewardsToNative();
            chargeFees(callFeeRecipient);
            addLiquidity();
            uint256 wantHarvested = balanceOfWant();
            deposit();

            lastHarvest = block.timestamp;
            emit StratHarvest(msg.sender, wantHarvested, balanceOf());
        }
    }

    function swapRewardsToNative() internal {
        uint bal = IERC20(output).balanceOf(address(this));
        AlgebraUtils.swap(unirouter, outputToNativePath, bal);
    }

    // performance fees
    function chargeFees(address callFeeRecipient) internal {
        IFeeConfig.FeeCategory memory fees = getFees();
        uint256 nativeBal = IERC20(native).balanceOf(address(this)) * fees.total / DIVISOR;

        uint256 callFeeAmount = nativeBal * fees.call / DIVISOR;
        IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

        uint256 batcherFeeAmount = nativeBal * fees.batcher / DIVISOR;
        IERC20(native).safeTransfer(feeRecipient, batcherFeeAmount);

        uint256 strategistFeeAmount = nativeBal * fees.strategist / DIVISOR;
        IERC20(native).safeTransfer(strategist, strategistFeeAmount);

        emit ChargedFees(callFeeAmount, batcherFeeAmount, strategistFeeAmount);
    }

    // Adds liquidity to AMM and gets more LP tokens.
    function addLiquidity() internal {
        (uint toLp0, uint toLp1) = quoteAddLiquidity();

        if (nativeToLp0Path.length > 0) {
            AlgebraUtils.swap(unirouter, nativeToLp0Path, toLp0);
        }
        if (nativeToLp1Path.length > 0) {
            AlgebraUtils.swap(unirouter, nativeToLp1Path, toLp1);
        }

        uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
        uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));

        (uint amount1Start, uint amount1End) = gammaProxy().getDepositAmount(want, lpToken0, lp0Bal);
        if (lp1Bal > amount1End) {
            lp1Bal = amount1End;
        } else if (lp1Bal < amount1Start) {
            (, lp0Bal) = gammaProxy().getDepositAmount(want, lpToken1, lp1Bal);
        }

        uint[4] memory minIn;
        gammaProxy().deposit(lp0Bal, lp1Bal, address(this), want, minIn);

    }

    function quoteAddLiquidity() internal returns (uint toLp0, uint toLp1) {
        uint nativeBal = IERC20(native).balanceOf(address(this));
        uint ratio;

        if (isFastQuote) {
            uint lp0Decimals = 10**IERC20Extended(lpToken0).decimals();
            uint lp1Decimals = 10**IERC20Extended(lpToken1).decimals();
            uint decimalsDiff = 1e18 * lp0Decimals / lp1Decimals;
            uint decimalsDenominator = decimalsDiff > 1e12 ? 1e6 : 1;
            uint sqrtPriceX96 = IAlgebraPool(IAlgebraPool(want).pool()).globalState();
            uint price = sqrtPriceX96 ** 2 * (decimalsDiff / decimalsDenominator) / (2 ** 192) * decimalsDenominator;
            (uint amountStart, uint amountEnd) = gammaProxy().getDepositAmount(want, lpToken0, lp0Decimals);
            uint amountB = (amountStart + amountEnd) / 2 * 1e18 / lp1Decimals;
            ratio = amountB * 1e18 / price;
        } else {
            uint lp0Amt = nativeBal / 2;
            uint lp1Amt = nativeBal - lp0Amt;
            uint out0 = lp0Amt;
            uint out1 = lp1Amt;
            if (nativeToLp0Path.length > 0) {
                (out0,) = quoter.quoteExactInput(nativeToLp0Path, lp0Amt);
            }
            if (nativeToLp1Path.length > 0) {
                (out1,) = quoter.quoteExactInput(nativeToLp1Path, lp1Amt);
            }
            (uint amountStart, uint amountEnd) = gammaProxy().getDepositAmount(want, lpToken0, out0);
            uint amountB = (amountStart + amountEnd) / 2;
            ratio = amountB * 1e18 / out1;
        }

        toLp0 = nativeBal * 1e18 / (ratio + 1e18);
        toLp1 = nativeBal - toLp0;
    }

    function setFastQuote(bool _isFastQuote) external onlyManager {
        isFastQuote = _isFastQuote;
    }

    // calculate the total underlaying 'want' held by the strat.
    function balanceOf() public view returns (uint256) {
        return balanceOfWant() + balanceOfPool();
    }

    // it calculates how much 'want' this contract holds.
    function balanceOfWant() public view returns (uint256) {
        return IERC20(want).balanceOf(address(this));
    }

    // it calculates how much 'want' the strategy has working in the farm.
    function balanceOfPool() public view returns (uint256) {
        return IRewardPool(rewardPool).balanceOf(address(this));
    }

    // returns rewards unharvested
    function rewardsAvailable() public view returns (uint256) {
        return IRewardPool(rewardPool).earned(address(this));
    }

    // native reward amount for calling harvest
    function callReward() public pure returns (uint256) {
        return 0;
    }

    function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyManager {
        harvestOnDeposit = _harvestOnDeposit;

        if (harvestOnDeposit) {
            setWithdrawalFee(0);
        } else {
            setWithdrawalFee(10);
        }
    }

    function setShouldGasThrottle(bool _shouldGasThrottle) external onlyManager {
        shouldGasThrottle = _shouldGasThrottle;
    }

    // called as part of strat migration. Sends all the available funds back to the vault.
    function retireStrat() external {
        require(msg.sender == vault, "!vault");

        if (balanceOfPool() > 0) {
            if (IRewardPool(rewardPool).emergency()) IRewardPool(rewardPool).emergencyWithdraw();
            else IRewardPool(rewardPool).withdraw(balanceOfPool());
        }

        uint256 wantBal = IERC20(want).balanceOf(address(this));
        IERC20(want).transfer(vault, wantBal);
    }

    // pauses deposits and withdraws all funds from third party systems.
    function panic() public onlyManager {
        pause();
        if (IRewardPool(rewardPool).emergency()) IRewardPool(rewardPool).emergencyWithdraw();
        else IRewardPool(rewardPool).withdraw(balanceOfPool());
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
        IERC20(want).approve(rewardPool, type(uint).max);
        IERC20(output).approve(unirouter, type(uint).max);
        IERC20(native).approve(unirouter, type(uint).max);

        IERC20(lpToken0).approve(want, 0);
        IERC20(lpToken0).approve(want, type(uint).max);
        IERC20(lpToken1).approve(want, 0);
        IERC20(lpToken1).approve(want, type(uint).max);
    }

    function _removeAllowances() internal {
        IERC20(want).approve(rewardPool, 0);
        IERC20(output).approve(unirouter, 0);
        IERC20(native).approve(unirouter, 0);

        IERC20(lpToken0).approve(want, 0);
        IERC20(lpToken1).approve(want, 0);
    }

    function setOutputToNative(bytes calldata _outputToNativePath) public onlyOwner {
        if (_outputToNativePath.length > 0) {
            address[] memory route = AlgebraUtils.pathToRoute(_outputToNativePath);
            require(route[0] == output, "!output");
        }
        outputToNativePath = _outputToNativePath;
    }

    function setNativeToLp0(bytes calldata _nativeToLp0Path) public onlyOwner {
        if (_nativeToLp0Path.length > 0) {
            address[] memory route = AlgebraUtils.pathToRoute(_nativeToLp0Path);
            require(route[0] == native, "!native");
            require(route[route.length - 1] == lpToken0, "!lp0");
        }
        nativeToLp0Path = _nativeToLp0Path;
    }

    function setNativeToLp1(bytes calldata _nativeToLp1Path) public onlyOwner {
        if (_nativeToLp1Path.length > 0) {
            address[] memory route = AlgebraUtils.pathToRoute(_nativeToLp1Path);
            require(route[0] == native, "!native");
            require(route[route.length - 1] == lpToken1, "!lp1");
        }
        nativeToLp1Path = _nativeToLp1Path;
    }

    function gammaProxy() public view returns (IGammaUniProxy uniProxy) {
        uniProxy = IGammaUniProxy(IHypervisor(want).whitelistedAddress());
    }

    function outputToNative() external view returns (address[] memory) {
        return AlgebraUtils.pathToRoute(outputToNativePath);
    }

    function nativeToLp0() external view returns (address[] memory) {
        return AlgebraUtils.pathToRoute(nativeToLp0Path);
    }

    function nativeToLp1() external view returns (address[] memory) {
        return AlgebraUtils.pathToRoute(nativeToLp1Path);
    }
}