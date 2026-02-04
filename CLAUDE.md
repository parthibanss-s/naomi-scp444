# Naomi SCM - Project Context Document

> This document provides comprehensive context for AI assistants (Claude) to understand the project structure, requirements, and implementation details.

---

## 1. Project Overview

**Project Name:** Naomi SCM - Factory PO Management System
**Type:** Web Application (Single Page Application)
**Tech Stack:** Vanilla JavaScript, HTML5, CSS3
**Purpose:** Manage Factory Purchase Orders through their complete lifecycle from creation to inventory

### 1.1 Business Context
- Naomi Home is an e-commerce company that imports products from overseas factories
- This system tracks POs from creation through production, shipping, logistics, and final warehouse inventory
- Multiple user roles interact with different stages of the PO lifecycle

### 1.2 User Roles (5 Roles)
| Role | Code | Description |
|------|------|-------------|
| NH Lead | NH_LEAD | Full access, approvals, settings management |
| NH Ops | NH_OPS | PO creation, modifications, production tracking |
| NH US Ops | NH_USOPS | Logistics and inventory focused |
| Factory Agent | FACTORY_AGENT | Production tracking, loading confirmation |
| Warehouse Agent | WH_AGENT | Logistics tracking, inventory confirmation |

---

## 2. Application Structure

### 2.1 Pages/Events
| Event | Page | Description |
|-------|------|-------------|
| EVENT1 | PO Creation | Create new Purchase Orders |
| EVENT2 | PO Modification | Edit PO details, approval workflow |
| EVENT3 | Production Tracker | Track manufacturing progress |
| EVENT4 | Logistics Tracker | Shipping and warehouse tracking |
| EVENT5 | Warehouse Inventory | Receive and inventory goods |
| EVENT6 | Settings | RBAC configuration (NH_LEAD only) |
| EVENT7 | Login | Authentication |

### 2.2 PO Workflow (Status Flow)
```
Open → Pending Approval → Approved → Agent Approved → In Production
→ Ready at Factory → Container Booked → Space Released → Shipped
→ Arrived At Port → Picked Up → Arrived At WH → Inventoried
```

Special Statuses:
- `Hold` - PO is on hold (can occur during production)
- `Agent Rejected` - Factory agent rejected the PO
- `Cancelled` - PO was cancelled
- `Empty Notification` / `Empty Return` - Container return tracking

---

## 3. File Structure

```
Naomi SCM/
├── index.html                 # Main SPA entry point
├── CLAUDE.md                  # This context document
├── WORK_DISTRIBUTION.md       # Work items, estimates, team assignments
├── API_SPECIFICATION.md       # API endpoints documentation
├── README.md                  # Project readme
├── RBAC rules.js              # Role-based access control configuration
│
├── css/
│   └── styles.css             # Main stylesheet
│
├── js/
│   ├── app.js                 # Main application, routing
│   ├── auth.js                # Authentication service
│   ├── mockData.js            # Sample data for demo
│   ├── utils.js               # Utility functions
│   ├── poListing.js           # PO listing page
│   ├── poWorkflow.js          # PO workflow (tabbed interface)
│   ├── poModificationTab.js   # EVENT2 - Modification tab
│   ├── poProductionTab.js     # EVENT3 - Production tab
│   ├── poLogisticsTab.js      # EVENT4 - Logistics tab
│   ├── poInventoryTab.js      # EVENT5 - Inventory tab
│   ├── poHistory.js           # PO change history tracking
│   └── settings.js            # RBAC settings page
```

---

## 4. RBAC (Role-Based Access Control)

### 4.1 Event Access per Role
| Role | EVENT1 | EVENT2 | EVENT3 | EVENT4 | EVENT5 | EVENT6 |
|------|--------|--------|--------|--------|--------|--------|
| NH_LEAD | Yes | Yes | Yes | Yes | Yes | Yes |
| NH_OPS | Yes | Yes | Yes | Yes | Yes | No |
| NH_USOPS | Yes | No | No | Yes | Yes | No |
| FACTORY_AGENT | No | No | Yes | Yes | No | No |
| WH_AGENT | No | No | No | Yes | Yes | No |

