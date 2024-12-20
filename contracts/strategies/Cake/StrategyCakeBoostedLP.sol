// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ERC20Upgradeable as ERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IERC20Upgradeable as IERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import {ERC20Upgradeable as ERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import {SafeERC20Upgradeable as SafeERC20} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {SafeMathUpgradeable as SafeMath} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "../../interfaces/pancake/IVeCakeStaker.sol";
import "../../interfaces/pancake/ICakeChefV2.sol";

import "../../interfaces/common/IUniswapRouterETH.sol";
import "../../interfaces/common/IUniswapV2Pair.sol";
import "../../interfaces/common/IWrappedNative.sol";
import "../Common/StratFeeManagerAccessableInitializable.sol";

contract StrategyCakeBoostedLP is StratFeeManagerAccessableInitializable {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  // Tokens used
  address public native;
  address public output;
  address public want;
  address public lpToken0;
  address public lpToken1;

  // Contracts
  address public boostStaker;

  // Third party contracts
  address public chef;
  uint256 public poolId;

  bool public harvestOnDeposit;
  uint256 public lastHarvest;

  // Routes
  address[] public outputToNativeRoute;
  address[] public outputToLp0Route;
  address[] public outputToLp1Route;

  event StratHarvest(address indexed harvester, uint256 wantHarvested, uint256 tvl);
  event Deposit(uint256 tvl);
  event Withdraw(uint256 tvl);
  event ChargedFees(uint256 callFees, uint256 batcherFees, uint256 strategistFees);

  function initialize(
    address _want,
    uint256 _poolId,
    address _chef,
    address _boostStaker,
    address[] memory _outputToNativeRoute,
    address[] memory _outputToLp0Route,
    address[] memory _outputToLp1Route,
    CommonAddressesAccessable calldata _commonAddresses
  ) public initializer {
    __StratFeeManagerAccessableInitializable_init(_commonAddresses);

    want = _want;
    poolId = _poolId;
    chef = _chef;
    boostStaker = _boostStaker;

    outputToNativeRoute = _outputToNativeRoute;
    output = _outputToNativeRoute[0];
    native = _outputToNativeRoute[_outputToNativeRoute.length - 1];

    // setup lp routing
    lpToken0 = IUniswapV2Pair(want).token0();
    require(_outputToLp0Route[0] == output, "outputToLp0Route[0] != output");
    require(_outputToLp0Route[_outputToLp0Route.length - 1] == lpToken0, "outputToLp0Route[last] != lpToken0");
    outputToLp0Route = _outputToLp0Route;

    lpToken1 = IUniswapV2Pair(want).token1();
    require(_outputToLp1Route[0] == output, "outputToLp1Route[0] != output");
    require(_outputToLp1Route[_outputToLp1Route.length - 1] == lpToken1, "outputToLp1Route[last] != lpToken1");
    outputToLp1Route = _outputToLp1Route;

    _giveAllowances();
  }

  // puts the funds to work
  function deposit() public whenNotPaused {
    uint256 wantBal = IERC20(want).balanceOf(address(this));

    if (wantBal > 0) {
      IVeCakeStaker(boostStaker).deposit(chef, poolId, wantBal);
      emit Deposit(balanceOf());
    }
  }

  function withdraw(uint256 _amount) external {
    require(msg.sender == vault, "!vault");

    uint256 wantBal = IERC20(want).balanceOf(address(this));

    if (wantBal < _amount) {
      IVeCakeStaker(boostStaker).withdraw(chef, poolId, _amount.sub(wantBal));
      wantBal = IERC20(want).balanceOf(address(this));
    }

    if (wantBal > _amount) {
      wantBal = _amount;
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

  function harvest() external virtual {
    _harvest(tx.origin);
  }

  function harvest(address callFeeRecipient) external virtual {
    _harvest(callFeeRecipient);
  }

  function managerHarvest() external onlyManager {
    _harvest(tx.origin);
  }

  // compounds earnings and charges performance fee
  function _harvest(address callFeeRecipient) internal whenNotPaused {
    IVeCakeStaker(boostStaker).deposit(chef, poolId, 0);
    uint256 outputBal = IERC20(output).balanceOf(address(this));
    if (outputBal > 0) {
      chargeFees(callFeeRecipient);
      addLiquidity();
      uint256 wantHarvested = balanceOfWant();
      deposit();

      lastHarvest = block.timestamp;
      emit StratHarvest(msg.sender, wantHarvested, balanceOf());
    }
  }

  // performance fees
  function chargeFees(address callFeeRecipient) internal {
    IFeeConfig.FeeCategory memory fees = getFees();

    uint256 toNative = IERC20(output).balanceOf(address(this)).mul(45).div(1000);
    IUniswapRouterETH(unirouter).swapExactTokensForTokens(
      toNative,
      0,
      outputToNativeRoute,
      address(this),
      block.timestamp
    );

    uint256 nativeBal = IERC20(native).balanceOf(address(this));

    uint256 callFeeAmount = nativeBal.mul(fees.call).div(DIVISOR);
    IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

    uint256 batcherFeeAmount = nativeBal.mul(fees.batcher).div(DIVISOR);
    IERC20(native).safeTransfer(feeRecipient, batcherFeeAmount);

    uint256 strategistFee = nativeBal.mul(fees.strategist).div(DIVISOR);
    IERC20(native).safeTransfer(getStrategist(), strategistFee);

    emit ChargedFees(callFeeAmount, batcherFeeAmount, strategistFee);
  }

  // Adds liquidity to AMM and gets more LP tokens.
  function addLiquidity() internal {
    uint256 outputHalf = IERC20(output).balanceOf(address(this)).div(2);

    if (lpToken0 != output) {
      IUniswapRouterETH(unirouter).swapExactTokensForTokens(
        outputHalf,
        0,
        outputToLp0Route,
        address(this),
        block.timestamp
      );
    }

    if (lpToken1 != output) {
      IUniswapRouterETH(unirouter).swapExactTokensForTokens(
        outputHalf,
        0,
        outputToLp1Route,
        address(this),
        block.timestamp
      );
    }

    uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
    uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));
    IUniswapRouterETH(unirouter).addLiquidity(lpToken0, lpToken1, lp0Bal, lp1Bal, 1, 1, address(this), block.timestamp);
  }

  // calculate the total underlaying 'want' held by the strat.
  function balanceOf() public view returns (uint256) {
    return balanceOfWant().add(balanceOfPool());
  }

  // it calculates how much 'want' this contract holds.
  function balanceOfWant() public view returns (uint256) {
    return IERC20(want).balanceOf(address(this));
  }

  // it calculates how much 'want' the strategy has working in the farm.
  function balanceOfPool() public view returns (uint256) {
    (uint256 _amount, , ) = ICakeChefV2(chef).userInfo(poolId, address(boostStaker));
    return _amount;
  }

  // returns rewards unharvested
  function rewardsAvailable() public view returns (uint256) {
    return ICakeChefV2(chef).pendingCake(poolId, address(boostStaker));
  }

  // native reward amount for calling harvest
  function callReward() public view returns (uint256) {
    return 0;
  }

  function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyManager {
    harvestOnDeposit = _harvestOnDeposit;
  }

  // called as part of strat migration. Sends all the available funds back to the vault.
  function retireStrat() external {
    require(msg.sender == vault, "!vault");

    IVeCakeStaker(boostStaker).emergencyWithdraw(chef, poolId);
    IVeCakeStaker(boostStaker).upgradeStrategy(chef, poolId);

    uint256 wantBal = IERC20(want).balanceOf(address(this));
    IERC20(want).transfer(vault, wantBal);
  }

  // pauses deposits and withdraws all funds from third party systems.
  function panic() public onlyManager {
    pause();
    IVeCakeStaker(boostStaker).emergencyWithdraw(chef, poolId);
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
    IERC20(want).safeApprove(boostStaker, type(uint).max);
    IERC20(output).safeApprove(unirouter, type(uint).max);
    IERC20(native).safeApprove(unirouter, type(uint).max);

    IERC20(lpToken0).safeApprove(unirouter, 0);
    IERC20(lpToken0).safeApprove(unirouter, type(uint).max);

    IERC20(lpToken1).safeApprove(unirouter, 0);
    IERC20(lpToken1).safeApprove(unirouter, type(uint).max);
  }

  function _removeAllowances() internal {
    IERC20(want).safeApprove(boostStaker, 0);
    IERC20(output).safeApprove(unirouter, 0);
    IERC20(native).safeApprove(unirouter, 0);
    IERC20(lpToken0).safeApprove(unirouter, 0);
    IERC20(lpToken1).safeApprove(unirouter, 0);
  }

  function setBoostStaker(address _boostStaker) external whenPaused onlyOwner {
    boostStaker = _boostStaker;
  }

  function outputToNative() external view returns (address[] memory) {
    return outputToNativeRoute;
  }

  function outputToLp0() external view returns (address[] memory) {
    return outputToLp0Route;
  }

  function outputToLp1() external view returns (address[] memory) {
    return outputToLp1Route;
  }
}
