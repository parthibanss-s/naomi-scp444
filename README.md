# Naomi SCM - Factory PO Management System

A comprehensive UI for Factory Purchase Order management with Role-Based Access Control (RBAC) and multi-event workflow tracking.

## Features

- **Role-Based Access Control (RBAC)** - 5 user roles with field-level permissions
- **Login System** - Mock authentication with predefined credentials
- **PO Listing** - View purchase orders based on role permissions
- **PO Workflow** - Complete 5-event workflow (Modification, Production, Logistics, Inventory)
- **Filtering** - Search, filter by status, warehouse, and date range
- **Pagination** - 25 items per page
- **Info Icons** - Hover to see which roles can edit each field
- **Sequential Field Unlock** - Fields enable based on prerequisite data entry
- **Telex Document Management** - Upload, preview, and download telex documents
- **Responsive Design** - Pure HTML, CSS, and JavaScript (no frameworks)

## User Credentials

| Username  | Password | Role           | Description            |
|-----------|----------|----------------|------------------------|
| lead      | 123      | NH_LEAD        | NH Leadership role     |
| ops       | 123      | NH_OPS         | NH Operations          |
| usops     | 123      | NH_USOPS       | NH US Operations       |
| factory   | 123      | FACTORY_AGENT  | Factory Agent          |
| warehouse | 123      | WH_AGENT       | Warehouse Agent        |

## Role Access Matrix

### Events Access

| Event               | NH_LEAD | NH_OPS | NH_USOPS | FACTORY_AGENT | WH_AGENT |
|---------------------|---------|--------|----------|---------------|----------|
| PO Listing          | Always  | Always | Always   | Always        | Always   |
| PO Creation         | Yes     | Yes    | Yes      | No            | No       |
| PO Modification     | Yes     | Yes    | No       | No            | No       |
| Production Tracker  | Yes     | Yes    | No       | Yes           | No       |
| Logistics Tracker   | Yes     | Yes    | Yes      | Yes           | Yes      |
| Warehouse Inventory | Yes     | Yes    | Yes      | No            | Yes      |
| Settings            | Yes     | No     | No       | No            | No       |

### Protected Settings
- **NH_LEAD** - Settings cannot be modified by anyone (fully protected)
- **PO Listing** - Access cannot be removed for any role (always accessible)

### PO Status Access by Role

#### NH_LEAD & NH_OPS (Full Access)
- All statuses from Modification, Production, Logistics, and Inventory events

#### NH_USOPS
- **Logistics**: Shipped, Arrived At Port, Picked Up, Arrived At WH, Empty Notification
- **Inventory**: Empty Return, Inventoried

#### FACTORY_AGENT
- **Production**: Approved, Agent Approved, Agent Rejected, In Production, Ready at Factory, Container Booked, Space Released, Hold
- **Logistics**: Shipped, Arrived At Port, Picked Up, Arrived At WH, Empty Notification

#### WH_AGENT
- **Logistics**: Shipped, Arrived At Port, Picked Up, Arrived At WH, Empty Notification
- **Inventory**: Empty Return, Inventoried

## PO Workflow Events

### Event 1: PO Creation
- Create new purchase orders with factory, warehouse, cost basis, ship date, and ETA
- Add multiple SKU items with quantities
- Dynamic row addition/removal

### Event 2: PO Modification
- Edit PO master details (Factory, Warehouse, Cost Basis, Expected Ship Date, ETA)
- Manage SKU items (add, edit, remove)
- Approval workflow with remarks
- Info icons showing which roles can edit each field

### Event 3: Production Tracker
- Track production milestones with sequential unlock:
  - Expected Production Start Date
  - Ready Date (unlocks after Expected Production Start)
  - Container Booked Date (unlocks after Ready Date)
  - Space Released Date (unlocks after Container Booked)
- Factory Agent approval workflow
- Logistics handoff section:
  - Actual Ship Date (unlocks after Space Released)
  - Container Number (unlocks after Actual Ship Date)
- Hold PO functionality

### Event 4: Logistics Tracker
Four sections with sequential field unlock:

**Section 1 - Shipping Details:**
- HBL, MBL, Forwarder, Carrier, Cost Basis, Vessel, Freight Rate
- Port Date, Actual Ship Date, Tracking URL
- Telex Release with document upload/preview/download

**Section 2 - Documentation (unlocks after Port Date):**
- Customs, Packing List, Lacey Act, DO (Delivery Order)

**Section 3 - Port Operations (unlocks after Port Date):**
- Vessel Status, Terminal (enabled 5 days before Port Date)
- Rail Off/On Dates (FCI warehouse only)
- Appointment Book Date, Trucker Detail
- LFD (Last Free Day), Per Diem tracking
- Penalty Calculator with toggle details

**Section 4 - Delivery & Returns:**
- Picked Date (unlocks after Appointment Date)
- Warehouse Delivery Date (unlocks after Picked Date)
- Empty Notification Date (unlocks after WH Delivery)
- Empty Pickup Date (unlocks after Empty Notification)
- Empty Container Return Date (unlocks after Empty Pickup)

### Event 5: Inventory
- SKU-level inventory management
- Track Received Qty, Damaged Qty per SKU
- Auto-calculate Good Qty (Received - Damaged)
- Inventory summary with totals
- Inventoried Date confirmation
- Progress indicators for each SKU

## Key UI Features

