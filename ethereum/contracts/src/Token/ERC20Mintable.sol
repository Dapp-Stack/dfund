pragma solidity ^0.5.0;

import "./Mixin/ERC20.sol";
import "./Mixin/ApproveAndCallFallback.sol";

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 */
contract ERC20Mintable is ERC20 {
    uint256 private _totalSupply = 0;

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 value) public returns (bool) {
        _mint(to, value);
        return true;
    }

    function approveAndCall(
        address _spender,
        uint256 _amount,
        bytes memory _extraData
    ) 
        public
        returns (bool success)
    {
        require(approve(_spender, _amount), "Not approved");

        ApproveAndCallFallBack(_spender).receiveApproval(
            msg.sender,
            _amount,
            address(this),
            _extraData
        );

        return true;
    }
}