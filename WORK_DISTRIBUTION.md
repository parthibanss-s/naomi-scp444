# Naomi SCM (Supply Chain Management)- Work Distribution Document

## Project Overview

**Project Name:** Naomi SCM - Factory PO Management System
**Version:** 2.0.0
**Document Date:** 2026-01-21
**Status:** Requirements Frozen, Demo Completed, Development Pending

---

## Table of Contents

1. [Application Pages](#1-application-pages)
2. [UI Work Items](#2-ui-work-items)
3. [API Work Items](#3-api-work-items)
4. [Database Work Items](#4-database-work-items)
5. [Email Alert System](#5-email-alert-system)
6. [Work Distribution Summary](#6-work-distribution-summary)

---

## 1. Application Pages

### 1.1 Login Page
- User authentication with username/password
- Role-based session management
- HTTP-only cookie authentication
- 5 user roles: NH_LEAD, NH_OPS, NH_USOPS, FACTORY_AGENT, WH_AGENT

### 1.2 PO Creation Page
- Create new Purchase Order
- Factory and Warehouse selection (dropdowns from master data)
- Cost Basis selection
- Requested Ship Date and ETA date pickers
- SKU item entry with autocomplete search
- Add/Remove SKU line items
- Quantity and pricing per SKU
- Total value calculation
- Save as Submit for Approval

### 1.3 PO Listing Page
- Role-based PO listing with different columns per role
- Filters: Search, Status, Warehouse, Factory, Date Range
- Pagination (25 items per page)
- Bulk Actions:
  - NH_LEAD: Bulk Approve (Open, Pending Approval status)
  - NH_OPS: Bulk Submit for Approval (Open status)
- Preview button to navigate to workflow

### 1.4 PO Workflow Page (Tabbed Interface)
| Tab | Event ID | Description |
|-----|----------|-------------|
| Modification | EVENT2 | FPO details, Customs Estimate, Item Details, Approval workflow |
| Production | EVENT3 | Production Tracker, Loading Confirmation, Logistics Handoff |
| Logistics | EVENT4 | Shipping details, Telex documents, Warehouse tracking |
| Inventory | EVENT5 | Received quantities, Damage tracking, Inventory confirmation |

### 1.5 Settings Page (NH_LEAD only)
- RBAC configuration matrix
- Event access management per role
- Protected roles and events handling

---

## 2. UI Work Items

> **Note:** UI was demonstrated as a prototype. Actual development pending based on demo.

### 2.1 Common Components (Build First)
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-001 | Common Components (sidebar, header, toast, modals, spinners, form validation) | Pending | 12|

### 2.2 Login Page
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-002 | Login Page (form, validation, error display, session management, redirect) | Pending |12 |

### 2.3 PO Creation Page
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-019 | PO Creation Page (factory/warehouse/cost basis dropdowns, date pickers, SKU autocomplete, add/remove items, totals, save draft/submit) | Pending |12 |

### 2.4 PO Listing Page
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-003 | List Table Card (role-based columns, NH Team/Factory Agent/WH Agent tables, pagination) | Pending |8 |
| UI-004 | Filters Card (search, status, warehouse, factory, date range, clear filters) | Pending |8 |
| UI-005 | Bulk Actions Card (select all, checkboxes, bulk approve NH_LEAD, bulk submit NH_OPS) | Pending |6 |

### 2.5 PO Workflow - Modification Tab (EVENT2)
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-006 | PO Details Card (factory, warehouse, cost basis, ship date, ETA, total value) | Pending |6 |
| UI-007 | Customs Estimate Card (ocean freight, drayage, chassis, custom duties with DDP hide) | Pending |6 |
| UI-008 | Item Details Card (SKU autocomplete, add/remove rows, totals, save/submit, approve/reject, remarks) | Pending | 8|

### 2.6 PO Workflow - Production Tab (EVENT3)
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-009 | Production Tracker Card (sequential field unlock, factory agent approval, hold PO toggle) | Pending |6 |
| UI-010 | Loading Confirmation Card (SKU table, loading qty editable, row/footer totals) | Pending | 8|
| UI-011 | Logistics Handoff Card (container number, actual ship date, update button) | Pending |6 |

### 2.7 PO Workflow - Logistics Tab (EVENT4)
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-012 | Shipping Information Card (carrier, forwarder, vessel, terminal, HBL, MBL, freight rate) | Pending |6 |
| UI-013 | Telex Documents Card (upload, preview, download, delete) | Pending | 8|
| UI-014 | Warehouse Tracking Card (vessel status, LFD, per diem, rail dates, pickup, delivery) | Pending |6 |
| UI-015 | Empty Container Card (notification date, pickup date, return date) | Pending | 6|

### 2.8 PO Workflow - Inventory Tab (EVENT5)
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-016 | SKU Items Card (item cards, loading qty, received/damaged qty, missing/usable calculation) | Pending |8 |
| UI-017 | Summary Card (totals, inventoried date, confirm receipt button) | Pending | 8|

### 2.9 Settings Page
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| UI-018 | RBAC Settings Card (matrix table, role checkboxes, protected indicators, save button) | Pending | 12|

---

## 3. API Work Items

### 3.1 Authentication APIs
| # | Endpoint | Method | Status | Est. Hours |
|---|----------|--------|--------|------------|
| API-001 | /auth/login | POST | Pending |  |
| API-002 | /auth/logout | POST | Pending | |

### 3.2 Master Data APIs
| # | Endpoint | Method | Status | Est. Hours |
|---|----------|--------|--------|------------|
| API-003 | /master/factories | GET | Pending | 6|
| API-004 | /master/warehouses | GET | Pending | 6|
| API-005 | /master/cost-basis | GET | Pending | 6|
| API-006 | /master/forwarders | GET | Pending | 6|
| API-007 | /master/carriers | GET | Pending | 6|
| API-008 | /master/origin-ports | GET | Pending |6 |
| API-009 | /master/vessel-status | GET | Pending |6 |
| API-010 | /master/vessel-status | POST | Pending |0 |
| API-011 | /master/sku | GET | Pending |6 |
| API-012 | /master/rbac-rules | GET | Pending | 0|

### 3.3 PO Management APIs
| # | Endpoint | Method | Status | Est. Hours |
|---|----------|--------|--------|------------|
| API-013 | /po/create | POST | Pending | 12|
| API-014 | /po/list | POST | Pending | 12|
| API-015 | /po/details | POST | Pending | 0 |
| API-016 | /po/bulk-approve | POST | Pending |12 |
| API-017 | /po/bulk-submit | POST | Pending |12 |

### 3.4 PO Workflow APIs
| # | Endpoint | Method | Status | Est. Hours |
|---|----------|--------|--------|------------|
| API-018-1 | /po/event?#modification | GET | Pending | 8|
| API-018-2 | /po/event?#production | GET | Pending | 8|
| API-018-3 | /po/event?#logistics | GET | Pending | 8|
| API-018-4 | /po/event?#inventory | GET | Pending | 8|
| API-019 | /po/modification | PUT | Pending | 8|
| API-020 | /po/production | PUT | Pending | 8|
| API-021 | /po/logistics | PUT | Pending | 8|
| API-022 | /po/inventory | PUT | Pending | 8|
| API-023 | /po/history | GET | Pending | 8|

### 3.5 File Management APIs
| # | Endpoint | Method | Status | Est. Hours |
|---|----------|--------|--------|------------|
| API-024 | /po/telex/upload | POST | Pending | 8|
| API-025 | /po/telex/download | POST | Pending |8 |
| API-026 | /po/telex/delete | POST | Pending | 8|

### 3.6 Settings APIs
| # | Endpoint | Method | Status | Est. Hours |
|---|----------|--------|--------|------------|
| API-027 | /settings | GET | Pending | 6|
| API-028 | /settings | PUT | Pending | 6|

---

## 4. Database Work Items

### 4.1 Core Tables
| # | Table Name | Status | Est. Hours |
|---|------------|--------|------------|
| DB-001 | users | Pending | |
| DB-002 | sessions | Pending | |
| DB-003 | purchase_orders | Pending | |
| DB-004 | po_items | Pending | |
| DB-005 | production_tracker | Pending | |
| DB-006 | logistics_tracker | Pending | |
| DB-007 | inventory_tracker | Pending | |
| DB-008 | po_history | Pending | |
| DB-010 | telex_documents | Pending | |

### 4.2 Master Data Tables
| # | Table Name | Status | Est. Hours |
|---|------------|--------|------------|
| DB-011 | factories | Pending | |
| DB-012 | warehouses | Pending | |
| DB-013 | sku_master | Pending | |
| DB-014 | forwarders | Pending | |
| DB-015 | carriers | Pending | |
| DB-016 | origin_ports | Pending | |
| DB-017 | cost_basis | Pending | |
| DB-018 | vessel_status | Pending | |
| DB-019 | events | Pending | |

### 4.3 RBAC Tables
| # | Table Name | Status | Est. Hours |
|---|------------|--------|------------|
| DB-020 | rbac_settings | Pending | |
| DB-021 | rbac_field_permissions | Pending | |

---

## 5. Email Alert System

### 5.1 Email Alert Requirements

| Alert ID | Condition | Trigger Type | Est. Hours |
|----------|-----------|--------------|--------------|
| EMAIL-001 | Expected Production Start Date not updated (72 hours) | Scheduled |  |
| EMAIL-002 | Ready Date not updated (72 hours) | Scheduled |  |
| EMAIL-003 | Container arriving to port (15 days before) | Scheduled |  |
| EMAIL-004 | Container arrived at Port | Event-triggered |  |
| EMAIL-005 | Pickup date not entered (LFD - 1 day) | Scheduled |  |
| EMAIL-006 | Delivered but not inventoried (48 hours) | Scheduled |  |
| EMAIL-007 | Empty date not entered (Per Diem - 1 day) | Scheduled |  |
| EMAIL-008 | Any field re-updated/modified | Event-triggered |  |
| EMAIL-009 | NH_LEAD selects Modification Required | Event-triggered |  |
| EMAIL-010 | NH_LEAD selects Reject PO | Event-triggered |  |

### 5.2 Email Alert Details

> **Note:** Recipients for all email alerts are yet to be confirmed. Sample warehouse-specific recipients:
> - **FCI Warehouse:** SWalston@ssco.pro, JYamaguchi@ssco.pro, dsandifer@ssco.pro, etc.
> - **ARMS Warehouse:** scho@arms-logistics.com, jwang@arms-logistics.com, etc.
> - **CC (All Alerts):** nh_po@ojcommerce.com, naomihome@ojcommerce.com

#### EMAIL-001: Expected Production Start Date Not Updated
```
Trigger: Daily scheduler checks POs in "Approved" or "Agent Approved" status
Condition: expectedProductionStart is NULL or empty for > 72 hours after approval
Subject: Production Start Date / Ready Date not updated within 72 hours

Body Template:
---
Hi Team,

This is a reminder that the Production Start Date has not been updated within
72 hours for the following PO's. Please update ASAP.

| PO Number | Warehouse | Factory | PO Receive Date |
|-----------|-----------|---------|-----------------|
| {poNumber} | {warehouse} | {factory} | {poReceiveDate} |

Best,
Naomi Home Team
---
```

#### EMAIL-002: Ready Date Not Updated
```
Trigger: Daily scheduler checks POs in "In Production" status
Condition: readyDate is NULL or empty for > 72 hours after production started
Subject: Production Start Date / Ready Date not updated within 72 hours

Body Template:
---
Hi Team,

This is a reminder that the Ready Date has not been updated within 72 hours
for the following PO's. Please update ASAP.

| PO Number | Warehouse | Factory | Production Start Date |
|-----------|-----------|---------|----------------------|
| {poNumber} | {warehouse} | {factory} | {productionStartDate} |

Best,
Naomi Home Team
---
```

#### EMAIL-003: Container Arriving to Port (15 Days Notice)
```
Trigger: Daily scheduler
Condition: PO status is "Shipped" and (ETA - current_date) <= 15 days
Subject: Container Arriving to Port in 15 days

Body Template:
---
Hi Team,

Please see container details below arriving to the port.

| CAR | Customs | Forwarder | Carrier | DO Received | Vessel Name | Terminal | BOL Number | Container# | ETA |
|-----|---------|-----------|---------|-------------|-------------|----------|------------|------------|-----|
| {car} | {customs} | {forwarder} | {carrier} | {doReceived} | {vessel} | {terminal} | {bolNumber} | {containerNumber} | {eta} |

Best,
Naomi Home Team
---
```

#### EMAIL-004: Container Arrived at Port
```
Trigger: Event-triggered when vessel status changes to "Arrived At Port"
Subject: Container Arrived at Port

Body Template:
---
Hi Team,

Please see container details below that have arrived at the port.

| CAR | Customs | Forwarder | Carrier | DO Received | Vessel Name | Terminal | BOL Number | Container# | Arrived Date |
|-----|---------|-----------|---------|-------------|-------------|----------|------------|------------|--------------|
| {car} | {customs} | {forwarder} | {carrier} | {doReceived} | {vessel} | {terminal} | {bolNumber} | {containerNumber} | {arrivedDate} |

Best,
Naomi Home Team
---
```

#### EMAIL-005: Pickup Date Not Entered (LFD - 1 Day)
```
Trigger: Daily scheduler
Condition: LFD is set AND (LFD - current_date) == 1 day AND pickedDate is NULL
Subject: [URGENT] Pickup date not entered, LFD - 1

Body Template:
---
Hi Team,

URGENT: The pickup date has not been entered and the Last Free Day (LFD) is
tomorrow for the following container(s). Please take immediate action to avoid
demurrage/detention charges.

| PO Number | Container# | LFD | Warehouse | Terminal |
|-----------|------------|-----|-----------|----------|
| {poNumber} | {containerNumber} | {lfd} | {warehouse} | {terminal} |

Best,
Naomi Home Team
---
```

#### EMAIL-006: Delivered But Not Inventoried (48 Hours)
```
Trigger: Scheduled (every 6 hours)
Condition: Status is "Arrived At WH" AND (current_time - warehouseDeliveryDate) > 48 hours
Subject: [ACTION REQUIRED] Container delivered 48 hours ago but not inventoried

Body Template:
---
Hi Team,

The following container(s) were delivered more than 48 hours ago but have not
been inventoried yet. Please complete the inventory process ASAP.

| PO Number | Container# | Warehouse | Delivery Date | Hours Since Delivery |
|-----------|------------|-----------|---------------|---------------------|
| {poNumber} | {containerNumber} | {warehouse} | {deliveryDate} | {hoursSinceDelivery} |

Best,
Naomi Home Team
---
```

#### EMAIL-007: Empty Date Not Entered (Per Diem - 1 Day)
```
Trigger: Daily scheduler
Condition: Per Diem end date is approaching (1 day) AND emptyContainerReturnDate is NULL
Subject: [URGENT] Empty date not entered, Per Diem - 1

Body Template:
---
Hi Team,

URGENT: The empty container return date has not been entered and the Per Diem
deadline is tomorrow for the following container(s). Please take immediate
action to avoid additional per diem charges.

| PO Number | Container# | Per Diem End | Warehouse |
|-----------|------------|--------------|-----------|
| {poNumber} | {containerNumber} | {perDiemEnd} | {warehouse} |

Best,
Naomi Home Team
---
```

#### EMAIL-008: Field Re-Updated/Modified
```
Trigger: Event-triggered on any PUT request to /po/* endpoints
Condition: Any field value changed from previous value (tracked in po_history)
Subject: Field/Data Updated - PO: {poNumber}

Body Template:
---
Hi Team,

The following field has been updated for PO {poNumber}:

| Field | Old Value | New Value | Updated By | Updated At |
|-------|-----------|-----------|------------|------------|
| {fieldName} | {oldValue} | {newValue} | {updatedBy} ({role}) | {timestamp} |

Best,
Naomi Home Team
---
```

#### EMAIL-009: Modification Required
```
Trigger: Event-triggered when NH_LEAD selects "Modification Required" action
Subject: Modification Required - PO: {poNumber}

Body Template:
---
Hi Team,

Modifications have been requested for PO {poNumber}.

**Requested By:** {nhLeadName} (NH_LEAD)
**Date:** {requestDate}

**Remarks/Reason:**
{modificationRemarks}

Please review and make the necessary changes.

Best,
Naomi Home Team
---
```

#### EMAIL-010: Reject PO
```
Trigger: Event-triggered when NH_LEAD selects "Reject" action
Subject: PO Rejected - PO: {poNumber}

Body Template:
---
Hi Team,

PO {poNumber} has been rejected.

**Rejected By:** {nhLeadName} (NH_LEAD)
**Date:** {rejectDate}

**Reason:**
{rejectionRemarks}

Best,
Naomi Home Team
---
```

### 5.3 Email System Work Items

#### UI Work Items (HTML Email Templates with Placeholders)
| # | Work Item | Alert | Placeholders | Status | Est. Hours |
|---|-----------|-------|--------------|--------|------------|
| EMAIL-UI-001 | production_date_missing.html | EMAIL-001 | {poNumber}, {warehouse}, {factory}, {poReceiveDate} | Pending |6 |
| EMAIL-UI-002 | ready_date_missing.html | EMAIL-002 | {poNumber}, {warehouse}, {factory}, {productionStartDate} | Pending | 6|
| EMAIL-UI-003 | container_arriving.html | EMAIL-003 | {car}, {customs}, {forwarder}, {carrier}, {doReceived}, {vessel}, {terminal}, {bolNumber}, {containerNumber}, {eta} | Pending | 6|
| EMAIL-UI-004 | container_arrived.html | EMAIL-004 | {car}, {customs}, {forwarder}, {carrier}, {doReceived}, {vessel}, {terminal}, {bolNumber}, {containerNumber}, {arrivedDate} | Pending |6 |
| EMAIL-UI-005 | pickup_date_required.html | EMAIL-005 | {poNumber}, {containerNumber}, {lfd}, {warehouse}, {terminal} | Pending |6 |
| EMAIL-UI-006 | inventory_pending.html | EMAIL-006 | {poNumber}, {containerNumber}, {warehouse}, {deliveryDate}, {hoursSinceDelivery} | Pending | 6|
| EMAIL-UI-007 | empty_return_required.html | EMAIL-007 | {poNumber}, {containerNumber}, {perDiemEnd}, {warehouse} | Pending |6 |
| EMAIL-UI-008 | field_modified.html | EMAIL-008 | {poNumber}, {fieldName}, {oldValue}, {newValue}, {updatedBy}, {role}, {timestamp} | Pending |6 |
| EMAIL-UI-009 | modification_requested.html | EMAIL-009 | {poNumber}, {nhLeadName}, {requestDate}, {modificationRemarks} | Pending | 6|
| EMAIL-UI-010 | po_rejected.html | EMAIL-010 | {poNumber}, {nhLeadName}, {rejectDate}, {rejectionRemarks} | Pending | 6|

> **Note:** UI team creates HTML email templates with placeholders. API team replaces placeholders with actual data and sends emails.

#### API Work Items
| # | Work Item | Description | Status | Est. Hours |
|---|-----------|-------------|--------|------------|
| EMAIL-API-001 | Email service integration | SMTP/SendGrid/SES configuration and connection | Pending | |
| EMAIL-API-002 | Template placeholder replacement | Load HTML template, replace {placeholders} with actual data | Pending | |
| EMAIL-API-003 | Scheduled job runner | Cron/scheduler for daily/hourly email checks | Pending | |
| EMAIL-API-004 | Event-triggered email dispatcher | Send emails on status changes, field updates | Pending | |
| EMAIL-API-005 | Email queue management | Queue emails, retry failed sends | Pending | |
| EMAIL-API-006 | Email delivery tracking | Log sent emails, track delivery status | Pending | |

#### Database Work Items
| # | Work Item | Status | Est. Hours |
|---|-----------|--------|------------|
| EMAIL-DB-001 | email_templates table | Pending | |
| EMAIL-DB-002 | email_logs table | Pending | |
| EMAIL-DB-003 | scheduled_alerts table | Pending | |
| EMAIL-DB-004 | notification_config table | Pending | |

---

## 6. Work Distribution Summary

### 6.1 Consolidated Estimates

| Team | Items | Est. Hours | Notes |
|------|-------|------------|-------|
| UI (Pages & Components) | 19 | 152 | Excludes Email Templates |
| UI (Email Templates) | 10 | 60 | HTML templates with placeholders |
| **UI Total** | **29** | **212** | |
| API (Core APIs) | 28 | 204 | Excludes duplicates (0 hrs) |
| API (Email System) | 6 | TBD | To be estimated |
| **API Total** | **34** | **204+** | |
| Database | 24 | TBD | To be estimated |
| **Grand Total** | **87** | **416+** | |

> **Note:** Items marked with 0 hours are duplicates (API-010, API-012, API-015) and excluded from totals.

### 6.2 By Category

| Category | Total Items | Pending |
|----------|-------------|---------|
| UI | 29 | 29 |
| API | 34 | 34 |
| Database | 24 | 24 |
| **Total** | **87** | **87** |

### 6.3 By Team

#### Frontend Team (UI)
- **Status:** Pending (Demo completed, actual development pending)
- **Items:** 29 work items (19 UI + 10 HTML Email Templates)
- **Estimated Hours:** 212 hours (152 UI + 60 Email Templates)
- **Reference:** Demo prototype available for UI specifications
- **Key Deliverables:**
  - Login Page (1 item)
  - PO Creation Page (1 item)
  - PO Listing (3 cards)
  - PO Workflow - Modification Tab (3 cards)
  - PO Workflow - Production Tab (3 cards)
  - PO Workflow - Logistics Tab (4 cards)
  - PO Workflow - Inventory Tab (2 cards)
  - Settings Page (1 card)
  - Common Components (1 item)
  - HTML Email Templates with placeholders (10 templates)

#### Backend Team (API)
- **Status:** Pending
- **Items:** 34 work items (28 APIs + 6 Email System)
- **Estimated Hours:** 204+ hours (Core APIs, Email System TBD)
- **Key Deliverables:**
  - Authentication APIs (2)
  - Master Data APIs (10)
  - PO Management APIs (5)
  - PO Workflow APIs (6)
  - File Management APIs (3)
  - Settings APIs (2)
  - Email service integration (SMTP/SendGrid/SES)
  - Template placeholder replacement (load HTML, replace {placeholders} with data)
  - Scheduled job runner (cron/scheduler)
  - Event-triggered email dispatcher
  - Email queue management
  - Email delivery tracking

#### Database Team
- **Status:** Pending
- **Items:** 24 work items (20 tables + 4 Email tables)
- **Key Deliverables:**
  - Core tables (10)
  - Master data tables (9)
  - RBAC tables (2)
  - Email/Notification tables (4)

### 6.4 Priority Matrix

| Priority | Category | Work Items |
|----------|----------|------------|
| P0 - Critical | Database | Core tables, Users, Purchase Orders |
| P0 - Critical | API | Authentication, PO List, PO Event Data |
| P1 - High | UI | Login Page, PO Creation, PO Listing, PO Workflow tabs |
| P1 - High | API | PO Workflow APIs, Bulk Actions |
| P1 - High | Email | Event-triggered alerts (EMAIL-004, 008, 009, 010) |
| P2 - Medium | API | Master Data APIs, Settings |
| P2 - Medium | Email | Scheduled alerts (EMAIL-001 to 007) |
| P3 - Low | API | History |

---

## 7. Technical Reference

### 7.1 API Specification
See: [API_SPECIFICATION.md](./API_SPECIFICATION.md)

### 7.2 Database Schema
See: API_SPECIFICATION.md - Appendix E

### 7.3 RBAC Configuration
See: [README.md](./README.md) - Role Access Matrix

### 7.4 Demo Prototype Reference
- **Location:** Current project folder (Naomi SCM)
- **Purpose:** UI/UX reference for development
- **Note:** Prototype uses mock data - actual implementation requires API integration

---


**Document Owner:** Parthiban S
**Last Updated:** 2026-01-21
**Status:** Requirements Frozen, Development Pending
