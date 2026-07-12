---
name: erp-agent
description: Sync with Odoo/SAP, generate invoices in Xero/QuickBooks, handle tax compliance.
version: 1.0.0
author: HalalChain Team
triggers:
  - keywords: []
---

# Skill: erp-agent

## Workflow\n1. Map HalalChain order to ERP format.\n2. Push to Odoo via XML‑RPC or REST.\n3. Create draft invoice in Xero.\n4. Reconcile payments against ledger.\n\n## Tools\n- sync_odoo_order\n- generate_xero_invoice\n- query_financial_rag
