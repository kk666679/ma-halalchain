# Skill: ERP / Accounting Agent

**ID:** `@halalchain/marketplace#erp-agent`

## Purpose

The ERP / Accounting Agent is responsible for synchronizing financial and operational data between HalalChain Marketplace and external ERP/accounting platforms while ensuring auditability, compliance, and idempotent execution.

Primary responsibilities include:

- Sync marketplace orders into ERP systems
- Update inventory levels
- Generate accounting documents
- Perform tax validation
- Answer finance/compliance questions using RAG
- Support reconciliation workflows
- Produce complete audit trails

---

# Responsibilities

## Order Synchronization

- Push marketplace orders into Odoo
- Push purchase orders into SAP
- Retry failed synchronization safely
- Prevent duplicate ERP records
- Synchronize:

  - Customer
  - Products
  - Taxes
  - Discounts
  - Shipping
  - Payment status
  - Invoice references

---

## Inventory Synchronization

Update inventory after:

- Purchase
- Refund
- Cancellation
- Manual adjustment
- Warehouse transfer

Support:

- Odoo Inventory
- SAP MM
- Multi-warehouse inventory

---

## Invoice Generation

Generate draft invoices inside:

- Xero
- Odoo Accounting
- SAP FI

Automatically calculate:

- GST
- VAT
- SST
- Regional tax rules

---

## Financial Compliance

Consult financial regulations using Retrieval-Augmented Generation (RAG).

Examples:

- Malaysia SST
- Singapore GST
- Indonesia VAT
- UAE VAT
- EU VAT

Agent answers questions like:

> Which tax code applies to exported halal food?

> Is SST charged for digital services?

> Can this invoice be zero-rated?

---

## Automated Reconciliation

Compare:

- Bank statements
- ERP ledger
- Marketplace payouts

Use:

- Fuzzy amount matching
- Date tolerance
- Reference matching
- Customer matching

Flag:

- Missing payments
- Duplicate payments
- Partial settlements
- Chargebacks

---

## Vendor Portal Assistant

Answer natural-language financial questions.

Examples:

- How much did I earn last quarter?
- Show unpaid invoices.
- Which customers owe money?
- Revenue by product category.
- Monthly GST collected.
- Inventory valuation.
- Profit margin by supplier.

---

# Current Trends

## Retrieval-Augmented Generation (RAG)

Use vector search over:

- Tax regulations
- Accounting standards
- Internal finance SOPs
- ERP documentation
- Invoice policies
- Compliance manuals

---

## AI Reconciliation

Automatically reconcile:

- Bank transactions
- ERP journals
- Marketplace payouts

Using semantic + fuzzy matching.

---

## Conversational Finance

Natural-language analytics powered by:

- SQL generation
- Vector search
- BI datasets
- ERP APIs

---

# Agent Tools

```python
from langsmith import observe

@observe()
@tool
def sync_odoo_order(
    order_id: str,
    idempotency_key: str,
) -> bool:
    """
    Push HalalChain order to Odoo via XML-RPC.

    Idempotent operation.
    """

@observe()
@tool
def sync_sap_sales_order(
    order_id: str,
    idempotency_key: str,
) -> bool:
    """
    Create SAP Sales Order.
    """

@observe()
@tool
def update_inventory(
    sku: str,
    warehouse: str,
    quantity: int,
    idempotency_key: str,
) -> bool:
    """
    Synchronize inventory.
    """

@observe()
@tool
def generate_xero_invoice(
    order_id: str,
    tax_code: str,
    idempotency_key: str,
) -> str:
    """
    Generate draft invoice.

    Returns invoice_id.
    """

@observe()
@tool
def reconcile_bank_statement(
    statement_id: str,
) -> dict:
    """
    Match bank transactions
    against ERP ledger.
    """

@observe()
@tool
def query_financial_rag(
    question: str,
) -> str:
    """
    Search tax regulations,
    accounting policies,
    compliance manuals,
    and finance SOPs.
    """

@observe()
@tool
def answer_vendor_finance_question(
    vendor_id: str,
    question: str,
) -> str:
    """
    Natural-language financial analytics.
    """
```

---

# Guardrails

## Financial Record Protection

The agent MUST refuse:

- Delete invoice
- Delete journal
- Delete payment
- Delete ledger
- Delete tax record

Unless ALL conditions are satisfied:

- `force=True`
- Human approval received
- Slack approval workflow completed
- Audit event recorded

---

## Idempotency

Every mutation operation must include:

```
X-Idempotency-Key
```

Supported operations:

- Invoice creation
- ERP sync
- Inventory update
- Payment posting
- Purchase order creation
- Credit note creation

---

## Compliance

The agent must never:

- Guess tax codes
- Invent accounting entries
- Modify closed accounting periods
- Post journals without validation
- Backdate invoices without approval

When uncertain:

- Query Financial RAG
- Escalate to human reviewer

---

# Observability

Every tool must use:

```python
@observe()
```

Capture:

- Execution time
- Token usage
- Cost
- Input
- Output
- Errors
- Retry count
- User ID
- Organization ID
- ERP transaction ID

Export traces to:

- LangSmith
- OpenTelemetry
- Grafana Tempo

---

# Error Handling

Automatically retry:

- Network timeout
- ERP unavailable
- XML-RPC timeout
- HTTP 429
- Temporary authentication failure

Never retry:

- Validation errors
- Duplicate invoices
- Invalid tax code
- Closed accounting period
- Permission denied

---

# Security

- OAuth2 / SSO authentication
- Role-Based Access Control (RBAC)
- Organization-level tenant isolation
- Encrypted financial payloads
- Immutable audit logs
- Secret management via Vault or cloud secret manager

---

# KPIs

- ERP synchronization success rate
- Invoice generation latency
- Reconciliation accuracy
- Duplicate transaction rate
- Tax validation accuracy
- Compliance violations
- Average retry count
- Mean tool execution time
- Vendor query response time

---

# Example Workflow

1. Marketplace order is completed.
2. Agent validates tax jurisdiction.
3. Financial RAG determines the appropriate tax code.
4. Inventory is synchronized to ERP.
5. Sales order is created in Odoo or SAP.
6. Draft invoice is generated in Xero.
7. Accounting entry is recorded.
8. Audit log is written.
9. LangSmith trace is captured.
10. Vendor dashboard is updated with the latest financial data.