### 4.2 Field-Level Permissions
Defined in `RBAC rules.js` under `FIELD_RULES` object. Key sections:

**EVENT3 - Production Tab:**
- Production Tracker fields: Factory Agent, NH Lead can edit most fields
- Loading Confirmation: Factory Agent, NH Lead only
- Logistics Handoff: Factory Agent, NH Lead only

**EVENT4 - Logistics Tab:**
- Shipping Info: Factory Agent, NH Lead, NH US Ops
- Telex Documents: NH Ops, NH Lead, Factory Agent, NH US Ops (upload/delete/preview)
- Warehouse Tracking: WH Agent, NH Lead, NH US Ops

**EVENT5 - Inventory Tab:**
- All quantity fields: WH Agent, NH Ops, NH Lead, NH US Ops

### 4.3 Info Tooltips Pattern
For showing who can edit a field/section:
```html
<span class="field-info">i<span class="tooltip">Editable by: Role1, Role2</span></span>
```

---

## 5. Key Features

### 5.1 PO Creation (EVENT1)
- Factory/Warehouse selection from master data
- Cost Basis selection (DDP, FOB, etc.)
- SKU autocomplete search
- Add/Remove line items
- Total value calculation
- Submit for Approval

### 5.2 PO Modification (EVENT2)
- PO Details card
- Customs Estimate card (ocean freight, drayage, chassis, duties)
- Item Details card with SKU editing
- Approval workflow: Approve / Reject / Modification Required
- Remarks for rejection/modification

### 5.3 Production Tracker (EVENT3)
- **Production Tracker Card:** Sequential field unlock pattern
  - Expected Production Start Date → unlocks Ready Date
  - Ready Date → unlocks Container Booked Date (locks fields above)
  - Container Booked Date → unlocks Space Released Date
  - Space Released Date → unlocks Actual Ship Date
  - Actual Ship Date → unlocks Container Number

- **Loading Confirmation Card:**
  - SKU table with PO Quantity and Loading Quantity
  - Loading Qty editable by Factory Agent, NH Lead
  - Row and footer totals
  - Info icon showing editable roles

- **Logistics Handoff Card:**
  - Actual Ship Date
  - Container Number (entering this moves PO to Shipped status)

- **Hold PO Feature:**
  - Can put PO on hold with reason
  - Blocks shipping until hold is released

### 5.4 Logistics Tracker (EVENT4)
- **Shipping Information Card:** Carrier, forwarder, vessel, terminal, HBL, MBL
- **Telex Documents Card:** Upload, preview, download, delete documents
- **Warehouse Tracking Card:** Vessel status, LFD, per diem, rail dates, pickup, delivery
- **Empty Container Card:** Notification, pickup, return dates

### 5.5 Warehouse Inventory (EVENT5)
- **SKU Items Card:** Loading qty, received qty, damaged qty, missing/usable calculation
- **Summary Card:** Totals, inventoried date, confirm receipt button

### 5.6 Settings (EVENT6)
- RBAC configuration matrix
- Role checkboxes per event
- Protected roles (NH_LEAD cannot be removed from Settings)

---

## 6. Email Alert System

### 6.1 Alert Types (10 Alerts)
| ID | Trigger | Type |
|----|---------|------|
| EMAIL-001 | Production Start Date not updated (72 hrs) | Scheduled |
| EMAIL-002 | Ready Date not updated (72 hrs) | Scheduled |
| EMAIL-003 | Container arriving (15 days before) | Scheduled |
| EMAIL-004 | Container arrived at port | Event-triggered |
| EMAIL-005 | Pickup date not entered (LFD - 1 day) | Scheduled |
| EMAIL-006 | Delivered but not inventoried (48 hrs) | Scheduled |
| EMAIL-007 | Empty date not entered (Per Diem - 1 day) | Scheduled |
| EMAIL-008 | Any field modified | Event-triggered |
| EMAIL-009 | Modification Required selected | Event-triggered |
| EMAIL-010 | PO Rejected | Event-triggered |

### 6.2 Email Template Pattern
- HTML templates with placeholders: `{poNumber}`, `{warehouse}`, `{factory}`, etc.
- UI team creates templates, API team replaces placeholders and sends

---

## 7. Database Tables

