pragma solidity ^0.5.0;

import "./../Token/MintedCrowdsale.sol";

contract SntCrowdsale is MintedCrowdsale {

  constructor(uint256 rate, address payable wallet, IERC20 token) public MintedCrowdsale(rate, wallet, token){

  }

}
