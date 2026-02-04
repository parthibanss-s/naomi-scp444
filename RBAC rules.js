
const ROLES = {
  NH_LEAD: "NH_LEAD",
  NH_OPS: "NH_OPS",
  NH_USOPS: "NH_USOPS",
  FACTORY_AGENT: "FACTORY_AGENT",
  WH_AGENT: "WH_AGENT"
};

const EVENTS = {
  EVENT1: "PoCreation",
  EVENT2: "PoModification", 
  EVENT3: "ProductionTracker",
  EVENT4: "LogisticsTracker", 
  EVENT5: "WarehouseInventory",
  EVENT6: "Settings",
  EVENT7: "Login"
};

/* -----------------------------------------------
   EVENT ACCESS PER ROLE
----------------------------------------------- */
const EVENT_ACCESS = {
  [ROLES.NH_LEAD]:   [EVENTS.EVENT1, EVENTS.EVENT2, EVENTS.EVENT3, EVENTS.EVENT4, EVENTS.EVENT5, EVENTS.EVENT6, EVENTS.EVENT7],
  [ROLES.NH_OPS]:    [EVENTS.EVENT1, EVENTS.EVENT2, EVENTS.EVENT3, EVENTS.EVENT4, EVENTS.EVENT5, EVENTS.EVENT7],
  [ROLES.NH_USOPS]:  [EVENTS.EVENT1, EVENTS.EVENT4, EVENTS.EVENT5, EVENTS.EVENT7],
  [ROLES.FACTORY_AGENT]: [EVENTS.EVENT3, EVENTS.EVENT4, EVENTS.EVENT7],
  [ROLES.WH_AGENT]:      [EVENTS.EVENT4, EVENTS.EVENT5, EVENTS.EVENT7],
};

/* -----------------------------------------------
   FIELD-LEVEL ACCESS RULES
   Note: for convenience you can either place rules
   under `editableFields: { ... }` or directly
   `fieldName: [roles...]` — both supported.
----------------------------------------------- */
const FIELD_RULES = {
  // EVENT 1
  EVENT1: {
    editableBy: [ROLES.NH_OPS, ROLES.NH_USOPS, ROLES.NH_LEAD]
  },

  // EVENT 2 - Modification / Approval
  // Based on your note that NH_OPS expects approve/mod req/reject flows,
  // approve/save/submit include NH_OPS + NH_LEAD below.
  EVENT2: {
    editableBy: [ROLES.NH_OPS, ROLES.NH_LEAD],
    approveButton: [ROLES.NH_LEAD],
    rejectButton: [ROLES.NH_LEAD],             // PDM specified NH_Lead for reject — kept as more restricted
    modificationRequired: [ROLES.NH_LEAD],
    remarks: [ROLES.NH_LEAD],
    save: [ROLES.NH_OPS, ROLES.NH_LEAD],
    submit: [ROLES.NH_OPS, ROLES.NH_LEAD]
  },

  // EVENT 3 — Production
  EVENT3: {
    editableFields: {
      // Production Tracker fields
      warehouse: [ROLES.FACTORY_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD],
      factory: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      originPortName: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      requestedShipDate: [ROLES.NH_OPS, ROLES.NH_LEAD],
      factoryAgentApproval: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      expProductionDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      readyDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      containerBookedDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      spaceReleasedDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      hold: [ROLES.FACTORY_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD],
      holdReason: [ROLES.FACTORY_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD],

      // Loading Confirmation fields
      loadingQty: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      loadingConfirmation: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],

      // Logistics Handoff fields
      containerNumber: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD],
      actualShipDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD]
    }
  },

  // EVENT 4 — Logistics
  EVENT4: {
    // fields defined directly (supported by canEditField)
	editableFields: {
		carrier: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		forwarder: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		vessel: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS], // fixed spelling
		terminal: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_OPS, ROLES.NH_USOPS],
		hbl: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		mbl: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		costBasis: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_OPS, ROLES.NH_USOPS],
		freightRate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_OPS, ROLES.NH_USOPS],
		addTrackingUrl: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_OPS, ROLES.NH_USOPS],
		actualShipDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		portDate: [ROLES.FACTORY_AGENT, ROLES.NH_LEAD, ROLES.NH_OPS, ROLES.NH_USOPS],

		// Telex rules: upload/delete/preview by NH_OPS/NH_LEAD/Factory; W.A only download
		telexUpload: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.FACTORY_AGENT, ROLES.NH_USOPS],
		telexDelete: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.FACTORY_AGENT, ROLES.NH_USOPS],
		telexPreview: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.FACTORY_AGENT, ROLES.NH_USOPS],
		telexDownload: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.FACTORY_AGENT, ROLES.WH_AGENT, ROLES.NH_USOPS],

		customs: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],
		packingList: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],
		laceyAct: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],
		doField: [ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],

		lfd: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		perDiem: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		vesselStatus: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],

		railOffDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		railOnDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		appointmentBookDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		pickDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		truckerDetail: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		warehouseDelivery: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		emptyNotificationDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		emptyPickupDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS],
		emptyReturnDate: [ROLES.WH_AGENT, ROLES.NH_LEAD, ROLES.NH_USOPS]
	}

  },

  // EVENT 5 — Warehouse Inventory
  EVENT5: {
    editableFields: {
      receivedQty: [ROLES.WH_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],
      damagedQty: [ROLES.WH_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],
      missingQty: [ROLES.WH_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS],
      inventoriedDate: [ROLES.WH_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS]
    },
    confirmReceipt: [ROLES.WH_AGENT, ROLES.NH_OPS, ROLES.NH_LEAD, ROLES.NH_USOPS]
  },

  //Settings
  // NH_LEAD has PERMANENT access to Settings - cannot be removed by any admin
  EVENT6: {
    editableBy: [ROLES.NH_LEAD],
    // Protected roles that cannot be removed from Settings access
    protectedRoles: [ROLES.NH_LEAD]
  },
  
  //Login
  EVENT7: {
    editableBy: [ROLES.NH_OPS, ROLES.NH_USOPS, ROLES.NH_LEAD, ROLES.FACTORY_AGENT, ROLES.WH_AGENT]
  }
};

