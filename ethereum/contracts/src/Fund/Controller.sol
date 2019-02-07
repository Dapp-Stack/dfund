pragma solidity ^0.5.0;

import "./Mixin/Ownable.sol";
import "./Fund.sol";

contract Controller is Ownable {

    event FundCreated();

    address[] public funds;

    function create() public {
        emit FundCreated();
    }

    function getAddresses() public view returns(address[] memory) {
        return funds;
    }

    function getLength() public view returns(uint256) {
        return funds.length;
    }
}