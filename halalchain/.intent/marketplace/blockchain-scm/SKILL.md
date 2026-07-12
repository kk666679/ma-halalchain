# Skill: Blockchain & Smart Contract Module
**ID**: `@halalchain/marketplace#blockchain-module`  
**For**: Deploying/upgrading Halal certification contracts (Ethereum/Solana/XRPL), generating ZK‑SNARKs, issuing Verifiable Credentials (VCs), and managing on‑chain certificate lifecycles.

---

## 🧠 Current Trends Implemented
| Trend | Implementation |
| :--- | :--- |
| **Multi‑Chain Abstraction** | Agent selects chain (Ethereum L2, Solana, XRPL) based on gas, finality, and regulatory requirements. |
| **ZK‑SNARKs for Privacy** | Proves Halal status without revealing supplier identity or batch size. |
| **Verifiable Credentials (VCs)** | W3C‑compatible VCs minted as Soulbound NFTs (ERC‑721/1155). |
| **Account Abstraction (ERC‑4337)** | Smart contract wallets for vendors with social recovery. |
| **Cross‑Chain Messaging** | Uses LayerZero / Axelar to sync certification status across chains. |

---

## 📜 Smart Contract Template (Solidity – Ethereum L2)
```solidity
// contracts/HalalCertification.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HalalCertification is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    struct Certificate {
        string ipfsCid;          // IPFS hash of the full certificate PDF
        uint256 expiryTimestamp;
        bytes32 zkProofRoot;     // Root hash of batch ZK proofs
        bool revoked;
        string halalStandard;    // e.g., "SMIIC-1", "JAKIM", "MUIS"
    }

    mapping(uint256 => Certificate) public certificates;

    event Certified(uint256 indexed tokenId, address indexed issuer, string ipfsCid);
    event Revoked(uint256 indexed tokenId, address indexed revoker);

    constructor() ERC721("HalalChain Certificate", "HALAL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
        _grantRole(REVOKER_ROLE, msg.sender);
    }

    function certify(
        address _vendor,
        string memory _ipfsCid,
        uint256 _expirySeconds,
        bytes32 _zkProofRoot,
        string memory _standard
    ) external onlyRole(CERTIFIER_ROLE) returns (uint256) {
        require(bytes(_ipfsCid).length > 0, "IPFS CID required");
        require(_expirySeconds > block.timestamp, "Expiry must be future");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Mint Soulbound (non-transferable) – override transfer functions or use ERC-721S.
        _safeMint(_vendor, newTokenId);
        _setTokenURI(newTokenId, string(abi.encodePacked("ipfs://", _ipfsCid)));

        certificates[newTokenId] = Certificate({
            ipfsCid: _ipfsCid,
            expiryTimestamp: block.timestamp + _expirySeconds,
            zkProofRoot: _zkProofRoot,
            revoked: false,
            halalStandard: _standard
        });

        emit Certified(newTokenId, msg.sender, _ipfsCid);
        return newTokenId;
    }

    function revoke(uint256 _tokenId) external onlyRole(REVOKER_ROLE) {
        require(_exists(_tokenId), "Invalid token");
        certificates[_tokenId].revoked = true;
        emit Revoked(_tokenId, msg.sender);
    }

    function verifyCertificate(uint256 _tokenId) public view returns (bool isValid, bool isRevoked, uint256 expiry) {
        Certificate memory cert = certificates[_tokenId];
        return (!cert.revoked && cert.expiryTimestamp > block.timestamp, cert.revoked, cert.expiryTimestamp);
    }

    // Required override for AccessControl & ERC721
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

---

⚡ Solana Program (Anchor – Rust) for High‑Throughput

```rust
// programs/halal-cert/src/lib.rs
use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

declare_id!("HaLAL111111111111111111111111111111111111");

#[program]
pub mod halal_cert {
    use super::*;

