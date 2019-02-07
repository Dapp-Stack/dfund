pragma solidity ^0.5.0;

import "./Mixin/Ownable.sol";
import "./Democracy.sol";

contract Fund is Ownable, ERC20Mintable, ApproveAndCallFallBack {

    string public name;
    string public symbol;
    uint256 public _totalSupply = 0;
    Democracy public democracy;
    address[] public tokens;
    uint256[] public percentages;
    mapping(address => uint256) public blend;
    mapping(address => mapping(address => uint256)) public pendingTokens;
    
    constructor(string memory _name, string memory _symbol, address[] memory _tokens, uint256[] memory _percentages) public {
        require(_tokens.length == _percentages.length, "Tokens and percentages do not match");

        name = _name;
        symbol = _symbol;
        tokens = _tokens;
        percentages = _percentages;

        uint sum = 0;
        for (uint i = 0; i < tokens.length; i++) {
            sum += _percentages[i];
            require(sum <= 100, "Percentages overflow");
            blend[tokens[i]] = _percentages[i];
        }
        require(sum == 100, "Percentages must be equal to 100");

        democracy = new Democracy(address(this), 1);
        _owner = address(democracy);
    }

    function get() public view returns(
        address _address,
        string memory,
        string memory,
        uint256,
        address,
        address[] memory,
        uint256[] memory
    ) {
        return (address(this), name, symbol, _totalSupply, address(democracy), tokens, percentages);
    }

    function receiveApproval(address from, uint256 _amount, address _token, bytes memory _data) public {
        ERC20Mintable token = ERC20Mintable(_token);
        token.transferFrom(from, address(this), _amount);

        pendingTokens[from][_token] += _amount;
        mint(from);
    }

    function mint(address _to) public returns (bool) {
        uint256 tokenToMint = tokenToMint(_to);
        if (tokenToMint == 0) {
            return false;
        }
        _mint(_to, tokenToMint);
        _decreasePendingTokens(_to, tokenToMint);
        return true;
    }

    function tokenToMint(address _to) public view returns (uint256) {
        uint256 result = 0;
        for (uint i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 percentage = blend[token];
            uint256 pendingToken = pendingTokens[_to][token];

            uint256 possible = pendingToken / percentage;
            if (possible < result || result == 0) {
                result = possible;
            }
        }
        return result;
    }

    function _decreasePendingTokens(address _to, uint256 _value) internal {
        for (uint i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 percentage = blend[token];
            pendingTokens[_to][token] -= _value * percentage;
        }
    }
}