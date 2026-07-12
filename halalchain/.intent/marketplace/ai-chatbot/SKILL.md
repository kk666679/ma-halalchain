Skill: AI / Chatbot Agent

ID: @halalchain/marketplace#ai-agent
For: Building LangChain/ReAct agents, voice assistants (Alexa/Google), and fine‑tuning LLMs.

🧠 Current Trends

· ReAct Pattern – Agent iteratively "Thinks -> Acts -> Observes" to solve complex queries.
· AutoGen Multi‑Agent Debate – Uses 2 agents (Optimist vs. Skeptic) to validate Halal certification claims before presenting to user.
· Voice + Text Unified – One state‑machine that handles both text and ASR (Automatic Speech Recognition) intents.

🤖 Agent Tools

```python
@tool
def query_halal_knowledge_base(question: str) -> str:
    """RAG over Halal certification PDFs, SMIIC standards, and fatwas."""

@tool
def book_inspection(appointment_data: dict) -> str:
    """Book a physical Halal inspection via the JAKIM API."""

@tool
def generate_voice_response(text: str) -> bytes:
    """TTS using ElevenLabs; returns MP3 bytes for Alexa/Google."""
```

📦 Kubernetes Scaling

Horizontal Pod Autoscaler based on custom.metrics.llm_queue_length and cpu.

🔬 Fine‑Tuning Pipeline

When the agent detects frequent failures or ambiguous responses, it logs them to a failure.parquet file. A weekly CI job automatically triggers LoRA fine‑tuning on new data.

🗣️ Voice Commerce Example

User: "Alexa, order 2kg of Halal chicken from my favourite farm."
Agent: Recognises intent, checks inventory, processes payment, confirms via voice.