/* ============================================================
   HELPER / NORMALIZATION
============================================================ */

function _norm(s) {
  if (!s && s !== 0) return "";
  return String(s).trim().toLowerCase();
}

/* ============================================================
   RBAC UTILITY METHODS
============================================================ */

const RBAC = {

  VALID_ROLES: Object.values(ROLES),
  EVENTS,
  ROLES,

  /** Set logged-in role once (validates) */
  setRole(role) {
    if (!role || !this.VALID_ROLES.includes(role)) {
      console.warn("RBAC.setRole: invalid role:", role);
      return false;
    }
    localStorage.setItem("USER_ROLE", role);
    return true;
  },

  getRole() {
    return localStorage.getItem("USER_ROLE");
  },

  /** EVENT–LEVEL Access */
  canAccessEvent(eventName) {
    const role = this.getRole();
    if (!role) return false;
    const normEvent = _norm(eventName);
    // event constants stored uppercase - compare after normalizing
    const allowed = EVENT_ACCESS[role] || [];
    return allowed.some(e => _norm(e) === normEvent);
  },

  /** FIELD-LEVEL Access
   *  Works if rules are:
   *    - rules.editableBy (array) OR
   *    - rules.editableFields[fieldName] (array) OR
   *    - rules[fieldName] (array) // direct placement
   */
  canEditField(eventName, fieldName) {
    const role = this.getRole();
    if (!role) return false;
    const rules = FIELD_RULES[eventName];
    if (!rules) return false;

    // 1) editableBy top-level
    if (Array.isArray(rules.editableBy) && rules.editableBy.includes(role)) return true;

    // 2) editableFields mapping (case-insensitive)
    if (rules.editableFields) {
      const key = Object.keys(rules.editableFields)
        .find(k => _norm(k) === _norm(fieldName));
      if (key && rules.editableFields[key].includes(role)) return true;
    }

    // 3) direct top-level fieldName: [roles...]
    const topKey = Object.keys(rules).find(k => _norm(k) === _norm(fieldName));
    if (topKey && Array.isArray(rules[topKey]) && rules[topKey].includes(role)) return true;

    return false;
  },

  /** ACTION Access (Approve / Reject / Upload / Download etc.)
   *  - actionName may be a top-level key in the event rule (e.g. "approveButton", "telexUpload")
   */
  canPerformAction(eventName, actionName) {
    const role = this.getRole();
    if (!role) return false;
    const rules = FIELD_RULES[eventName];
    if (!rules) return false;

    // find a matching key case-insensitively
    const key = Object.keys(rules).find(k => _norm(k) === _norm(actionName));
    if (!key) return false;

    const allowed = rules[key];
    if (Array.isArray(allowed)) {
      return allowed.includes(role);
    }
    return false;
  },

  /** Returns array of roles that can edit a specific field */
  getRolesForField(eventName, fieldName) {
    const rules = FIELD_RULES[eventName];
    if (!rules) return [];

    // Check editableFields mapping (case-insensitive)
    if (rules.editableFields) {
      const key = Object.keys(rules.editableFields)
        .find(k => _norm(k) === _norm(fieldName));
      if (key) return rules.editableFields[key];
    }

    // Check direct top-level fieldName: [roles...]
    const topKey = Object.keys(rules).find(k => _norm(k) === _norm(fieldName));
    if (topKey && Array.isArray(rules[topKey])) return rules[topKey];

    // If editableBy exists, return those roles
    if (Array.isArray(rules.editableBy)) return rules.editableBy;

    return [];
  },

  /** Format role names for display */
  formatRoleName(role) {
    const roleNames = {
      'NH_LEAD': 'NH Lead',
      'NH_OPS': 'NH Ops',
      'NH_USOPS': 'NH US Ops',
      'FACTORY_AGENT': 'Factory Agent',
      'WH_AGENT': 'Warehouse Agent'
    };
    return roleNames[role] || role;
  },

  /** Returns array of field names that `role` can edit across event */
  listAllowedFieldsForRole(eventName, role) {
    const rules = FIELD_RULES[eventName];
    if (!rules) return [];
    const allowed = new Set();

    if (Array.isArray(rules.editableBy) && rules.editableBy.includes(role)) {
      // if editableBy is present, we assume whole event editable
      // return wildcard indicator
      return ["*"];
    }

    // from editableFields
    if (rules.editableFields) {
      Object.entries(rules.editableFields).forEach(([field, roles]) => {
        if (roles.includes(role)) allowed.add(field);
      });
    }

    // from direct keys
    Object.entries(rules).forEach(([k, v]) => {
      if (Array.isArray(v) && v.includes(role)) allowed.add(k);
    });

    return Array.from(allowed);
  },

  /**
   * Convenience: bind DOM elements automatically.
   * - data-rbac-event="EVENT3"
   * - data-rbac-field="readyDate"
   * - data-rbac-action="telexUpload" (for buttons)
   *
   * This will:
   *  - disable inputs the user cannot edit
   *  - hide buttons the user cannot perform
   */
  bindPermissionsToDOM(root = document) {
    const role = this.getRole();
    if (!role) return;
    // inputs / form-controls
    const inputs = root.querySelectorAll("[data-rbac-event][data-rbac-field]");
    inputs.forEach(el => {
      const ev = el.getAttribute("data-rbac-event");
      const field = el.getAttribute("data-rbac-field");
      if (!this.canEditField(ev, field)) {
        // prefer disabling over hiding for UX, but you can change
        el.setAttribute("disabled", "disabled");
        el.classList.add("rbac-disabled");
      } else {
        el.removeAttribute("disabled");
        el.classList.remove("rbac-disabled");
      }
    });

    // actions / buttons
    const actions = root.querySelectorAll("[data-rbac-event][data-rbac-action]");
    actions.forEach(btn => {
      const ev = btn.getAttribute("data-rbac-event");
      const act = btn.getAttribute("data-rbac-action");
      if (!this.canPerformAction(ev, act)) {
        btn.style.display = "none";
      } else {
        btn.style.display = "";
      }
    });
  }
};

