Skill: Payments Agent

ID: @halalchain/marketplace#payments-agent
For: Processing fiat and crypto payments, BNPL, PCI‑DSS compliance, and MyHalal token escrow.

🧠 Current Trends

· Native Function Calling – Agent uses @tool decorators to call Stripe/Midtrans/XRPL APIs.
· Retry & Fallback – Built‑in exponential backoff with circuit‑breakers (Resilience4j pattern).
· Explainable AI – Agent logs reasoning for every payment decision (e.g., why a transaction was flagged for manual review).

🤖 Agent Tools (LangChain)

```python
from langchain.tools import tool

@tool
def create_stripe_payment_intent(amount: float, currency: str, customer_id: str) -> dict:
    """Create a Stripe PaymentIntent and return client_secret."""
    # Implementation

@tool
def initiate_halal_escrow(buyer: str, seller: str, token_amount: int, ipfs_cert_hash: str) -> str:
    """Invoke the XRPL escrow contract. Returns transaction hash."""
    # Smart contract call

@tool
def validate_pci_token(token: str) -> bool:
    """Check PCI‑DSS token expiry and format."""
```

⛑️ Human‑in‑the‑Loop

Add interrupt_before=["execute_escrow"] to require a human manager to approve any escrow release > 10,000 MYR.

📈 Observability

All payment agent calls are traced via LangSmith with custom tags agent=payments, environment=production.

🚀 Usage

```bash
npx @tanstack/intent@latest load @halalchain/marketplace#payments-agent
# Agent now responds to: "Process a 500 USD payment using Stripe" or "Lock 10k MyHalal tokens in escrow"
```