### 7.1 Core Tables (9)
- users, sessions, purchase_orders, po_items
- production_tracker, logistics_tracker, inventory_tracker
- po_history, telex_documents

### 7.2 Master Data Tables (9)
- factories, warehouses, sku_master, forwarders, carriers
- origin_ports, cost_basis, vessel_status, events

### 7.3 RBAC Tables (2)
- rbac_settings, rbac_field_permissions

### 7.4 Email Tables (4)
- email_templates, email_logs, scheduled_alerts, notification_config

---

## 8. API Endpoints

### 8.1 Authentication
- POST /auth/login
- POST /auth/logout

### 8.2 Master Data (GET endpoints)
- /master/factories, /master/warehouses, /master/cost-basis
- /master/forwarders, /master/carriers, /master/origin-ports
- /master/vessel-status, /master/sku

### 8.3 PO Management
- POST /po/create - Create new PO
- POST /po/list - List POs (role-based filtering)
- POST /po/bulk-approve - Bulk approve POs
- POST /po/bulk-submit - Bulk submit for approval

### 8.4 PO Workflow
- GET /po/event?#modification - Get modification tab data
- GET /po/event?#production - Get production tab data
- GET /po/event?#logistics - Get logistics tab data
- GET /po/event?#inventory - Get inventory tab data
- PUT /po/modification - Update modification data
- PUT /po/production - Update production data
- PUT /po/logistics - Update logistics data
- PUT /po/inventory - Update inventory data
- GET /po/history - Get PO change history

### 8.5 File Management
- POST /po/telex/upload
- POST /po/telex/download
- POST /po/telex/delete

### 8.6 Settings
- GET /settings - Get RBAC settings
- PUT /settings - Update RBAC settings

---

## 9. UI Patterns & Components

### 9.1 Common Components
- Sidebar navigation
- Header with user info
- Toast notifications
- Modal dialogs
- Spinners/loaders
- Form validation

### 9.2 CSS Classes
- `.card`, `.card-header` - Card containers
- `.form-control` - Input fields
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-warning` - Buttons
- `.data-table` - Tables
- `.detail-grid`, `.detail-field` - Form layouts
- `.field-info`, `.tooltip` - Info tooltips
- `.status-badge` - Status indicators

### 9.3 Utility Functions (Utils object)
- `Utils.escapeHtml()` - XSS prevention
- `Utils.formatDate()` - Date formatting
- `Utils.showToast()` - Toast notifications
- `Utils.createStatusBadge()` - Status badge HTML
- `Utils.createFieldInfo()` - Field permission info tooltip

---

## 10. Work Distribution Summary

| Team | Items | Est. Hours |
|------|-------|------------|
| UI (Pages & Components) | 19 | 152 |
| UI (Email Templates) | 10 | 60 |
| **UI Total** | **29** | **212** |
| API (Core APIs) | 28 | 204 |
| API (Email System) | 6 | TBD |
| **API Total** | **34** | **204+** |
| Database | 24 | TBD |
| **Grand Total** | **87** | **416+** |

---

## 11. Key Business Rules

1. **Sequential Field Unlock:** In Production tab, dates must be entered in order
2. **Hold PO:** Blocks shipping until hold is released
3. **Container Number Locks Production:** Once entered, production tab becomes read-only
4. **Role-based PO Visibility:** Users only see POs relevant to their role's accessible statuses
5. **Bulk Actions:** NH_LEAD can bulk approve, NH_OPS can bulk submit
6. **Protected Settings:** NH_LEAD always has Settings access (cannot be removed)
7. **Email Alerts:** Triggered by schedules or events based on PO status/data changes

---

## 12. Important Notes for Development

1. **Demo vs Production:** Current app uses mockData.js - actual implementation needs API integration
2. **Authentication:** Uses HTTP-only cookies for session management
3. **No Save as Draft:** PO Creation only has Submit (removed Save as Draft per requirements)
4. **Duplicate APIs marked with 0:** API-010, API-012, API-015 are duplicates, excluded from estimates
5. **Field Info Pattern:** Use `<span class="field-info">i<span class="tooltip">...</span></span>` for consistency

---

**Document Version:** 1.0
**Last Updated:** 2026-02-04
**Document Owner:** Parthiban S
