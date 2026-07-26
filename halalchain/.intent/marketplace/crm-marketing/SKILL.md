# CRM / Marketing Agent
**ID**: `@halalchain/marketplace#crm-agent`  
**Purpose**: Sync customer data with HubSpot/Salesforce, execute email and WhatsApp campaigns, manage loyalty rewards, and predict customer lifetime value (CLV) using deep learning.

---

## 📌 Current Trends

- **Predictive CLV** – A Deep & Cross Network (DCN) model, served via a REST endpoint, forecasts future spending and churn probability for each customer.
- **Hyper‑personalization** – Reinforcement learning (PPO) generates dynamic product bundles tailored to individual preferences and purchase history.
- **Token‑Gated Campaigns** – Special offers are restricted to users holding >500 MyHalal tokens; the agent verifies token balances via blockchain RPC.
- **Explainable Segmentation** – The agent always provides a human‑readable reason for every segment assignment and campaign targeting decision.
- **Privacy‑by‑Design** – PII is pseudonymised; GDPR/CCPA deletion requests are fully automated.

---

## 🔧 Agent Tools

```python
@tool
def sync_hubspot_contact(customer_id: str) -> str:
    """Upsert contact in HubSpot, enriching with latest order history and token balance. Returns contact ID."""

@tool
def trigger_whatsapp_campaign(segment_id: str, template_name: str) -> int:
    """Send a campaign via Twilio API; returns message_id."""

@tool
def calculate_clv(customer_id: str) -> float:
    """Query the ML serving endpoint for predicted lifetime value (USD)."""

@tool
def get_token_balance(wallet_address: str) -> float:
    """Query blockchain for MyHalal token balance."""

@tool
def generate_personalized_bundle(customer_id: str) -> list:
    """Use PPO model to suggest a product bundle for the customer."""
```

---

## 🛡️ Guardrails & Safety

- **Token Gate** – Campaigns flagged as `token_gated` are only sent to users with token balance > 500; others receive a generic alternative or are excluded.
- **Consent Enforcement** – The agent checks opt‑in status for each channel (email, WhatsApp, push) before sending any message.
- **Rate Limiting** – Per‑segment and per‑day campaign limits are enforced to avoid spam.
- **Idempotency** – All sync and campaign triggers use `X-Idempotency-Key` to prevent duplicates.
- **PII Pseudonymisation** – Before any tool call, the agent replaces name, email, and phone with hashed identifiers; only the downstream systems (HubSpot/Salesforce) store raw PII.

---

## 🔍 Observability & Traceability

- **LangSmith** – Every tool is decorated with `@observe()`; execution time, token usage, and inputs/outputs are traced.
- **Segment Reasoning Log** – Each time a customer is assigned to a segment, the agent logs the rationale (e.g., “CLV > $500 AND 3 email opens in last month”).
- **Campaign Performance** – Open rates, click‑throughs, and conversions are fed back into the DCN model for continuous improvement.

---

## 📦 Deployment & Scaling

- **Kubernetes** with HPA based on custom metric `campaign_queue_length`.
- **ML Serving** – The DCN model runs on a dedicated KServe InferenceService, scaled independently.
- **Redis Cache** – Token balances and CLV scores are cached for 15 minutes to reduce API calls.

---

## 🧠 Reasoning & Explainability

The agent always returns a short explanation when assigning a contact to a segment or selecting a campaign. Example:

> *“User A is assigned to ‘High‑Value Loyal’ segment because their predicted CLV is $2,100 (above threshold $1,500) and they have opened 3 out of the last 5 emails. They also hold 1,200 MyHalal tokens, making them eligible for the token‑gated offer.”*

---

## 🔐 Privacy & Compliance

- **GDPR/CCPA** – The agent supports automated data deletion requests:
  1. Accepts a deletion request via API or webhook.
  2. Purges pseudonymised identifiers from its local cache and logs.
  3. Triggers deletion in HubSpot/Salesforce via their APIs.
  4. Returns a confirmation receipt.
- **Pseudonymisation** – All internal processing uses `hash(email + salt)`; real PII is only stored in downstream systems with proper consent.

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Sync latency (HubSpot) | < 3s |
| Campaign trigger latency | < 5s |
| CLV prediction latency | < 1s |
| Personalization bundle generation | < 2s |
| Campaign delivery success rate | ≥ 98% |
| Segmentation explanation coverage | 100% |

---

## 🚀 Getting Started

1. Clone: `git clone https://github.com/halalchain/crm-agent.git`
2. Install: `poetry install`
3. Set env vars (HubSpot/Salesforce API keys, Twilio credentials, ML endpoint URL, blockchain RPC).
4. Run: `python main.py`
5. Deploy: `kubectl apply -f k8s/`

---

## 📝 License & Support

Proprietary – contact `support@halalchain.xyz`.
