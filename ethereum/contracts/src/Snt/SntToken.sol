pragma solidity ^0.5.0;

import "./../Token/ERC20Mintable.sol";

contract SntToken is ERC20Mintable {
    uint8 constant public decimals = 18;
    string constant public name = "Status Token";
    string constant public symbol = "SNT";
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
}
