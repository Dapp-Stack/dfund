pragma solidity ^0.5.0;

import "./Mixin/Ownable.sol";
import "./Democracy.sol";

contract Fund is Ownable, ERC20Mintable, ApproveAndCallFallBack {

    string public name;
    string public symbol;
    uint256 public _totalSupply = 0;
    Democracy democracy;

    mapping(address => uint256) public blend;

    mapping(address => mapping(address => uint256)) public pendingTokens;
    
    constructor(string memory _name, string memory _symbol, address[] memory tokens, uint256[] memory percentages) public {
        require(tokens.length == percentages.length, "Tokens and percentages do not match");

        name = _name;
        symbol = _symbol;

        uint sum = 0;
        for (uint i = 0; i < tokens.length; i++) {
            sum += percentages[i];
            require(sum <= 100, "Percentages overflow");
            blend[tokens[i]] = percentages[i];
        }
        require(sum == 100, "Percentages must be equal to 100");

        democracy = new Democracy(address(this), 1);
        _owner = address(democracy);
    }

    function receiveApproval(address from, uint256 _amount, address _token, bytes memory _data) public {
        ERC20Mintable token = ERC20Mintable(_token);
        token.transferFrom(from, address(this), _amount);

        pendingTokens[from][_token] += _amount;
    }

    function mint(uint256 value) public returns (bool) {
        require(enoughPendingTokensToMint(value), "Not enough token");
        _mint(msg.sender, value);
        return true;
    }

    function enoughPendingTokensToMint(uint256 _value) public returns (bool) {
    }
}