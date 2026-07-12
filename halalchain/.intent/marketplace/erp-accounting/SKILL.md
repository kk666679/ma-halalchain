Skill: ERP / Accounting Agent

ID: @halalchain/marketplace#erp-agent
For: Syncing orders/inventory with SAP/Odoo, generating Xero invoices, and tax compliance automation.

🧠 Current Trends

· RAG (Retrieval‑Augmented Generation) over financial regulations (e.g., local VAT/GST laws).
· Automated Reconciliation – Agent matches bank statements with ledger entries using fuzzy matching.
· Vendor Portal – Self‑service agent that answers "How much did I earn last quarter?" in natural language.

🤖 Agent Tools

```python
@tool
def sync_odoo_order(order_id: str) -> bool:
    """Push HalalChain order to Odoo via XML‑RPC."""

@tool
def generate_xero_invoice(order_id: str, tax_code: str) -> str:
    """Create a draft invoice in Xero; returns invoice_id."""

@tool
def query_financial_rag(question: str) -> str:
    """Query the vector store containing tax codes and compliance docs."""
```

🛡️ Guardrails

· Agent refuses to delete financial records unless force=True and a human supervisor approves via Slack.
· All mutation calls are idempotent using X-Idempotency-Key.

🔍 Traceability

Add @observe() decorator to every tool to trace execution time and token usage in LangSmith.