/* -----------------------------------------------
   STATUS TO EVENT MAPPING
   Maps PO statuses to their corresponding events
----------------------------------------------- */
const STATUS_TO_EVENT = {
  // Modification Event Statuses
  'Open': 'PoModification',
  'Pending Approval': 'PoModification',
  'Cancelled': 'PoModification',

  // Production Event Statuses
  'Approved': 'ProductionTracker',
  'Agent Approved': 'ProductionTracker',
  'Agent Rejected': 'ProductionTracker',
  'In production': 'ProductionTracker',
  'Ready at Factory': 'ProductionTracker',
  'Container Booked': 'ProductionTracker',
  'Space Released': 'ProductionTracker',
  'Hold': 'ProductionTracker',

  // Logistics Event Statuses
  'Shipped': 'LogisticsTracker',
  'Arrived At Port': 'LogisticsTracker',
  'Picked Up': 'LogisticsTracker',
  'Arrived At WH': 'LogisticsTracker',
  'Empty Notification': 'LogisticsTracker',

  // Inventory Event Statuses
  'Empty Return': 'WarehouseInventory',
  'Inventoried': 'WarehouseInventory'
};

/* -----------------------------------------------
   ROLE TO ACCESSIBLE STATUSES
   Defines which statuses each role can see
----------------------------------------------- */
const ROLE_ACCESSIBLE_STATUSES = {
  [ROLES.NH_LEAD]: [
    // All statuses
    'Open', 'Pending Approval', 'Cancelled',
    'Approved', 'Agent Approved', 'Agent Rejected', 'In production',
    'Ready at Factory', 'Container Booked', 'Space Released', 'Hold',
    'Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification',
    'Empty Return', 'Inventoried'
  ],
  [ROLES.NH_OPS]: [
    // All statuses
    'Open', 'Pending Approval', 'Cancelled',
    'Approved', 'Agent Approved', 'Agent Rejected', 'In production',
    'Ready at Factory', 'Container Booked', 'Space Released', 'Hold',
    'Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification',
    'Empty Return', 'Inventoried'
  ],
  [ROLES.NH_USOPS]: [
    // Logistics and Inventory statuses only (Events 4 and 5)
    'Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification',
    'Empty Return', 'Inventoried'
  ],
  [ROLES.FACTORY_AGENT]: [
    // Production and Logistics statuses only
    'Approved', 'Agent Approved', 'Agent Rejected', 'In production',
    'Ready at Factory', 'Container Booked', 'Space Released', 'Hold',
    'Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification'
  ],
  [ROLES.WH_AGENT]: [
    // Logistics and Inventory statuses only
    'Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification',
    'Empty Return', 'Inventoried'
  ]
};

// Helper function to get event for a status
function getEventForStatus(status) {
  return STATUS_TO_EVENT[status] || 'PoModification';
}

// Helper function to check if role can see status
function canRoleAccessStatus(role, status) {
  const accessibleStatuses = ROLE_ACCESSIBLE_STATUSES[role] || [];
  return accessibleStatuses.includes(status);
}

// Helper function to filter POs by role
function filterPOsByRole(pos, role) {
  return pos.filter(po => canRoleAccessStatus(role, po.poStatus || po.status));
}

window.RBAC = RBAC;
window.STATUS_TO_EVENT = STATUS_TO_EVENT;
window.ROLE_ACCESSIBLE_STATUSES = ROLE_ACCESSIBLE_STATUSES;
window.getEventForStatus = getEventForStatus;
window.canRoleAccessStatus = canRoleAccessStatus;
window.filterPOsByRole = filterPOsByRole;
window.EVENT_ACCESS = EVENT_ACCESS;
window.FIELD_RULES = FIELD_RULES;
