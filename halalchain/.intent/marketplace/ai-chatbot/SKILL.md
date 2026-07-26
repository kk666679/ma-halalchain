# AI / Chatbot Agent
**ID**: `@halalchain/marketplace#ai-agent`  
**Purpose**: Build and deploy LangChain/ReAct agents, voice assistants (Alexa/Google), and fine‑tune LLMs for Halal commerce.

---

## 📌 Current Trends

- **ReAct Pattern** – The agent iteratively *Thinks → Acts → Observes* to solve multi‑step queries (e.g., checking certification status and then booking an inspection).
- **AutoGen Multi‑Agent Debate** – Two agents (Optimist vs. Skeptic) validate Halal certification claims and present a balanced verdict before the final answer.
- **Voice + Text Unified** – A single state machine handles both text inputs and ASR (Automatic Speech Recognition) intents, enabling seamless cross‑channel experiences.
- **Fine‑Tuning Pipeline** – Automated weekly LoRA fine‑tuning on failure logs to improve accuracy.

---

## 🔧 Agent Tools

```python
@tool
def query_halal_knowledge_base(question: str) -> str:
    """RAG over Halal certification PDFs, SMIIC standards, and fatwas (vector store)."""

@tool
def book_inspection(appointment_data: dict) -> str:
    """Book a physical Halal inspection via the JAKIM API. Returns booking ID."""

@tool
def generate_voice_response(text: str) -> bytes:
    """TTS using ElevenLabs; returns MP3 bytes for Alexa/Google."""

@tool
def check_inventory(product_id: str) -> int:
    """Query inventory system for current stock level."""

@tool
def process_payment(order_data: dict) -> str:
    """Process payment via Stripe/PayPal; returns transaction ID."""
```

---

## 🛡️ Guardrails & Safety

- **Permission Enforcement** – Only authorised users (e.g., certified facility admins) can book inspections; guest users receive a refusal with login instructions.
- **Idempotency** – All mutations (bookings, payments) use `X-Idempotency-Key` to prevent duplicates.
- **Debate Validation** – For high‑stakes certification questions, the agent **must** run the Optimist‑Skeptic debate before delivering a final answer.
- **Rate Limiting** – Per‑user and per‑IP limits enforced via Redis, with exponential backoff on retries.

---

## 🔍 Observability & Tracing

- **LangSmith** – Every tool call and ReAct step is traced with `@observe()` decorator, logging execution time, token usage, and tool outputs.
- **Failure Logging** – Ambiguous responses or repeated errors are appended to `failure.parquet` in S3 for later fine‑tuning.
- **Custom Metrics** – Exposed via Prometheus: `llm_queue_length`, `tool_latency_histogram`, and `debate_consensus_rate`.

---

## 📦 Kubernetes Scaling

Deployed on EKS with **Horizontal Pod Autoscaler** based on:
- `custom.metrics.llm_queue_length` (when queue exceeds 50, scale up)
- `cpu` utilisation (target 70%)

**Configuration**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: llm_queue_length
      target:
        type: AverageValue
        averageValue: 50
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 🧪 Fine‑Tuning Pipeline

1. **Data Collection** – Every failed or ambiguous query (detected via user feedback or low confidence scores) is logged to `failure.parquet`.
2. **Weekly CI Job** – A GitHub Action runs on Sundays:
   - Loads new failures, deduplicates, and balances with successful interactions.
   - Launches a **LoRA fine‑tuning** job on the base LLM (e.g., Llama‑3 or Mistral) using QLoRA.
   - Uploads the new adapter weights to Hugging Face Hub.
   - Updates the deployment with the new model tag (canary rollout via Argo Rollouts).
3. **Validation** – The fine‑tuned model is evaluated against the `eval.json` suite; if performance regresses (>5% drop), the deployment is rolled back.

---

## 🗣️ Voice Commerce Example

**User** (via Alexa): *“Alexa, order 2kg of Halal chicken from my favourite farm.”*

**Agent Flow**:
1. **ASR** → transcribes to text.
2. **Intent Recognition** → extracts `product="chicken"`, `quantity=2kg`, `farm=favourite`.
3. **ReAct Cycle**:
   - *Think*: Need to check inventory and retrieve user’s saved farm.
   - *Act*: Call `check_inventory("chicken")` → returns 50kg.
   - *Act*: Call `get_user_favourite_farm(user_id)` → returns farm ID.
   - *Act*: `process_payment({...})` → success.
4. **Observe** → Confirm order.
5. **Response** → `generate_voice_response("Your order of 2kg chicken is confirmed and will be delivered tomorrow.")` → audio played back.

---

## 🧠 Multi‑Agent Debate (AutoGen)

For certification claims, the agent spawns two sub‑agents:

- **Optimist** – argues that the product *is* Halal, citing favourable evidence.
- **Skeptic** – argues that it *may not be*, highlighting potential issues.

After 3 rounds of exchange, they reach a consensus. The final answer includes both viewpoints and the consensus verdict, increasing user trust.

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| End‑to‑end latency (text) | < 5s |
| Voice response latency | < 8s |
| Debate resolution time | < 12s |
| Accuracy on certification queries | ≥ 95% |
| Fine‑tuning improvement (weekly) | +2% accuracy on failure cases |

---

## 🚀 Getting Started

1. Clone the repo: `git clone https://github.com/halalchain/ai-agent.git`
2. Install dependencies: `poetry install`
3. Set environment variables (API keys, DB URLs, etc.)
4. Run locally: `python main.py --mode=text` or `--mode=voice`
5. Deploy: `kubectl apply -f k8s/`

---

## 📝 License & Support

Proprietary – contact `support@halalchain.xyz` for questions.
