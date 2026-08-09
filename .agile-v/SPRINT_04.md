# 🎯 Sprint 04: Checkout & Order State Machine

**Sprint Goal:** Enable customers to complete their purchases securely via a payment gateway and implement the core order state machine on the backend.

**Duration:** 2 Weeks  
**Status:** ⏳ UPCOMING

## 📋 Sprint Backlog

| Task ID | Description | Assignee | Status | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **QB-401** | Checkout UI (Address Selection, Delivery Notes) | TBD | 📝 To Do | 3 |
| **QB-402** | Payment Gateway Integration (Stripe) & Webhooks | TBD | 📝 To Do | 8 |
| **QB-403** | Order Creation API & State Machine Initialization | TBD | 📝 To Do | 8 |
| **QB-404** | Order History UI for Customer | TBD | 📝 To Do | 3 |
| **QB-405** | Order Status History Tracking (Database logging) | TBD | 📝 To Do | 3 |

## 🛑 Blockers / Risks
- Stripe webhook testing requires local tunneling (e.g., ngrok) for the dev environment.
- Need to handle edge cases where payment succeeds but order creation fails.

## 🏁 Definition of Done (DoD)
- Customer can successfully pay for an order via Stripe.
- Order is securely recorded in the database as `PAID`.
- Status history table logs the initial creation and payment success.
