// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './interfaces/IReputationToken.sol';

/**
 * @title ReputationToken
 * @notice Soulbound NFT (ERC-5192 inspired) representing AVAXVERSE achievements.
 *         Tokens are non-transferrable once minted. Each user can hold multiple tokens.
 *         A global reputation score is maintained separately for UX convenience.
 */
contract ReputationToken is IReputationToken, ERC721, Ownable, ReentrancyGuard {
    // --- State ---
    uint256 private _nextTokenId;

    // tokenId => achievement URI
    mapping(uint256 => string) private _achievementURIs;

    // user address => total reputation score
    mapping(address => uint256) private _scores;

    // authorized minters (e.g., EscrowFactory)
    mapping(address => bool) private _minters;

    // --- Errors ---
    error SoulboundTransferForbidden();

    // --- Constructor ---
    constructor() ERC721('AVAXVERSE Reputation', 'AVXREP') Ownable(msg.sender) {}

    // --- External Functions ---

    /**
     * @notice Mint a soulbound achievement NFT to a user.
     * @param to Recipient address.
     * @param achievementURI IPFS URI describing the achievement.
     */
    function mintAchievement(address to, string calldata achievementURI)
        external
        override
        nonReentrant
    {
        require(_minters[msg.sender] || msg.sender == owner(), 'ReputationToken: not authorized');
        require(bytes(achievementURI).length > 0, 'ReputationToken: URI required');

        uint256 tokenId = _nextTokenId++;
        _achievementURIs[tokenId] = achievementURI;
        _safeMint(to, tokenId);

        emit Locked(tokenId);
        emit Minted(to, tokenId, achievementURI);
    }

    /**
     * @notice Update a user's aggregate reputation score.
     */
    function updateScore(address user, uint256 newScore) external override {
        require(_minters[msg.sender] || msg.sender == owner(), 'ReputationToken: not authorized');
        _scores[user] = newScore;
        emit ScoreUpdated(user, newScore);
    }

    /**
     * @notice Authorize an address to mint achievements or update scores.
     */
    function setMinter(address minter, bool authorized) external onlyOwner {
        _minters[minter] = authorized;
    }

    // --- Views ---
    function getScore(address user) external view override returns (uint256) {
        return _scores[user];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _achievementURIs[tokenId];
    }

    /**
     * @notice All tokens are soulbound — locking is permanent.
     */
    function locked(uint256) external pure override returns (bool) {
        return true;
    }

    // --- Soulbound: Block All Transfers ---
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)), block everything else
        if (from != address(0)) revert SoulboundTransferForbidden();
        return super._update(to, tokenId, auth);
    }
}
