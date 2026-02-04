# Naomi SCM - API Specification Document

## Overview

This document provides detailed API specifications for the Naomi SCM Factory PO Management System. All APIs follow RESTful conventions and use JSON for request/response payloads.

**Base URL:** `https://factorypo.ojcommerce.com/api/`

**Authentication:** HTTP-Only Cookies (Session-based)

> **Note:** Authentication tokens are managed via secure HTTP-only cookies set by the server. The client does not need to manually handle or store tokens. All authenticated requests automatically include cookies.

---

## Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [Master Data APIs](#2-master-data-apis)
3. [PO Management APIs](#3-po-management-apis)
4. [PO Workflow APIs](#4-po-workflow-apis)
5. [File Management APIs](#5-file-management-apis)
6. [Settings APIs](#6-settings-apis)
7. [Common Response Codes](#7-common-response-codes)
8. [Appendices](#appendices)

---

## 1. Authentication APIs

### 1.1 Login

Authenticate user and create session. Server sets HTTP-only cookies for authentication.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response Headers (Set by Server):**
```
Set-Cookie: session_token=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "usr_12345",
      "username": "lead",
      "fullName": "NH Lead User",
      "role": "NH_LEAD",
      "email": "lead@naomiscm.com"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

---

### 1.2 Logout

Invalidate user session and clear authentication cookies.

**Endpoint:** `POST /auth/logout`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Master Data APIs

> **Note:** All endpoints require authentication via HTTP-only cookies.

### 2.1 Get Factory List

**Endpoint:** `GET /master/factories`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "factories": [
      {
        "factoryId": "fac_001",
        "factoryName": "Factory 1",
        "agentId": "agt_001",
        "agentName": "Agent Smith"
      }
    ]
  }
}
```

---

### 2.2 Get Warehouse List

**Endpoint:** `GET /master/warehouses`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "warehouses": [
      {
        "warehouseId": "wh_001",
        "warehouseName": "FCI",
        "portId": "port_001",
        "portName": "Los Angeles"
      },
      {
        "warehouseId": "wh_002",
        "warehouseName": "ARMS",
        "portId": "port_002",
        "portName": "New York"
      }
    ]
  }
}
```

---

### 2.3 Get Cost Basis List

**Endpoint:** `GET /master/cost-basis`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "costBasisOptions": [
      { "code": "FOB", "name": "Free On Board" },
      { "code": "CFR", "name": "Cost and Freight" },
      { "code": "CIF", "name": "Cost, Insurance and Freight" },
      { "code": "DDP", "name": "Delivered Duty Paid" }
    ]
  }
}
```

---

### 2.4 Get Forwarders List

**Endpoint:** `GET /master/forwarders`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "forwarders": [
      { "forwarderId": "fwd_001", "forwarderName": "PNB Logistics" },
      { "forwarderId": "fwd_002", "forwarderName": "FMED Shipping" },
      { "forwarderId": "fwd_003", "forwarderName": "Top Ocean Logistics" }
    ]
  }
}
```

---

### 2.5 Get Carriers List

**Endpoint:** `GET /master/carriers`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "carriers": [
      { "carrierId": "car_001", "carrierName": "Mediterranean Shipping Company" },
      { "carrierId": "car_002", "carrierName": "Maersk Line" },
      { "carrierId": "car_003", "carrierName": "Hapag-Lloyd" }
    ]
  }
}
```

---

### 2.6 Get Origin Ports List

**Endpoint:** `GET /master/origin-ports`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "originPorts": [
      { "portId": "port_001", "portName": "Shanghai" },
      { "portId": "port_002", "portName": "Ningbo" },
      { "portId": "port_003", "portName": "Qingdao" }
    ]
  }
}
```

---

### 2.7 Get Vessel Status List

**Endpoint:** `GET /master/vessel-status`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vesselStatusOptions": [
      { "statusId": "vs_001", "statusName": "VSL", "isDefault": true },
      { "statusId": "vs_002", "statusName": "CUSTOMS & FREIGHT HOLD", "isDefault": true },
      { "statusId": "vs_003", "statusName": "Ready for Appointment", "isDefault": true },
      { "statusId": "vs_004", "statusName": "Appointment Scheduled", "isDefault": true },
      { "statusId": "vs_005", "statusName": "Others", "isDefault": true }
    ]
  }
}
```

---

### 2.8 Add Vessel Status (Others)

Add a new vessel status when user selects "Others" and enters custom status text.

**Endpoint:** `POST /master/vessel-status`

**Request:**
```json
{
  "statusName": "Customs Inspection Required"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "statusId": "vs_007",
    "statusName": "Customs Inspection Required",
    "isDefault": false,
    "createdBy": "ops",
    "createdAt": "2026-01-06T14:30:00Z"
  }
}
```

