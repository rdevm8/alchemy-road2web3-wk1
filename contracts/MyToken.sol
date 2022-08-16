// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error MyToken__MaxSupplyReached();
error MyToken__NeedMoreETHSent();
error MyToken__TransferFailed();
error MyToken__MaxMintReached();

contract MyToken is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;

    mapping(address => uint256) private s_addressToCntMinted;

    uint256 private immutable i_maxSupply;
    uint256 private immutable i_mintFee;
    uint256 private immutable i_maxMint;
    Counters.Counter private s_tokenIdCounter;
    

    constructor(uint256 maxSupply, uint256 mintFee, uint256 maxMint, string memory tokenName, string memory tokenSymbol) ERC721(tokenName,tokenSymbol) {
        i_maxSupply = maxSupply;
        i_mintFee = mintFee;
        i_maxMint = maxMint;
    }

    function safeMint(string memory uri) public payable {
        uint256 tokenId = s_tokenIdCounter.current();
        uint256 tokenMinted = s_addressToCntMinted[msg.sender];
        if (msg.value < i_mintFee) {
            revert MyToken__NeedMoreETHSent();
        }

        if (tokenId >= i_maxSupply) {
            revert MyToken__MaxSupplyReached();
        }

        if (tokenMinted == i_maxMint) {
            revert MyToken__MaxMintReached();
        }

        s_tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        s_addressToCntMinted[msg.sender] = tokenMinted + 1;
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;

        (bool success,) = payable(msg.sender).call{value: amount}("");

        if (!success) {
            revert MyToken__TransferFailed();
        }
    }

    function _beforeTokenTransfer(address from,address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override (ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenIdCounter.current();
    }

    function getMaxSupply() public view returns (uint256) {
        return i_maxSupply;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getMintCount(address owner) public view returns (uint256) {
        return s_addressToCntMinted[owner];
    }

    function getMaxMint() public view returns (uint256) {
        return i_maxMint;
    }

}