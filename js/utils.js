// Utility Functions
const Utils = {
    // Factory to Agent mapping
    factoryAgents: {
        'Factory 1': 'Agent Smith',
        'Factory 2': 'Agent Johnson',
        'Factory 3': 'Agent Williams',
        'Factory 4': 'Agent Brown',
        'Factory 5': 'Agent Davis',
        'Factory 6': 'Agent Miller',
        'Factory 7': 'Agent Wilson',
        'Factory 8': 'Agent Moore'
    },

    // Get factory agent by factory name
    getFactoryAgent(factory) {
        return this.factoryAgents[factory] || '';
    },

    // Format date to YYYY-MM-DD
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    },

    // Format status for CSS class
    formatStatusClass(status) {
        if (!status) return '';
        return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
    },

    // Create status badge HTML
    createStatusBadge(status) {
        return `<span class="status-badge ${this.formatStatusClass(status)}">${status}</span>`;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Parse date from YYYY-MM-DD
    parseDate(dateString) {
        if (!dateString) return null;
        return new Date(dateString);
    },

    // Check if date is in range
    isDateInRange(date, startDate, endDate) {
        if (!date) return false;
        const d = new Date(date);
        if (startDate && d < new Date(startDate)) return false;
        if (endDate && d > new Date(endDate)) return false;
        return true;
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Create field info icon with RBAC tooltip
    createFieldInfo(eventName, fieldName) {
        const roles = window.RBAC.getRolesForField(eventName, fieldName);
        if (!roles || roles.length === 0) return '';

        const roleNames = roles.map(r => window.RBAC.formatRoleName(r)).join(', ');
        return `<span class="field-info">i<span class="tooltip">Editable by: ${roleNames}</span></span>`;
    },

    // Show toast notification (simple implementation)
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#2563eb'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

window.Utils = Utils;

// PO History Tracking System
// Columns: Detail, Who, Action, When
const POHistory = {
    // Store history per PO number
    historyStore: {},

    // Format role name for display
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

    // Add a history entry for a PO
    // detail: Descriptive text of what changed
    // who: User who made the change with role
    // action: Type of action (Field Updated, Approved, etc.)
    // when: Timestamp
    addEntry(poNumber, detail, action) {
        if (!this.historyStore[poNumber]) {
            this.historyStore[poNumber] = [];
        }

        const session = window.AuthService ? window.AuthService.getSession() : null;
        const who = session ? `${session.username} (${this.formatRoleName(session.role)})` : 'System';

        const entry = {
            id: Date.now(),
            detail: detail,
            who: who,
            action: action,
            when: new Date().toLocaleString()
        };

        this.historyStore[poNumber].push(entry);
        return entry;
    },

    // Track field change
    trackFieldChange(poNumber, fieldName, oldValue, newValue, fieldLabel = null) {
        if (oldValue === newValue) return null;

        const displayLabel = fieldLabel || fieldName;
        const newDisplay = newValue || '(empty)';
        const detail = `${displayLabel} updated to '${newDisplay}'`;

        return this.addEntry(poNumber, detail, 'Field Updated');
    },

    // Track status change
    trackStatusChange(poNumber, oldStatus, newStatus) {
        if (oldStatus === newStatus) return null;

        const detail = `Status updated to '${newStatus}'`;
        return this.addEntry(poNumber, detail, 'Status Changed');
    },

    // Track remarks/comments
    trackRemarks(poNumber, remarkType, remarks) {
        const detail = `${remarkType}: ${remarks}`;
        return this.addEntry(poNumber, detail, 'Remarks Added');
    },

    // Track approval actions
    trackApproval(poNumber, approvalType, approved, remarks = null) {
        const action = approved ? 'Approved' : 'Rejected';
        let detail = approvalType;
        if (remarks) {
            detail += `. Remarks: ${remarks}`;
        }
        return this.addEntry(poNumber, detail, action);
    },

    // Track hold action
    trackHold(poNumber, holdReason) {
        const detail = `Hold Reason: ${holdReason}`;
        return this.addEntry(poNumber, detail, 'Hold Applied');
    },

    // Get history for a PO
    getHistory(poNumber) {
        return this.historyStore[poNumber] || [];
    },

    // Get formatted history for display (4 columns: detail, who, action, when)
    getFormattedHistory(poNumber) {
        const history = this.getHistory(poNumber);
        return history.map(entry => ({
            detail: entry.detail,
            who: entry.who,
            action: entry.action,
            when: entry.when
        }));
    },

    // Initialize history for a PO (add creation entry if not exists)
    initPOHistory(poNumber, createdDate) {
        if (!this.historyStore[poNumber] || this.historyStore[poNumber].length === 0) {
            this.historyStore[poNumber] = [{
                id: 1,
                detail: 'Purchase Order created',
                who: 'System',
                action: 'PO Created',
                when: Utils.formatDate(createdDate) + ' 09:00:00'
            }];
        }
    }
};

window.POHistory = POHistory;