### Info Icons
- Hover over the info icon (i) next to field labels to see which roles can edit that field
- Shows role permissions in a tooltip

### Field Hints
- Helper text appears below input fields
- Shows prerequisite requirements (e.g., "Enter Port Date first")
- Consistent spacing maintained for alignment

### Telex Document Management
- **Upload**: Select PDF, DOC, DOCX, JPG, JPEG, PNG files
- **Preview**: Opens modal with:
  - Image preview for image files
  - PDF viewer in iframe for PDF files
  - Placeholder for unsupported formats
- **Download**: Triggers browser download for uploaded files
- **Delete**: Remove uploaded documents with confirmation

### Tab Navigation in Workflow
- Visual distinction for tab states:
  - Accessible tabs with role permissions
  - Inaccessible tabs (grayed out)
  - Currently active tab (highlighted)

### Remarks Display
- Workflow header shows latest remarks/comments
- Displayed prominently for quick reference

## PO Status Workflow

```
Event 2 - Modification:
Open -> Pending Approval -> Approved / Cancelled

Event 3 - Production:
Approved -> Agent Approved/Rejected -> In Production -> Ready at Factory
-> Container Booked -> Space Released -> Hold (optional)

Event 4 - Logistics:
Shipped -> Arrived At Port -> Picked Up -> Arrived At WH -> Empty Notification

Event 5 - Inventory:
Empty Return -> Inventoried
```

## File Structure

```
Naomi SCM/
├── index.html              # Main HTML entry point
├── RBAC rules.js           # RBAC configuration and field rules
├── README.md               # This file
├── css/
│   └── styles.css          # All CSS styles including field hints
└── js/
    ├── app.js              # Main router and application controller
    ├── auth.js             # Authentication service
    ├── utils.js            # Utility functions (including createFieldInfo)
    ├── mockData.js         # Mock PO data
    ├── login.js            # Login page component
    ├── layout.js           # Layout and sidebar component
    ├── poListing.js        # PO listing page component
    ├── poCreation.js       # Event 1: PO Creation page
    ├── poDetails.js        # PO details modal
    ├── poWorkflow.js       # PO workflow container with tabs
    ├── poModification.js   # Standalone modification page
    ├── poModificationTab.js # Event 2: Modification tab in workflow
    ├── poProductionTab.js  # Event 3: Production tab in workflow
    ├── poLogisticsTab.js   # Event 4: Logistics tab in workflow
    ├── poInventoryTab.js   # Event 5: Inventory tab in workflow
    └── settings.js         # Settings/RBAC configuration page
```

## How to Use

1. **Open the Application**
   - Open `index.html` in a web browser
   - Or use a local web server (e.g., Live Server in VS Code)

2. **Login**
   - Use any of the credentials listed above
   - Example: Username: `lead`, Password: `123`

3. **View PO Listing**
   - After login, you'll see the PO listing page
   - POs are filtered based on your role
   - Use filters to search and narrow down results

4. **Access PO Workflow**
   - Click on a PO number to open the workflow view
   - Navigate between events using the tab bar
   - Available tabs depend on your role permissions

5. **Navigate**
   - Use the sidebar to navigate between pages
   - Available pages depend on your role
   - Logout using the logout button in the sidebar

6. **Settings (NH_LEAD/NH_OPS only)**
   - Configure role-based access for other roles
   - Cannot modify your own role's permissions
   - NH_LEAD settings are protected and cannot be changed
   - PO Listing access is always enabled for all roles

## Technical Implementation

### Technologies
- **HTML5** - Semantic markup
- **CSS3** - CSS variables, flexbox, grid
- **Vanilla JavaScript** - ES6+ features
- **No frameworks or libraries**

### Architecture
- **Component-based** - Modular page components
- **Client-side routing** - Hash-based navigation
- **State management** - localStorage for session
- **Mock API** - Simulated data fetching

### CSS Classes
- `.field-hint` - Helper text below input fields
- `.field-info-icon` - Info icon for role permissions
- `.field-info-tooltip` - Tooltip content for info icons
- `.modal-overlay` - Modal backdrop
- `.modal-container` - Modal content wrapper

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
- No Internet Explorer support

## Recent Updates

### Version 1.1.0
- Added Event 5: Inventory Tab with SKU-level tracking
- Implemented info icons showing field-level role permissions
- Added field hints below input fields for sequential unlock guidance
- Implemented Telex document preview modal (supports images and PDFs)
- Implemented Telex document download functionality
- Protected PO Listing access in Settings (cannot be removed)
- Protected NH_LEAD settings from modification
- Renamed "admin" user to "ops" (NH_OPS role)
- Changed Customs field from dropdown to text input
- Added remarks display in workflow header

## Notes

- This is a **demo/prototype** implementation with mock data
- No backend API is required - all data is in-memory
- Session is stored in localStorage (not secure for production)
- Telex file uploads are stored in memory (not persisted)
- All dates are displayed in YYYY-MM-DD format

## Testing

To test different roles:

1. Logout from current session
2. Login with a different user credential
3. Verify that:
   - Sidebar menu items change based on role
   - PO listing shows only accessible statuses
   - Workflow tabs show correct accessibility
   - Info icons display correct role permissions
   - Field hints show appropriate messages
   - Sequential field unlock works correctly
   - Telex preview/download functions work

---

**Version**: 1.1.0
**Last Updated**: 2026-01-02
**Author**: Naomi SCM Development Team
