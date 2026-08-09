# 🎯 Sprint 05: Kitchen Operations & Real-Time Events

**Sprint Goal:** Provide restaurants with a Kitchen Display System (KDS) and implement Socket.io for real-time, instant order updates across the platform.

**Duration:** 2 Weeks  
**Status:** ⏳ UPCOMING

## 📋 Sprint Backlog

| Task ID | Description | Assignee | Status | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **QB-501** | Kitchen Display System (KDS) UI (Kanban columns) | TBD | 📝 To Do | 8 |
| **QB-502** | Socket.io Server Setup & Authentication | TBD | 📝 To Do | 5 |
| **QB-503** | Real-time event broadcasting (`order.created`, etc.) | TBD | 📝 To Do | 5 |
| **QB-504** | Kitchen Timer Logic (Estimated vs. Elapsed Time) | TBD | 📝 To Do | 5 |
| **QB-505** | Ingredient-based Inventory deduction hooks | TBD | 📝 To Do | 5 |
| **QB-506** | Notification Service (Email/In-App for customers) | TBD | 📝 To Do | 3 |

## 🛑 Blockers / Risks
- Managing WebSocket connections securely and efficiently across multiple tenants.
- Ensuring real-time events only broadcast to authorized users for a specific tenant.

## 🏁 Definition of Done (DoD)
- Kitchen staff see new orders appear instantly on the KDS without refreshing.
- Kitchen staff can drag/move orders from `PREPARING` to `READY`.
- Customers receive real-time UI updates when their order status changes.
