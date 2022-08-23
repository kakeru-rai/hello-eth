//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// This is the main building block for smart contracts.
contract MyErc721 is ERC721, ERC721Enumerable {
    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function hello(string memory name) external pure returns (string memory) {
        return string.concat("hello ", name, ".");
    }

    function describe() external view returns (string memory) {
        return string.concat(name(), ",", symbol());
    }

    function describe(uint256 tokenId) external view returns (string memory) {
        return
            string.concat(
                tokenURI(tokenId),
                ",",
                toString(ownerOf(tokenId)),
                ",",
                toString(getApproved(tokenId))
            );
    }

    function msgSender() external view virtual returns (address) {
        return _msgSender();
    }

    function msgData() external view virtual returns (bytes calldata) {
        return _msgData();
    }

    // ERC721Enumerable
    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    /*
ERC721
    function balanceOf(address owner) external view returns (uint256 balance);

    function tokenURI(uint256 tokenId) external view returns (string memory);    
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);

    function isApprovedForAll(address owner, address operator) external view returns (bool);

ERC721 Netadata

ERC165
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
    
*/
}

// TODO: ライブラリとして切り出す
function toString(address account) pure returns (string memory) {
    return toString(abi.encodePacked(account));
}

function toString(uint256 value) pure returns (string memory) {
    return toString(abi.encodePacked(value));
}

function toString(bytes32 value) pure returns (string memory) {
    return toString(abi.encodePacked(value));
}

function toString(bytes memory data) pure returns (string memory) {
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint i = 0; i < data.length; i++) {
        str[2 + i * 2] = alphabet[uint(uint8(data[i] >> 4))];
        str[3 + i * 2] = alphabet[uint(uint8(data[i] & 0x0f))];
    }
    return string(str);
}
