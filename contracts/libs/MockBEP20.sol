pragma solidity 0.8.0;

// SPDX-License-Identifier: agpl-3.0

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBEP20 is ERC20 {
  constructor(
    string memory name,
    string memory symbol,
    uint256 supply
  ) public ERC20(name, symbol) {
    _mint(msg.sender, supply);
  }
}