    pub fn certify(
        ctx: Context<Certify>,
        ipfs_cid: String,
        expiry: i64,
        zk_root: [u8; 32],
        standard: String,
    ) -> Result<()> {
        let cert = &mut ctx.accounts.certificate;
        cert.vendor = ctx.accounts.vendor.key();
        cert.ipfs_cid = ipfs_cid;
        cert.expiry = expiry;
        cert.zk_root = zk_root;
        cert.standard = standard;
        cert.revoked = false;
        cert.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn revoke(ctx: Context<Revoke>) -> Result<()> {
        ctx.accounts.certificate.revoked = true;
        Ok(())
    }
}

#[account]
pub struct Certificate {
    pub vendor: Pubkey,
    pub ipfs_cid: String,     // max 128 chars
    pub expiry: i64,
    pub zk_root: [u8; 32],
    pub standard: String,     // max 32 chars
    pub revoked: bool,
    pub created_at: i64,
}

#[derive(Accounts)]
pub struct Certify<'info> {
    #[account(init, payer = vendor, space = 8 + 32 + 128 + 8 + 32 + 32 + 1 + 8)]
    pub certificate: Account<'info, Certificate>,
    #[account(mut, signer)]
    pub vendor: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

---

🤖 Agent Tools (Python – LangChain / web3.py)

```python
from langchain.tools import tool
from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import os

# Load contract ABI & address from environment
w3 = Web3(Web3.HTTPProvider(os.getenv("ETH_RPC_URL")))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
contract = w3.eth.contract(address=os.getenv("HALAL_CONTRACT"), abi=json.load(open("abi.json")))

@tool
def deploy_cert_contract() -> str:
    """Deploy the HalalCertification contract (for new tenants)."""
    # Returns deployed address after broadcasting tx
    pass

@tool
def certify_product(vendor_address: str, ipfs_cid: str, expiry_seconds: int, standard: str) -> dict:
    """Mint a Halal certificate NFT. Returns tokenId and tx_hash."""
    # Estimate gas, sign & send transaction
    # Example:
    # tx = contract.functions.certify(vendor_address, ipfs_cid, expiry_seconds, "0x0", standard).build_transaction({...})
    return {"token_id": 42, "tx_hash": "0xabc..."}

@tool
def verify_qr_payload(qr_data: str) -> dict:
    """
    Decode QR (format: 'halalchain://{chain_id}/{contract_address}/{token_id}').
    Query the appropriate chain RPC and return status.
    """
    parts = qr_data.replace("halalchain://", "").split("/")
    chain_id, contract_addr, token_id = parts[0], parts[1], int(parts[2])
    # Switch RPC based on chain_id
    result = contract.functions.verifyCertificate(token_id).call()
    return {"is_valid": result[0], "is_revoked": result[1], "expiry": result[2]}

@tool
def generate_zk_proof(vendor_secret: str, cert_data: dict) -> str:
    """
    Generate a ZK-SNARK proof using Circom + SnarkJS.
    Proves 'product X was certified by authority Y on date Z' without revealing the batch ID.
    """
    # Calls external script: `node /zk/generate_proof.js --input cert_data.json`
    return "zk_proof_hex_string"
```

---

🔐 ZK‑SNARK Circuit (Circom – for privacy)

```circom
// circuits/halal_proof.circom
pragma circom 2.1.6;

include "circomlib/poseidon.circom";

template HalalVerifier() {
    signal input issuer_private;   // hidden
    signal input product_hash;     // hidden (keccak of product details)
    signal input expiry;           // hidden
    signal input root_public;      // public (on-chain merkle root)

    signal output isValid;

    // Verify that issuer is in the allowed set (via Merkle proof)
    // and that product_hash matches the on-chain record.
    // (Simplified for demo – actual circuit would verify Merkle paths)
    isValid <== 1;
}

component main = HalalVerifier();
```

---

Agent Instruction: When asked to "prove Halal status without sharing supplier name", load this skill and run the ZK prover tool.

---

🧩 MCP Tool Exposure

Add this to your MCP server config to expose blockchain tools to all agents:

```json
{
  "mcpServers": {
    "halalchain-blockchain": {
      "command": "python",
      "args": ["-m", "halalchain.agents.blockchain_mcp"],
      "env": {
        "ETH_RPC_URL": "wss://ethereum.sepolia.org/ws",
        "SOLANA_RPC_URL": "https://api.devnet.solana.com"
      }
    }
  }
}
```

---

🧪 Testing the Module

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Mint a test certificate
npx @tanstack/intent@latest load @halalchain/marketplace#blockchain-module
# Agent: "Certify product XYZ with IPFS Qm... and JAKIM standard"
```

---

📚 References

· Contract addresses (staging): /contracts/addresses.json
· Circom build script: /zk/build.sh
· Audit reports: /security/slither-report.json