---

### 2.9 Search SKUs (Autocomplete)

Search SKUs for autocomplete functionality. Triggered after 3 characters with 1.5-second debounce.

**Endpoint:** `GET /master/sku/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search term (min 3 characters) |
| limit | number | No | Max results (default: 10) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "skus": [
      {
        "sku": "SKU-001",
        "description": "Product A - Blue",
        "unitCost": 25.50,
        "weight": 15.5,
        "volume": 0.25
      },
      {
        "sku": "SKU-002",
        "description": "Product B - Red",
        "unitCost": 15.75,
        "weight": 10.2,
        "volume": 0.18
      }
    ]
  }
}
```

**Usage Notes:**
- Client triggers search after 3+ characters typed
- 1.5-second debounce on client side
- Returns SKU code and description for dropdown display
- On selection, auto-fills description field

---

### 2.10 Get RBAC Rules

Retrieve role-based access control configuration.

**Endpoint:** `GET /master/rbac-rules`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "roles": ["NH_LEAD", "NH_OPS", "NH_USOPS", "FACTORY_AGENT", "WH_AGENT"],
    "events": {
      "POListing": { "displayName": "PO Listing", "isProtected": true },
      "EVENT1": { "displayName": "PO Creation", "isProtected": false },
      "EVENT2": { "displayName": "PO Modification", "isProtected": false },
      "EVENT3": { "displayName": "Production Tracker", "isProtected": false },
      "EVENT4": { "displayName": "Logistics Tracker", "isProtected": false },
      "EVENT5": { "displayName": "Warehouse Inventory", "isProtected": false },
      "EVENT6": { "displayName": "Settings", "isProtected": true }
    },
    "fieldPermissions": {
      "EVENT2": {
        "editableBy": ["NH_OPS", "NH_LEAD"],
        "approveButton": ["NH_LEAD"],
        "rejectButton": ["NH_LEAD"],
        "save": ["NH_OPS", "NH_LEAD"],
        "submit": ["NH_OPS", "NH_LEAD"]
      },
      "EVENT3": {
        "loadingQty": ["FACTORY_AGENT", "NH_LEAD"],
        "factoryAgentApproval": ["FACTORY_AGENT", "NH_LEAD"],
        "expProductionDate": ["FACTORY_AGENT", "NH_LEAD"],
        "readyDate": ["FACTORY_AGENT", "NH_LEAD"],
        "containerBookedDate": ["FACTORY_AGENT", "NH_LEAD"],
        "spaceReleasedDate": ["FACTORY_AGENT", "NH_LEAD"],
        "actualShipDate": ["FACTORY_AGENT", "NH_LEAD"],
        "containerNumber": ["FACTORY_AGENT", "NH_LEAD"],
        "hold": ["FACTORY_AGENT", "NH_OPS", "NH_LEAD"]
      },
      "EVENT4": {
        "carrier": ["FACTORY_AGENT", "NH_LEAD"],
        "forwarder": ["FACTORY_AGENT", "NH_LEAD"],
        "hbl": ["FACTORY_AGENT", "NH_LEAD"],
        "mbl": ["FACTORY_AGENT", "NH_LEAD"],
        "telexUpload": ["NH_OPS", "NH_LEAD", "FACTORY_AGENT"],
        "telexDownload": ["NH_OPS", "NH_LEAD", "FACTORY_AGENT", "WH_AGENT"],
        "lfd": ["WH_AGENT", "NH_LEAD"],
        "vesselStatus": ["WH_AGENT", "NH_LEAD"],
        "emptyReturnDate": ["WH_AGENT", "NH_LEAD"]
      },
      "EVENT5": {
        "receivedQty": ["WH_AGENT", "NH_OPS", "NH_LEAD"],
        "damagedQty": ["WH_AGENT", "NH_OPS", "NH_LEAD"],
        "inventoriedDate": ["WH_AGENT", "NH_OPS", "NH_LEAD"]
      }
    }
  }
}
```

---

## 3. PO Management APIs

### 3.1 Create PO (EVENT1)

Create a new Purchase Order.

**Endpoint:** `POST /po`

**Request:**
```json
{
  "factory": "Factory 1",
  "factoryAgent": "Agent Smith",
  "warehouse": "FCI",
  "costBasis": "FOB",
  "shipDate": "2026-02-15",
  "eta": "2026-03-15",
  "items": [
    { "sku": "SKU-001", "quantity": 100 },
    { "sku": "SKU-002", "quantity": 200 }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Open",
    "factory": "Factory 1",
    "factoryAgent": "Agent Smith",
    "warehouse": "FCI",
    "costBasis": "FOB",
    "expectShipDate": "2026-02-15",
    "eta": "2026-03-15",
    "totalQuantity": 300,
    "items": [
      { "itemId": "item_001", "sku": "SKU-001", "description": "Product A", "quantity": 100 },
      { "itemId": "item_002", "sku": "SKU-002", "description": "Product B", "quantity": 200 }
    ],
    "createdDate": "2026-01-02T10:30:00Z",
    "createdBy": "lead"
  }
}
```

---

### 3.2 Get PO Listing

Retrieve list of POs with filtering and pagination.

**Endpoint:** `POST /po/list`

**Request Body:**
```json
{
  "page": 1,
  "limit": 25,
  "search": "PO-2026",
  "status": "Open",
  "warehouse": "FCI",
  "factory": "Factory 1",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "sortBy": "createdDate",
  "sortOrder": "desc"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "pos": [
      {
        "poNumber": "PO-2026-001234",
        "poStatus": "Open",
        "factory": "Factory 1",
        "productName": "Product A - Blue",
        "warehouse": "FCI",
        "createdDate": "2026-01-02",
        "expectShipDate": "2026-02-15",
        "eta": "2026-03-15",
        "totalQuantity": 300
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 245,
      "itemsPerPage": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Column Display by Role:**

| Column | NH_LEAD/NH_OPS | FACTORY_AGENT | WH_AGENT |
|--------|----------------|---------------|----------|
| PO Number | ✓ | ✓ | ✓ |
| Factory | ✓ | ✓ | - |
| Product Name | ✓ | ✓ | - |
| Warehouse | ✓ | ✓ | - |
| Created Date | ✓ | ✓ | - |
| Ship Date | ✓ | Required Ship Date | - |
| ETA | ✓ | - | - |
| Ready Date | - | ✓ | - |
| Actual Ship Date | - | ✓ | - |
| Loading Quantity | - | ✓ | - |
| Container Number | - | - | ✓ |
| MBL | - | - | ✓ |
| Destination Port | - | - | ✓ |
| Forwarder | - | - | ✓ |
| Carrier | - | - | ✓ |
| Port Date | - | - | ✓ |

---

### 3.3 Bulk Actions

#### 3.3.1 Bulk Approve (NH_LEAD only)

Approve multiple POs at once. Only POs with status 'Open' or 'Pending Approval' can be approved.

**Endpoint:** `POST /po/bulk-approve`

**Request:**
```json
{
  "poNumbers": ["PO-2026-001234", "PO-2026-001235", "PO-2026-001236"],
  "remarks": "Bulk PO Approval"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "approved": ["PO-2026-001234", "PO-2026-001235", "PO-2026-001236"],
    "failed": [],
    "message": "3 PO(s) approved successfully"
  }
}
```

#### 3.3.2 Bulk Submit for Approval (NH_OPS only)

Submit multiple POs for approval. Only POs with status 'Open' can be submitted.

**Endpoint:** `POST /po/bulk-submit`

**Request:**
```json
{
  "poNumbers": ["PO-2026-001234", "PO-2026-001235"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submitted": ["PO-2026-001234", "PO-2026-001235"],
    "failed": [],
    "message": "2 PO(s) submitted for approval"
  }
}
```

---

### 3.4 Get PO Details

Retrieve PO details including header and line items.

**Endpoint:** `POST /po/details`

**Request Body:**
```json
{
  "poNumber": "PO-2026-001234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Shipped",
    "factory": "Factory 1",
    "factoryAgent": "Agent Smith",
    "warehouse": "FCI",
    "costBasis": "FOB",
    "expectShipDate": "2026-02-15",
    "eta": "2026-03-15",
    "totalValue": 5700.00,
    "items": [
      {
        "itemId": "item_001",
        "sku": "SKU-001",
        "description": "Product A",
        "variation": "Blue/Large",
        "unitCost": 25.50,
        "orderQty": 100,
        "loadingQty": 100,
        "amount": 2550.00
      }
    ]
  }
}
```

---

## 4. PO Workflow APIs

### 4.1 Get PO Event Data

Retrieve PO data for a specific event/tab.

**Endpoint:** `POST /po/event`

**Request Body:**
```json
{
  "poNumber": "PO-2026-001234",
  "eventId": "EVENT2"
}
```

---

#### EVENT2 - Modification Tab Response

```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Pending Approval",
    "factory": "Factory 1",
    "factoryAgent": "Agent Smith",
    "warehouse": "FCI",
    "costBasis": "FOB",
    "expectShipDate": "2026-02-15",
    "eta": "2026-03-15",
    "totalValue": 5700.00,
    "approvalStatus": "Pending",
    "approvalRemarks": null,
    "customsEstimate": {
      "oceanFreight": 2500.00,
      "drayage": 800.00,
      "chassis": 150.00,
      "customDuties": 1200.00
    },
    "items": [
      {
        "itemId": "item_001",
        "sku": "SKU-001",
        "description": "Product A",
        "variation": "Blue/Large",
        "unitCost": 25.50,
        "orderQty": 100,
        "amount": 2550.00
      }
    ]
  }
}
```

**Customs Estimate Fields:**
| Field | Type | Description |
|-------|------|-------------|
| oceanFreight | number | Ocean freight cost in USD |
| drayage | number | Drayage cost in USD |
| chassis | number | Chassis cost in USD |
| customDuties | number | Custom duties in USD (hidden when costBasis = 'DDP') |

---

#### EVENT3 - Production Tab Response

```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "In production",
    "factory": "Factory 1",
    "factoryAgent": "Agent Smith",
    "createdDate": "2026-01-02",
    "originPortName": "Shanghai",
    "requestedShipDate": "2026-02-15",
    "expectedProductionStart": "2026-01-20",
    "readyDate": "2026-02-10",
    "containerBookedDate": "2026-02-08",
    "spaceReleasedDate": "2026-02-12",
    "actualShipDate": "2026-02-15",
    "containerNumber": "MSCU1234567",
    "holdPO": "No",
    "holdReason": "",
    "factoryAgentApproval": "Factory Agent Approved",
    "factoryAgentRemarks": "Ready for shipment",
    "loadingConfirmation": {
      "items": [
        {
          "itemId": "item_001",
          "sku": "SKU-001",
          "description": "Product A",
          "poQuantity": 100,
          "loadingQty": 100,
          "unitCost": 25.50,
          "total": 2550.00
        },
        {
          "itemId": "item_002",
          "sku": "SKU-002",
          "description": "Product B",
          "poQuantity": 200,
          "loadingQty": 195,
          "unitCost": 15.75,
          "total": 3071.25
        }
      ],
      "totals": {
        "totalPOQty": 300,
        "totalLoadingQty": 295,
        "totalValue": 5621.25
      }
    }
  }
}
```

**Loading Confirmation Fields:**
| Field | Type | Description | Editable By |
|-------|------|-------------|-------------|
| sku | string | SKU code | Read-only |
| description | string | Product description | Read-only |
| poQuantity | number | Original PO quantity | Read-only |
| loadingQty | number | Actual loading quantity (defaults to poQuantity) | FACTORY_AGENT, NH_LEAD |
| unitCost | number | Unit cost in USD | Read-only |
| total | number | Calculated: loadingQty × unitCost | Read-only |

---

#### EVENT4 - Logistics Tab Response

```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Shipped",
    "hbl": "HBL123456",
    "mbl": "MBL789012",
    "forwarder": "PNB",
    "carrier": "MSC",
    "vessel": "MSC OSCAR",
    "freightRate": 2500.00,
    "portDate": "2026-03-10",
    "telexRelease": "Yes",
    "telexFileName": "telex_doc.pdf",
    "customs": "Cleared",
    "packingList": "Yes",
    "laceyAct": "Yes",
    "deliveryOrder": "Yes",
    "vesselStatus": "Ready for Appointment",
    "vesselStatusOther": null,
    "terminal": "APM Terminals",
    "railOffDate": "2026-03-11",
    "railOnDate": "2026-03-12",
    "appointmentBookDate": "2026-03-13",
    "truckerDetail": "ABC Trucking",
    "lfd": "2026-03-15",
    "perDiemValue": 5,
    "perDiemType": "Calendar",
    "pickedDate": "2026-03-13",
    "warehouseDeliveryDate": "2026-03-14",
    "emptyNotificationDate": "2026-03-16",
    "emptyPickupDate": "2026-03-17",
    "emptyContainerReturnDate": "2026-03-18"
  }
}
```

---

#### EVENT5 - Inventory Tab Response

```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Arrived At WH",
    "inventoriedDate": null,
    "items": [
      {
        "itemId": "item_001",
        "sku": "SKU-001",
        "description": "Product A",
        "variation": "Blue/Large",
        "orderQty": 100,
        "loadingQty": 100,
        "receivedQty": 98,
        "damagedQty": 2,
        "missingQty": 2,
        "usableQty": 96
      },
      {
        "itemId": "item_002",
        "sku": "SKU-002",
        "description": "Product B",
        "variation": "Red/Medium",
        "orderQty": 200,
        "loadingQty": 195,
        "receivedQty": 195,
        "damagedQty": 0,
        "missingQty": 0,
        "usableQty": 195
      }
    ],
    "summary": {
      "totalOrdered": 300,
      "totalLoading": 295,
      "totalReceived": 293,
      "totalDamaged": 2,
      "totalMissing": 2,
      "totalUsable": 291
    }
  }
}
```

**Inventory Item Fields:**
| Field | Type | Description | Editable By |
|-------|------|-------------|-------------|
| orderQty | number | Original PO quantity | Read-only |
| loadingQty | number | Loaded quantity from EVENT3 | Read-only |
| receivedQty | number | Quantity received at warehouse | WH_AGENT, NH_OPS, NH_LEAD |
| damagedQty | number | Damaged quantity | WH_AGENT, NH_OPS, NH_LEAD |
| missingQty | number | Calculated: orderQty - receivedQty | Read-only |
| usableQty | number | Calculated: receivedQty - damagedQty | Read-only |

---

### 4.2 Modification Action (EVENT2)

**Endpoint:** `PUT /po/modification`

**Actions:** `save`, `submit`, `approve`, `reject`, `modificationRequest`

**Request:**
```json
{
  "poNumber": "PO-2026-001234",
  "action": "save",
  "factory": "Factory 1",
  "factoryAgent": "Agent Smith",
  "warehouse": "FCI",
  "costBasis": "FOB",
  "expectShipDate": "2026-02-20",
  "eta": "2026-03-20",
  "customsEstimate": {
    "oceanFreight": 2500.00,
    "drayage": 800.00,
    "chassis": 150.00,
    "customDuties": 1200.00
  },
  "items": [
    { "sku": "SKU-001", "quantity": 150, "unitCost": 25.50 },
    { "sku": "SKU-003", "quantity": 50, "unitCost": 30.00 }
  ],
  "remarks": "Updated quantity and added new SKU"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Pending Approval",
    "action": "submit",
    "actionDate": "2026-01-05T14:00:00Z",
    "actionBy": "lead",
    "message": "Modification submitted for approval"
  }
}
```

---

### 4.3 Save Production (EVENT3)

**Endpoint:** `PUT /po/production`

**Request:**
```json
{
  "poNumber": "PO-2026-001234",
  "originPortName": "Shanghai",
  "requestedShipDate": "2026-02-15",
  "expectedProductionStart": "2026-01-20",
  "readyDate": "2026-02-10",
  "containerBookedDate": "2026-02-08",
  "spaceReleasedDate": "2026-02-12",
  "actualShipDate": "2026-02-15",
  "containerNumber": "MSCU1234567",
  "holdPO": "No",
  "holdReason": "",
  "factoryAgentApproval": "Factory Agent Approved",
  "factoryAgentRemarks": "Production completed on schedule",
  "loadingConfirmation": [
    { "sku": "SKU-001", "loadingQty": 100 },
    { "sku": "SKU-002", "loadingQty": 195 }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Shipped",
    "message": "Production tracker updated successfully"
  }
}
```

---

### 4.4 Save Logistics (EVENT4)

**Endpoint:** `PUT /po/logistics`

**Request:**
```json
{
  "poNumber": "PO-2026-001234",
  "hbl": "HBL123456",
  "mbl": "MBL789012",
  "forwarder": "PNB",
  "carrier": "MSC",
  "vessel": "MSC OSCAR",
  "freightRate": 2500.00,
  "portDate": "2026-03-10",
  "trackingUrl": "https://www.msc.com/track/MSCU1234567",
  "telexRelease": "Yes",
  "customs": "Cleared",
  "packingList": "Yes",
  "laceyAct": "Yes",
  "deliveryOrder": "Yes",
  "vesselStatus": "Ready for Appointment",
  "vesselStatusOther": null,
  "terminal": "APM Terminals",
  "railOffDate": "2026-03-11",
  "railOnDate": "2026-03-12",
  "appointmentBookDate": "2026-03-13",
  "truckerDetail": "ABC Trucking",
  "lfd": "2026-03-15",
  "perDiemValue": 5,
  "perDiemType": "Calendar",
  "pickedDate": "2026-03-13",
  "warehouseDeliveryDate": "2026-03-14",
  "emptyNotificationDate": "2026-03-16",
  "emptyPickupDate": "2026-03-17",
  "emptyContainerReturnDate": "2026-03-18"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Empty Return",
    "message": "Logistics tracker updated successfully"
  }
}
```

---

### 4.5 Save Inventory (EVENT5)

**Endpoint:** `PUT /po/inventory`

**Request:**
```json
{
  "poNumber": "PO-2026-001234",
  "items": [
    { "sku": "SKU-001", "receivedQty": 98, "damagedQty": 2 },
    { "sku": "SKU-002", "receivedQty": 195, "damagedQty": 0 }
  ],
  "inventoriedDate": "2026-03-20"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "poStatus": "Inventoried",
    "inventory": {
      "totalOrdered": 300,
      "totalLoading": 295,
      "totalReceived": 293,
      "totalDamaged": 2,
      "totalUsable": 291,
      "inventoriedDate": "2026-03-20"
    },
    "message": "Inventory updated successfully. PO marked as Inventoried."
  }
}
```

---

### 4.6 Get PO History (Audit Trail)

**Endpoint:** `POST /po/history`

**Request Body:**
```json
{
  "poNumber": "PO-2026-001234",
  "page": 1,
  "limit": 50
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "history": [
      {
        "historyId": "hist_001",
        "detail": "PO Created - Factory: Factory 1, Warehouse: FCI, Status: Open",
        "who": "lead (NH Lead)",
        "action": "PO Created",
        "when": "2026-01-02T10:30:00Z"
      },
      {
        "historyId": "hist_002",
        "detail": "Status Changed: Open → Approved. Remarks: Approved.",
        "who": "lead (NH Lead)",
        "action": "Approved",
        "when": "2026-01-05T14:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2
    }
  }
}
```

---

## 5. File Management APIs

### 5.1 Upload Telex Document

**Endpoint:** `POST /po/telex/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `poNumber`: PO number
- `file`: PDF file (max 10 MB)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-001234",
    "fileId": "file_abc123",
    "fileName": "telex_release.pdf",
    "fileSize": 245678,
    "uploadedAt": "2026-03-10T11:30:00Z",
    "uploadedBy": "ops"
  }
}
```

---

### 5.2 Download Telex Document

**Endpoint:** `POST /po/telex/download`

**Request Body:**
```json
{
  "poNumber": "PO-2026-001234"
}
```

**Response:** Binary PDF file with appropriate headers.

---

### 5.3 Delete Telex Document

**Endpoint:** `POST /po/telex/delete`

**Request Body:**
```json
{
  "poNumber": "PO-2026-001234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Telex document deleted successfully"
}
```

---

## 6. Settings APIs

### 6.1 Get Settings

**Endpoint:** `GET /settings`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "roles": ["NH_LEAD", "NH_OPS", "NH_USOPS", "FACTORY_AGENT", "WH_AGENT"],
    "events": {
      "EVENT1": { "eventId": "EVENT1", "displayName": "PO Creation", "isProtected": false },
      "EVENT2": { "eventId": "EVENT2", "displayName": "PO Modification", "isProtected": false },
      "EVENT3": { "eventId": "EVENT3", "displayName": "Production Tracker", "isProtected": false },
      "EVENT4": { "eventId": "EVENT4", "displayName": "Logistics Tracker", "isProtected": false },
      "EVENT5": { "eventId": "EVENT5", "displayName": "Warehouse Inventory", "isProtected": false },
      "EVENT6": { "eventId": "EVENT6", "displayName": "Settings", "isProtected": true },
      "EVENT7": { "eventId": "EVENT7", "displayName": "Login", "isProtected": true }
    },
    "roleAccess": {
      "NH_LEAD": { "EVENT1": true, "EVENT2": true, "EVENT3": true, "EVENT4": true, "EVENT5": true, "EVENT6": true, "isProtected": true },
      "NH_OPS": { "EVENT1": true, "EVENT2": true, "EVENT3": true, "EVENT4": true, "EVENT5": true, "EVENT6": false, "isProtected": false },
      "NH_USOPS": { "EVENT1": true, "EVENT2": false, "EVENT3": false, "EVENT4": true, "EVENT5": true, "EVENT6": false, "isProtected": false },
      "FACTORY_AGENT": { "EVENT1": false, "EVENT2": false, "EVENT3": true, "EVENT4": true, "EVENT5": false, "EVENT6": false, "isProtected": false },
      "WH_AGENT": { "EVENT1": false, "EVENT2": false, "EVENT3": false, "EVENT4": true, "EVENT5": true, "EVENT6": false, "isProtected": false }
    },
    "protectedEvents": ["EVENT6", "EVENT7", "POListing"],
    "protectedRoles": ["NH_LEAD"]
  }
}
```

---

### 6.2 Save Settings

**Endpoint:** `PUT /settings`

**Request:**
```json
{
  "roleAccess": {
    "NH_OPS": { "EVENT1": true, "EVENT2": true, "EVENT3": true, "EVENT4": true, "EVENT5": true },
    "FACTORY_AGENT": { "EVENT1": false, "EVENT2": false, "EVENT3": true, "EVENT4": true, "EVENT5": false },
    "WH_AGENT": { "EVENT1": false, "EVENT2": false, "EVENT3": false, "EVENT4": true, "EVENT5": true }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "updatedAt": "2026-01-02T15:30:00Z",
    "updatedBy": "lead"
  }
}
```

---

## 7. Common Response Codes

### Success Codes
| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |

### Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [{ "field": "fieldName", "message": "Field-specific error" }]
  }
}
```

---

## Appendices

### Appendix A: PO Status Flow

```
EVENT1 (Creation):
  └── Open

EVENT2 (Modification):
  └── Open → Pending Approval → Approved / Cancelled

EVENT3 (Production):
  └── Approved → Agent Approved / Agent Rejected
      → In Production → Ready at Factory
      → Container Booked → Space Released → Hold (optional)

EVENT4 (Logistics):
  └── Shipped → Arrived At Port → Picked Up
      → Arrived At WH → Empty Notification

EVENT5 (Inventory):
  └── Empty Return → Inventoried
```

---

### Appendix B: Role Access Matrix

| Event | NH_LEAD | NH_OPS | NH_USOPS | FACTORY_AGENT | WH_AGENT |
|-------|---------|--------|----------|---------------|----------|
| PO Listing | Yes | Yes | Yes | Yes | Yes |
| PO Creation (E1) | Yes | Yes | Yes | No | No |
| PO Modification (E2) | Yes | Yes | No | No | No |
| Production Tracker (E3) | Yes | Yes | No | Yes | No |
| Logistics Tracker (E4) | Yes | Yes | Yes | Yes | Yes |
| Warehouse Inventory (E5) | Yes | Yes | Yes | No | Yes |
| Settings (E6) | Yes | No | No | No | No |

---

### Appendix C: Bulk Action Permissions

| Action | Role | Eligible PO Statuses |
|--------|------|---------------------|
| Bulk Approve | NH_LEAD | Open, Pending Approval |
| Bulk Submit | NH_OPS | Open |

---

### Appendix D: Data Flow - Loading Quantity

```
EVENT2 (Modification)
  └── Items with orderQty, unitCost
      ↓
EVENT3 (Production)
  └── Loading Confirmation
      - loadingQty set by FACTORY_AGENT/NH_LEAD
      - Defaults to orderQty
      - Max value = orderQty
      ↓
EVENT5 (Inventory)
  └── Display loadingQty as read-only
      - Shows what was actually loaded
      - receivedQty entered by WH_AGENT
      - missingQty = orderQty - receivedQty
      - usableQty = receivedQty - damagedQty
```

---

### Appendix E: Database Schema

#### Core Tables

```sql
-- Users
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    role ENUM('NH_LEAD', 'NH_OPS', 'NH_USOPS', 'FACTORY_AGENT', 'WH_AGENT') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    po_id VARCHAR(50) PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    po_status VARCHAR(50) NOT NULL DEFAULT 'Open',
    factory VARCHAR(200) NOT NULL,
    factory_agent VARCHAR(200),
    warehouse VARCHAR(100) NOT NULL,
    cost_basis VARCHAR(20),
    expect_ship_date DATE,
    eta DATE,
    total_quantity INT DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    remarks TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- PO Items (with loading_qty)
CREATE TABLE po_items (
    item_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    variation VARCHAR(200),
    unit_cost DECIMAL(10,2),
    order_qty INT NOT NULL,
    loading_qty INT DEFAULT NULL,
    amount DECIMAL(15,2),
    received_qty INT DEFAULT 0,
    damaged_qty INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);

-- Customs Estimate Transactions
CREATE TABLE purchase_order_transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    amount_description ENUM('ocean freight', 'Drayage', 'Chassis', 'Custom Duties') NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);

-- Production Tracker
CREATE TABLE production_tracker (
    tracker_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL UNIQUE,
    origin_port_name VARCHAR(200),
    requested_ship_date DATE,
    expected_production_start DATE,
    ready_date DATE,
    container_booked_date DATE,
    space_released_date DATE,
    actual_ship_date DATE,
    container_number VARCHAR(100),
    hold_po ENUM('Yes', 'No') DEFAULT 'No',
    hold_reason TEXT,
    factory_agent_approval VARCHAR(50),
    factory_agent_remarks TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);

-- Logistics Tracker
CREATE TABLE logistics_tracker (
    tracker_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL UNIQUE,
    hbl VARCHAR(100),
    mbl VARCHAR(100),
    forwarder VARCHAR(200),
    carrier VARCHAR(200),
    vessel VARCHAR(200),
    freight_rate DECIMAL(10,2),
    port_date DATE,
    tracking_url VARCHAR(500),
    telex_release ENUM('Yes', 'No') DEFAULT 'No',
    telex_file_id VARCHAR(50),
    customs VARCHAR(100),
    packing_list ENUM('Yes', 'No', '') DEFAULT '',
    lacey_act ENUM('Yes', 'No', '') DEFAULT '',
    delivery_order ENUM('Yes', 'No', '') DEFAULT '',
    vessel_status_id VARCHAR(50),
    vessel_status_other VARCHAR(500),
    terminal VARCHAR(200),
    rail_off_date DATE,
    rail_on_date DATE,
    appointment_book_date DATE,
    trucker_detail VARCHAR(200),
    lfd DATE,
    per_diem_value INT DEFAULT 0,
    per_diem_type VARCHAR(50),
    picked_date DATE,
    warehouse_delivery_date DATE,
    empty_notification_date DATE,
    empty_pickup_date DATE,
    empty_container_return_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);

-- Inventory Tracker
CREATE TABLE inventory_tracker (
    tracker_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL UNIQUE,
    inventoried_date DATE,
    total_ordered INT DEFAULT 0,
    total_loading INT DEFAULT 0,
    total_received INT DEFAULT 0,
    total_damaged INT DEFAULT 0,
    total_usable INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);

-- PO History / Audit Trail
CREATE TABLE po_history (
    history_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL,
    event VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    changes JSON,
    remarks TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Telex Documents
CREATE TABLE telex_documents (
    file_id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    file_path VARCHAR(500) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id)
);
```

#### Master Data Tables

```sql
-- Factories
CREATE TABLE factories (
    factory_id VARCHAR(50) PRIMARY KEY,
    factory_name VARCHAR(200) NOT NULL,
    agent_id VARCHAR(50),
    agent_name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE
);

-- Warehouses
CREATE TABLE warehouses (
    warehouse_id VARCHAR(50) PRIMARY KEY,
    warehouse_name VARCHAR(200) NOT NULL,
    port_id VARCHAR(50),
    port_name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE
);

-- SKU Master
CREATE TABLE sku_master (
    sku VARCHAR(100) PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    unit_cost DECIMAL(10,2),
    weight DECIMAL(10,2),
    volume DECIMAL(10,4),
    is_active BOOLEAN DEFAULT TRUE
);

-- Vessel Status
CREATE TABLE vessel_status (
    status_id VARCHAR(50) PRIMARY KEY,
    status_name VARCHAR(200) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Master
CREATE TABLE events (
    event_id VARCHAR(20) PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    is_protected BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

-- RBAC Settings
CREATE TABLE rbac_settings (
    setting_id VARCHAR(50) PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    event_id VARCHAR(20) NOT NULL,
    has_access BOOLEAN DEFAULT FALSE,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_event (role, event_id)
);

-- RBAC Field Permissions
CREATE TABLE rbac_field_permissions (
    permission_id VARCHAR(50) PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    event_id VARCHAR(20) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    can_edit BOOLEAN DEFAULT FALSE,
    can_view BOOLEAN DEFAULT TRUE,
    UNIQUE KEY unique_role_event_field (role, event_id, field_name)
);
```

#### Indexes

```sql
CREATE INDEX idx_po_status ON purchase_orders(po_status);
CREATE INDEX idx_po_factory ON purchase_orders(factory);
CREATE INDEX idx_po_warehouse ON purchase_orders(warehouse);
CREATE INDEX idx_po_created_date ON purchase_orders(created_date);
CREATE INDEX idx_items_po_id ON po_items(po_id);
CREATE INDEX idx_items_sku ON po_items(sku);
CREATE INDEX idx_history_po_id ON po_history(po_id);
CREATE INDEX idx_history_timestamp ON po_history(timestamp);
CREATE INDEX idx_sku_master_search ON sku_master(sku, description);
```

---

### Appendix F: PO Status List

| Status | Event | Description |
|--------|-------|-------------|
| Open | E1 | Initial status after creation |
| Pending Approval | E2 | Submitted for approval |
| Approved | E2 | Approved by NH_LEAD |
| Cancelled | E2 | PO cancelled |
| Agent Approved | E3 | Factory agent approved |
| Agent Rejected | E3 | Factory agent rejected |
| In production | E3 | Production started |
| Ready at Factory | E3 | Ready for shipment |
| Container Booked | E3 | Container booked |
| Space Released | E3 | Space released |
| Hold | E3 | PO on hold |
| Shipped | E3/E4 | Shipped from factory |
| Arrived At Port | E4 | At destination port |
| Picked Up | E4 | Picked up from port |
| Arrived At WH | E4 | At warehouse |
| Empty Notification | E4 | Empty container notification |
| Empty Return | E4 | Container returned |
| Inventoried | E5 | Inventory completed |

---

**Document Version:** 2.0.0
**Last Updated:** 2026-01-21
**Author:** Parthiban S
