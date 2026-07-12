Skill: IPFS (Shared Utility)

ID: @halalchain/shared#ipfs-utils
For: Uploading, pinning, retrieving, and verifying certificate files on IPFS/Filecoin. Used by blockchain, logistics, and certification agents.

---

🧠 Current Trends

· Filecoin Storage Deals – Automatically triggers a storage deal for long‑term archival (via @filecoin-sdk).
· IPFS Gateway Selection – Falls back between pinata.cloud, dweb.link, and self‑hosted nodes based on latency.
· Content‑Addressed Verification – Computes SHA‑256/CIDv1 to ensure downloaded files match the on‑chain hash.
· IPNS (InterPlanetary Name System) – Used for mutable certificates (e.g., updating a certificate without changing the NFT URI).

---

📦 Agent Tools (Python / JavaScript)

Python (using ipfshttpclient + pinata)

```python
import ipfshttpclient
import requests
import hashlib
from pathlib import Path

@tool
def upload_certificate_pdf(file_path: str, pin_to_pinata: bool = True) -> dict:
    """
    Upload a PDF certificate to IPFS.
    - If pin_to_pinata is True, pins to Pinata for high‑availability.
    - Returns {'cid': 'Qm...', 'ipfs_url': 'ipfs://Qm...', 'gateway_url': '...'}
    """
    with open(file_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
    res = client.add(file_path, recursive=True)
    cid = res['Hash']

    if pin_to_pinata:
        # Pinata pinning via REST API
        headers = {"Authorization": f"Bearer {os.getenv('PINATA_JWT')}"}
        files = {'file': (Path(file_path).name, open(file_path, 'rb'))}
        resp = requests.post("https://api.pinata.cloud/pinning/pinFileToIPFS",
                             files=files, headers=headers)
        if resp.status_code != 200:
            raise Exception("Pinata pinning failed")

    return {
        "cid": cid,
        "ipfs_url": f"ipfs://{cid}",
        "gateway_url": f"https://gateway.pinata.cloud/ipfs/{cid}",
        "sha256": file_hash
    }

@tool
def retrieve_certificate(cid: str) -> bytes:
    """
    Fetch the certificate content from the best available IPFS gateway.
    Uses a fallback chain: self‑hosted -> Pinata -> dweb.link -> cloudflare.
    """
    gateways = [
        f"http://localhost:8080/ipfs/{cid}",  # local node
        f"https://gateway.pinata.cloud/ipfs/{cid}",
        f"https://ipfs.io/ipfs/{cid}",
        f"https://cloudflare-ipfs.com/ipfs/{cid}"
    ]
    for g in gateways:
        try:
            resp = requests.get(g, timeout=5)
            if resp.status_code == 200:
                return resp.content
        except:
            continue
    raise Exception("All IPFS gateways failed")

@tool
def verify_ipfs_integrity(cid: str, expected_sha256: str) -> bool:
    """Download the file and check if its SHA‑256 matches."""
    content = retrieve_certificate(cid)
    actual_hash = hashlib.sha256(content).hexdigest()
    return actual_hash == expected_sha256

@tool
def publish_ipns(cid: str, key_name: str = "certifier") -> str:
    """
    Publish an IPNS name pointing to the latest CID.
    Useful when certificates are updated but the NFT still points to the same IPNS address.
    """
    client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
    res = client.name.publish(cid, key=key_name)
    return res['Name']  # e.g., "/ipns/k51qzi5uqu5..."
```

JavaScript (Node.js – using @pinata/sdk + @filecoin-sdk)

```javascript
import pinataSDK from '@pinata/sdk';
import { create } from '@filecoin-sdk/js';
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET);

const filecoin = create({ token: process.env.FILECOIN_TOKEN });

@tool
async function filecoinArchive(cid: string, durationDays: number = 365) {
    // Store the existing CID on Filecoin for permanent archival
    const deal = await filecoin.client.upload.deal(cid, { duration: durationDays * 86400 });
    return { deal_id: deal.dealId, miner: deal.miner };
}
```

---

🔄 Event‑Driven Pinning

When the blockchain agent mints a new certificate, it emits an event. The IPFS module subscribes to this event and automatically re‑pins the IPFS content to 3 different providers (Pinata, Filecoin, local cluster).

Kafka subscription:

```yaml
# ipfs-listener/config.yaml
topics:
  - cert.minted
  - cert.revoked
actions:
  cert.minted: pin_to_multiple
  cert.revoked: unpin_from_gateways
```

---

🧪 Testing IPFS Module

```bash
# Start local IPFS daemon
ipfs daemon

# Load the skill and test upload
npx @tanstack/intent@latest load @halalchain/shared#ipfs-utils
# Agent: "Upload the certificate /tmp/cert.pdf and return the IPFS URL"
```

---

📋 Integration with QR Codes

The blockchain agent uses retrieve_certificate() to fetch the actual PDF from IPFS before generating the QR payload, ensuring the QR always resolves to a live, uncorrupted file.

QR payload format:

```
halalchain://ethereum/0x123.../42?ipfs=QmAbc...&zkproof=0xdef...
```

The consumer app decodes this, calls the blockchain agent's verify_qr_payload tool, and fetches the PDF from the IPFS gateway to display the full certificate.

---

📚 References

· IPFS Cluster setup: /infrastructure/ipfs/cluster-config.json
· Pinata JWT rotation: /secrets/pinata.env
· CIDv1 specification: https://github.com/multiformats/cid

