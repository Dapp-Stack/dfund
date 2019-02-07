pragma solidity ^0.5.0;

import "./Fund.sol";

contract Controller {

    event FundCreated(
        address _address,
        string name,
        string symbol,
        uint256 totalSupply,
        address democracy,
        address[] tokens,
        uint256[] percentages
    );

    address[] public funds;

    function create(string memory _name, string memory _symbol, address[] memory _tokens, uint256[] memory _percentages) public {
        Fund fund = new Fund(_name, _symbol, _tokens, _percentages);
        funds.push(address(fund));
        // fund.initDemocracy();
        // new Democracy(address(fund), 1);
        // fund.transferOwnership(address(fund.democracy()));
        emit FundCreated(address(fund), _name, _symbol, fund._totalSupply(), address(fund.democracy()), _tokens, _percentages);
    }

    function getAddresses() public view returns(address[] memory) {
        return funds;
    }

    function getLength() public view returns(uint256) {
        return funds.length;
    }
}