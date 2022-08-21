//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// This is the main building block for smart contracts.
contract MyErc721 is ERC721 {
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}
}
