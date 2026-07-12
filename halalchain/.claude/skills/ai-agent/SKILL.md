---
name: ai-agent
description: Deploy LangChain ReAct agents, voice assistants (Alexa/Google), and RAG over Halal documents.
version: 1.0.0
author: HalalChain Team
triggers:
  - keywords: []
---

# Skill: ai-agent

## Workflow\n1. Parse user intent (text/voice).\n2. Retrieve relevant context from vector DB.\n3. Use ReAct loop to take actions (book inspection, answer questions).\n4. Generate voice response if needed.\n\n## Tools\n- query_halal_knowledge_base\n- book_inspection\n- generate_voice_response
