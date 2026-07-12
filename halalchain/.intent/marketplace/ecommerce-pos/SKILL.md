Skill: E-Commerce / POS Agent

ID: @halalchain/marketplace#ecom-pos-agent
For: Middleware sync (Shopify, WooCommerce, Magento), offline‑first POS, and bulk catalog updates.

🧠 Current Trends

· Change Data Capture (CDC) – Agent listens to PostgreSQL pgoutput and streams changes to external platforms via Debezium.
· Webhook Mesh – Agent validates and enriches incoming webhooks before broadcasting to subscribers.
· Conflict Resolution – Uses CRDTs (Conflict‑free Replicated Data Types) for inventory across multiple POS terminals.

🤖 Agent Tools

```python
@tool
def shopify_sync_products(batch: List[dict]) -> dict:
    """Upsert products to Shopify Admin API with rate‑limiting (2 calls/sec)."""

@tool
def resolve_inventory_conflict(product_id: str, store_a_qty: int, store_b_qty: int) -> int:
    """Apply CRDT merge logic (Last Write Wins with timestamps)."""

@tool
def restore_offline_orders(pos_device_id: str) -> list:
    """Pull queued orders from local SQLite cache and push to central DB."""
```

🧩 MCP Integration

Expose the CDC stream as an MCP resource resource://halalchain/inventory/stream so other agents can subscribe.

📊 Dashboard

Agent automatically generates a Grafana panel showing sync latency per platform.

