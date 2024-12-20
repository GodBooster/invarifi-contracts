// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/access/Ownable.sol";
import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin-4/contracts/utils/math/Math.sol";
import "@openzeppelin-4/contracts/utils/math/SafeMath.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";

import "../utils/LPTokenWrapper.sol";

contract RewardPool is LPTokenWrapper, Ownable, IERC20 {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public rewardToken;
  uint256 public constant DURATION = 1 days;

  uint256 public periodFinish = 0;
  uint256 public rewardRate = 0;
  uint256 public lastUpdateTime;
  uint256 public rewardPerTokenStored;

  mapping(address => mapping(address => uint256)) public _allowance;
  mapping(address => mapping(address => bool)) public _rewardsAllowance;

  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;

  event RewardAdded(uint256 reward);
  event Staked(address indexed user, uint256 amount);
  event Withdrawn(address indexed user, uint256 amount);
  event RewardPaid(address indexed user, uint256 reward);

  constructor(address _stakedToken, address _rewardToken) LPTokenWrapper(_stakedToken) {
    rewardToken = IERC20(_rewardToken);
  }

  modifier updateReward(address account) {
    _updateRewards(account);
    _;
  }

  function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0)) {
    if (block.timestamp >= periodFinish) {
      rewardRate = reward.div(DURATION);
    } else {
      uint256 remaining = periodFinish.sub(block.timestamp);
      uint256 leftover = remaining.mul(rewardRate);
      rewardRate = reward.add(leftover).div(DURATION);
    }
    lastUpdateTime = block.timestamp;
    periodFinish = block.timestamp.add(DURATION);
    emit RewardAdded(reward);
  }

  function allowance(address _owner, address _spender) public view returns (uint256) {
    return _allowance[_owner][_spender];
  }

  function balanceOf(address _of) public view override(IERC20, LPTokenWrapper) returns (uint256) {
    return super.balanceOf(_of);
  }

  function totalSupply() public view override(IERC20, LPTokenWrapper) returns (uint256) {
    return super.totalSupply();
  }

  function approve(address _address, uint256 _amount) public returns (bool) {
    _allowance[msg.sender][_address] = _amount;
    emit Approval(msg.sender, _address, _amount);
    return true;
  }

  function approveWithRewards(address _address, uint256 _amount) public returns (bool) {
    _allowance[msg.sender][_address] = _amount;
    _rewardsAllowance[msg.sender][_address] = true;
    emit Approval(msg.sender, _address, _amount);
    return true;
  }

  function transfer(address dst, uint wad) public returns (bool) {
    return transferFrom(msg.sender, dst, wad);
  }

  function transferFrom(address src, address dst, uint wad) public updateReward(src) updateReward(dst) returns (bool) {
    require(balanceOf(src) >= wad, "Insufficient amount");

    if (src != msg.sender && _allowance[src][msg.sender] != type(uint256).max) {
      require(_allowance[src][msg.sender] >= wad);
      _allowance[src][msg.sender] -= wad;
    }

    if(_rewardsAllowance[src][dst]) {
      _getRewardTo(src, dst);
    }
    else {
      _getReward(src);
    }
    _balances[src] -= wad;

    _balances[dst] += wad;

    emit Transfer(src, dst, wad);

    return true;
  }

  function lastTimeRewardApplicable() public view returns (uint256) {
    return Math.min(block.timestamp, periodFinish);
  }

  function rewardPerToken() public view returns (uint256) {
    if (totalSupply() == 0) {
      return rewardPerTokenStored;
    }

    return
      rewardPerTokenStored.add(
        lastTimeRewardApplicable().sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(totalSupply())
      );
  }

  function earned(address account) public view returns (uint256) {
    return
      balanceOf(account).mul(rewardPerToken().sub(userRewardPerTokenPaid[account])).div(1e18).add(rewards[account]);
  }

  function depositAll() external {
    stake(stakedToken.balanceOf(msg.sender));
  }

  function deposit(uint256 amount) external {
    stake(amount);
  }

  // stake visibility is public as overriding LPTokenWrapper's stake() function
  function stake(uint256 amount) public override {
    stake(amount, msg.sender);
  }

  // stake visibility is public as overriding LPTokenWrapper's stake() function
  function stake(uint256 amount, address _stakeFor) public updateReward(_stakeFor) {
    require(amount > 0, "Cannot stake 0");
    super.stakeFor(amount, _stakeFor);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint256 amount) public override updateReward(msg.sender) {
    require(amount > 0, "Cannot withdraw 0");
    super.withdraw(amount);
    emit Withdrawn(msg.sender, amount);
  }

  function exit() external {
    withdraw(balanceOf(msg.sender));
    getReward();
  }

  function getReward() public updateReward(msg.sender) {
    _getReward(msg.sender);
  }

  function want() public view returns (address) {
    return address(stakedToken);
  }

  function inCaseTokensGetStuck(address _token) external onlyOwner {
    require(_token != address(stakedToken), "!staked");
    require(_token != address(rewardToken), "!reward");

    uint256 amount = IERC20(_token).balanceOf(address(this));
    IERC20(_token).safeTransfer(msg.sender, amount);
  }

  function _updateRewards(address account) private {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = lastTimeRewardApplicable();
    if (account != address(0)) {
      rewards[account] = earned(account);
      userRewardPerTokenPaid[account] = rewardPerTokenStored;
    }
  }

  function _getReward(address user) internal updateReward(user) {
    uint256 reward = earned(user);
    if (reward > 0) {
      rewards[user] = 0;
      rewardToken.safeTransfer(user, reward);
      emit RewardPaid(user, reward);
    }
  }

  function _getRewardTo(address user, address dst) internal updateReward(user) {
    uint256 reward = earned(user);
    if (reward > 0) {
      rewards[user] = 0;
      rewardToken.safeTransfer(dst, reward);
      emit RewardPaid(user, reward);
    }
  }
}
