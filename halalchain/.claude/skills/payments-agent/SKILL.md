---
name: payments-agent
description: Process payments via Stripe, PayPal, Midtrans, BNPL, and MyHalal token escrow.
version: 1.0.0
author: HalalChain Team
triggers:
  - keywords: []
---

# Skill: payments-agent

## Workflow\n1. Identify payment method from user query.\n2. Call the appropriate API (Stripe/PayPal/XRPL).\n3. Handle idempotency and webhooks.\n4. For token escrow, invoke the smart contract.\n\n## Tools\n- create_stripe_payment_intent\n- initiate_halal_escrow\n- validate_pci_token
