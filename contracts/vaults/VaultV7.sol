// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "../interfaces/base/IStrategyV7.sol";
import {AccessControlAbstract} from "../utils/access/AccessControlAbstract.sol";

/**
 * @dev Implementation of a vault to deposit funds for yield optimizing.
 * This is the contract that receives funds and that users interface with.
 * The yield optimizing strategy itself is implemented in a separate 'Strategy.sol' contract.
 */
contract VaultV7 is
    ERC20Upgradeable,
    AccessControlAbstract,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    event Deposit(
        address indexed caller,
        address indexed user,
        uint256 wantDeposited,
        uint256 totalVaultDeposited,
        uint256 rate,
        uint256 timestamp
    );

    event Withdraw(
        address indexed caller,
        address indexed user,
        uint256 wantWithdrawn,
        uint256 totalVaultDeposited,
        uint256 rate,
        uint256 timestamp
    );

    struct StratCandidate {
        address implementation;
        uint proposedTime;
    }

    // The last proposed strategy to switch to.
    // DEPRECATED
    StratCandidate public stratCandidate;
    // The strategy currently in use by the vault.
    IStrategyV7 public strategy;
    // The minimum time it has to pass before a strat candidate can be approved.
    // DEPRECATED
    uint256 public approvalDelay;

    address public feeRecipient;

    uint256 public constant DEPOSIT_FEE_CAP = 1000;
    uint256 public constant WITHDRAWAL_FEE_CAP = 1000;
    uint256 public constant DEPOSIT_MAX = 10000;
    uint256 public constant WITHDRAWAL_MAX = 10000;
    uint256 internal _depositFee;
    uint256 internal _withdrawalFee;

    uint256[50] private __gap;

    event NewStratCandidate(address implementation);
    event UpgradeStrat(address implementation);
    event SetFeeRecipient(address feeRecipient);
    event SetDepositFee(uint256 _depositFee);
    event SetWithdrawalFee(uint256 _withdrawalFee);

    /**
     * @dev Sets the value of {token} to the token that the vault will
     * hold as underlying value. It initializes the vault's own 'moo' token.
     * This token is minted when someone does a deposit. It is burned in order
     * to withdraw the corresponding portion of the underlying assets.
     * @param _strategy the address of the strategy.
     * @param _name the name of the vault token.
     * @param _symbol the symbol of the vault token.
     */
    function initialize(
        address _strategy,
        string memory _name,
        string memory _symbol,
        address _feeRecipient,
        address _ac
    ) public initializer {
        _initialize(IStrategyV7(_strategy), _name, _symbol, _feeRecipient, _ac);
    }

    //  function initializeWithStrategyCall(
    //     IStrategyV7 _strategy,
    //     bytes calldata _calldata,
    //     string memory _name,
    //     string memory _symbol,
    //     uint256 _approvalDelay
    // ) public initializer {
    //     _initialize(_strategy, _name, _symbol, _approvalDelay);
    //     (bool succeed,) =address(_strategy).call(_calldata);
    //     assert(succeed);
    // }

    function _initialize(
        IStrategyV7 _strategy,
        string memory _name,
        string memory _symbol,
        address _feeRecipient,
        address _ac
    ) private onlyInitializing {
        __ERC20_init(_name, _symbol);
        __AccessAccessControlAbstract_init(_ac);
        __ReentrancyGuard_init();
        strategy = _strategy;
        feeRecipient = _feeRecipient;
    }

    function want() public view returns (IERC20Upgradeable) {
        return IERC20Upgradeable(strategy.want());
    }

    /**
     * @dev It calculates the total underlying value of {token} held by the system.
     * It takes into account the vault contract balance, the strategy contract balance
     *  and the balance deployed in other contracts as part of the strategy.
     */
    function balance() public view returns (uint) {
        return
            want().balanceOf(address(this)) + IStrategyV7(strategy).balanceOf();
    }

    /**
     * @dev Custom logic in here for how much the vault allows to be borrowed.
     * We return 100% of tokens for now. Under certain conditions we might
     * want to keep some of the system funds at hand in the vault, instead
     * of putting them to work.
     */
    function available() public view returns (uint256) {
        return want().balanceOf(address(this));
    }

    /**
     * @dev Function for various UIs to display the current value of one of our yield tokens.
     * Returns an uint256 with 18 decimals of how much underlying asset one vault share represents.
     */
    function getPricePerFullShare() public view returns (uint256) {
        return totalSupply() == 0 ? 1e18 : (balance() * 1e18) / totalSupply();
    }

    /**
     * @dev A helper function to call deposit() with all the sender's funds.
     */
    function depositAll(address user) public {
        deposit(want().balanceOf(msg.sender), user);
    }

    function depositAll() external {
        depositAll(msg.sender);
    }

    function deposit(uint _amount, address user) public nonReentrant {
        _deposit(_amount, user);
    }

    /**
     * @dev The entrypoint of funds into the system. People deposit with this function
     * into the vault. The vault is then in charge of sending funds into the strategy.
     */
    function deposit(uint _amount) public nonReentrant {
        _deposit(_amount, msg.sender);
    }

    /**
     * @dev Function to send funds into the strategy and put them to work. It's primarily called
     * by the vault's deposit() function.
     */
    function earn() public {
        uint _bal = available();
        want().safeTransfer(address(strategy), _bal);
        strategy.deposit();
    }

    /**
     * @dev A helper function to call withdraw() with all the sender's funds.
     */
    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    /**
     * @dev Function to exit the system. The vault will withdraw the required tokens
     * from the strategy and pay up the token holder. A proportional number of IOU
     * tokens are burned in the process.
     */
    // TODO: make accessible only through zap contracts
    function withdraw(uint256 _shares, address _user) public {
        uint256 r = (balance() * _shares) / totalSupply();
        _burn(msg.sender, _shares);

        uint b = want().balanceOf(address(this));
        if (b < r) {
            uint _withdraw = r - b;
            strategy.withdraw(_withdraw);
            uint _after = want().balanceOf(address(this));
            uint _diff = _after - b;
            if (_diff < _withdraw) {
                r = b + _diff;
            }
        }

        if (!userHasRole(accessControlMain.OWNER_ROLE(), tx.origin)) {
            uint256 withdrawalFeeAmount = (r * _withdrawalFee) / WITHDRAWAL_MAX;
            want().safeTransfer(feeRecipient, withdrawalFeeAmount);

            r = r - withdrawalFeeAmount;
        }

        // TODO: replace with user
        want().safeTransfer(msg.sender, r);

        emit Withdraw(
            msg.sender,
            _user,
            r,
            balanceOf(_user),
            getPricePerFullShare(),
            block.timestamp
        );
    }

    function withdraw(uint256 _shares) public {
        withdraw(_shares, msg.sender);
    }

    // /**
    //  * @dev Sets the candidate for the new strat to use with this vault.
    //  * @param _implementation The address of the candidate strategy.
    //  */
    // function proposeStrat(address _implementation) public onlyOwner {
    //     require(
    //         address(this) == IStrategyV7(_implementation).vault(),
    //         "Proposal not valid for this Vault"
    //     );
    //     require(
    //         want() == IStrategyV7(_implementation).want(),
    //         "Different want"
    //     );
    //     stratCandidate = StratCandidate({
    //         implementation: _implementation,
    //         proposedTime: block.timestamp
    //     });

    //     emit NewStratCandidate(_implementation);
    // }

    /**
     * @dev It switches the active strat for the strat candidate
     */
    function upgradeStrat(address implementation) public onlyOwner {
        require(implementation != address(0), "There is no candidate");

        emit UpgradeStrat(implementation);

        if (strategy.balanceOf() != 0) {
            strategy.retireStrat();
        }

        strategy = IStrategyV7(implementation);

        require(strategy.vault() == address(this), "Invalid vault");

        earn();
    }

    /**
     * @dev Rescues random funds stuck that the strat can't handle.
     * @param _token address of the token to rescue.
     */
    function inCaseTokensGetStuck(address _token) external onlyOwner {
        require(_token != address(want()), "!token");

        uint256 amount = IERC20Upgradeable(_token).balanceOf(address(this));
        IERC20Upgradeable(_token).safeTransfer(msg.sender, amount);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
        emit SetFeeRecipient(_feeRecipient);
    }

    function setDepositFee(uint256 _fee) public onlyManager {
        require(_fee <= DEPOSIT_FEE_CAP, "!cap");
        _depositFee = _fee;
        emit SetDepositFee(_fee);
    }

    function depositFee() public view virtual returns (uint256) {
        return _depositFee;
    }

    // adjust withdrawal fee
    function setWithdrawalFee(uint256 _fee) public onlyManager {
        require(_fee <= WITHDRAWAL_FEE_CAP, "!cap");
        _withdrawalFee = _fee;
        emit SetWithdrawalFee(_fee);
    }

    function withdrawFee() public view virtual returns (uint256) {
        return _withdrawalFee;
    }

    function _deposit(uint _amount, address user) private {
        strategy.beforeDeposit();

        uint256 depositFeeAmount = (_amount * _depositFee) / DEPOSIT_MAX;
        _amount -= depositFeeAmount;

        uint256 _pool = balance();

        want().safeTransferFrom(msg.sender, address(this), _amount);
        want().safeTransfer(feeRecipient, depositFeeAmount);
        earn();
        uint256 _after = balance();
        _amount = _after - _pool; // Additional check for deflationary tokens
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply()) / _pool;
        }
        _mint(user, shares);

        emit Deposit(
            msg.sender,
            user,
            _amount,
            balanceOf(user),
            getPricePerFullShare(),
            block.timestamp
        );
    }
}
