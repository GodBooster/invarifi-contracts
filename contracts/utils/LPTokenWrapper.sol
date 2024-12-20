// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin-4/contracts/utils/math/SafeMath.sol";
import "@openzeppelin-4/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin-4/contracts/token/ERC20/IERC20.sol";

contract LPTokenWrapper {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public stakedToken;

  uint256 private _totalSupply;
  mapping(address => uint256) internal _balances;

  constructor(address _stakedToken) {
    stakedToken = IERC20(_stakedToken);
  }

  function totalSupply() public view virtual returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view virtual returns (uint256) {
    return _balances[account];
  }

  function stake(uint256 amount) public virtual {
    stakeFor(amount, msg.sender);
  }

  function stakeFor(uint256 amount, address _stakeFor) public virtual {
    _totalSupply = _totalSupply.add(amount);
    _balances[_stakeFor] = _balances[_stakeFor].add(amount);
    stakedToken.safeTransferFrom(msg.sender, address(this), amount);
  }

  function withdraw(uint256 amount) public virtual {
    _totalSupply = _totalSupply.sub(amount);
    _balances[msg.sender] = _balances[msg.sender].sub(amount);
    stakedToken.safeTransfer(msg.sender, amount);
  }
}
