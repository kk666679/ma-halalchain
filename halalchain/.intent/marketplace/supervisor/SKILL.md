# Skill: Supervisor Agent (Orchestrator)
**ID**: `@halalchain/marketplace#supervisor-agent`  
**For**: Routing user intents to specialized agents, managing handoffs, and maintaining conversation state across the HalalChain marketplace.

## 🧠 Current Trends Implemented
- **Semantic Router** – Uses vector embeddings to classify incoming queries (payment, logistics, blockchain, etc.).
- **LangGraph State Machine** – Manages transitions between agents with clear `SUPERVISOR -> AGENT -> SUPERVISOR` cycles.
- **Human‑in‑the‑Loop** – Interrupts execution before critical blockchain transactions or certification approvals.
- **Observability** – Full OpenTelemetry + LangSmith traces for every handoff.

## 🔧 Agent Creation (Python / LangGraph)
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint import MemorySaver
from typing import TypedDict, Literal

class AgentState(TypedDict):
    messages: list
    next_agent: Literal["payments", "logistics", "erp", "ecommerce", "crm", "ai", "blockchain", "FINISH"]
    current_task: str
    requires_approval: bool

# Semantic router function (uses embeddings)
def route_intent(state: AgentState) -> str:
    # Use sentence-transformers to compare query with agent descriptions
    # Returns one of the agent IDs defined in the routing table
    pass

supervisor_agent = StateGraph(AgentState)
supervisor_agent.add_node("router", route_intent)
# Conditional edges based on next_agent field
supervisor_agent.add_conditional_edges("router", lambda s: s["next_agent"], {
    "payments": "payments_agent",
    "logistics": "logistics_agent",
    # ...
})
```

📡 MCP (Model Context Protocol) Tools

Expose the supervisor as an MCP server so any LLM client can discover and call these tools:

· get_agent_status
· transfer_to_agent(agent_id, context)
· get_conversation_history

🚦 Handoff Protocol

1. Supervisor classifies intent.
2. Calls handoff() to the target agent with the current state snapshot.
3. Target agent processes using its specialized tools.
4. Target agent calls return_to_supervisor() with results.
5. Supervisor either replies to user or routes to another agent.

🔍 Testing the Graph

```bash
# Run the interactive debugger
npx @tanstack/intent@latest load @halalchain/marketplace#supervisor-agent
python -m halalchain.agents.supervisor --debug
```

📚 References

· LangGraph Multi-Agent Tutorial: /docs/agents/langgraph-handoff.md
· MCP Server Config: /infrastructure/mcp/supervisor.yaml
· Semantic Router training data: /data/intent-classification.parquet
EOF

