// Settings Page Component
const SettingsPage = {
    roles: ['NH_LEAD', 'NH_OPS', 'NH_USOPS', 'FACTORY_AGENT', 'WH_AGENT'],
    selectedRole: 'NH_LEAD', // Default selected role

    // Map event names to display names
    eventDisplayNames: {
        'PoCreation': 'Event 1: Create PO',
        'PoModification': 'Event 2: Modifications',
        'ProductionTracker': 'Event 3: Production',
        'LogisticsTracker': 'Event 4: Logistics',
        'WarehouseInventory': 'Event 5: Inventory',
        'Settings': 'Settings',
        'Login': 'PO Listing'
    },

    // Events to display in the order specified
    displayEvents: [
        'Login',
        'PoCreation',
        'Settings',
        'PoModification',
        'ProductionTracker',
        'LogisticsTracker',
        'WarehouseInventory'
    ],

    // Current access configuration (loaded from RBAC)
    accessConfig: {},

    // Get roles that can be edited (excludes logged-in user's role and NH_LEAD which is protected)
    getEditableRoles() {
        const session = window.AuthService.getSession();
        const loggedInRole = session ? session.role : null;
        // NH_LEAD's settings cannot be changed by anyone
        return this.roles.filter(role => role !== loggedInRole && role !== 'NH_LEAD');
    },

    render() {
        const session = window.AuthService.getSession();
        if (!session) {
            window.location.href = '#/login';
            return '';
        }

        // Load current access configuration
        this.loadAccessConfig();

        // Get roles excluding the logged-in user's role
        const editableRoles = this.getEditableRoles();

        // If selected role is the logged-in user's role, switch to first available
        if (!editableRoles.includes(this.selectedRole) && editableRoles.length > 0) {
            this.selectedRole = editableRoles[0];
        }

        return `
            <div class="page-header">
                <h1>Settings & RBAC Configuration</h1>
                <p>Configure role-based access control for different user roles</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Select Role</h3>
                </div>

                <div style="padding: 24px;">
                    <div class="role-selector">
                        ${editableRoles.map(role => `
                            <div class="role-card ${this.selectedRole === role ? 'selected' : ''}" data-role="${role}">
                                <div class="role-name">${this.formatRoleName(role)}</div>
                                <div class="role-code">${role}</div>
                            </div>
                        `).join('')}
                    </div>
                    <p style="margin-top: 12px; font-size: 13px; color: #666;">
                        <em>Note: You cannot modify your own role's permissions${session.role !== 'NH_LEAD' ? ` (${this.formatRoleName(session.role)})` : ''}. NH Lead's settings are protected and cannot be modified.</em>
                    </p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Access Configuration for ${this.formatRoleName(this.selectedRole)}</h3>
                </div>

                <div style="padding: 24px;">
                    <div class="access-list">
                        ${this.renderAccessList()}
                    </div>

                    <div class="form-actions" style="margin-top: 24px;">
                        <button type="button" id="cancel-settings-btn" class="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="button" id="save-settings-btn" class="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Check if a role is protected for a specific event
    isProtectedAccess(role, eventKey) {
        // PO Listing (Login) is always accessible by everyone - cannot be changed
        if (eventKey === 'Login') {
            return true;
        }

        // Map event display names to FIELD_RULES keys
        const eventToRuleKey = {
            'Settings': 'EVENT6'
        };

        const ruleKey = eventToRuleKey[eventKey];
        if (!ruleKey) return false;

        // Check if FIELD_RULES has protectedRoles for this event
        if (window.FIELD_RULES && window.FIELD_RULES[ruleKey] && window.FIELD_RULES[ruleKey].protectedRoles) {
            return window.FIELD_RULES[ruleKey].protectedRoles.includes(role);
        }
        return false;
    },

    renderAccessList() {
        console.log('Rendering access list for role:', this.selectedRole);
        console.log('Access config for this role:', this.accessConfig[this.selectedRole]);

        return this.displayEvents.map(eventKey => {
            const displayName = this.eventDisplayNames[eventKey] || eventKey;
            const isPageSection = ['Login', 'PoCreation', 'Settings'].includes(eventKey);
            const hasAccess = this.accessConfig[this.selectedRole] && this.accessConfig[this.selectedRole].includes(eventKey);
            const isProtected = this.isProtectedAccess(this.selectedRole, eventKey);

            console.log(`Event: ${eventKey}, hasAccess: ${hasAccess}, isProtected: ${isProtected}`);

            return `
                <div class="access-item">
                    <label class="access-label ${isProtected ? 'protected' : ''}">
                        <input
                            type="checkbox"
                            class="access-checkbox"
                            data-event="${eventKey}"
                            ${hasAccess ? 'checked' : ''}
                            ${isProtected ? 'disabled' : ''}
                        >
                        <span class="access-text">
                            ${isPageSection ? 'Page: ' : 'Workflow: '}${displayName}
                            ${isProtected ? '<span class="protected-badge">(Protected - Cannot be removed)</span>' : ''}
                        </span>
                    </label>
                </div>
            `;
        }).join('');
    },

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

    loadAccessConfig() {
        // Load current configuration from RBAC EVENT_ACCESS
        console.log('loadAccessConfig called');
        console.log('window.EVENT_ACCESS:', window.EVENT_ACCESS);

        if (window.EVENT_ACCESS) {
            this.accessConfig = {};

            this.roles.forEach(role => {
                this.accessConfig[role] = window.EVENT_ACCESS[role] || [];
            });

            // Debug logging
            console.log('Loaded access config:', this.accessConfig);
            console.log('Selected role:', this.selectedRole);
            console.log('Selected role access:', this.accessConfig[this.selectedRole]);
        } else {
            console.error('window.EVENT_ACCESS is not available!');
        }
    },

    init() {
        // Role card click listeners
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                const role = card.dataset.role;
                this.selectedRole = role;
                this.refresh();
            });
        });

        // Cancel button
        const cancelBtn = document.getElementById('cancel-settings-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                    window.location.href = '#/po-listing';
                }
            });
        }

        // Save button
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        // Checkbox change listeners
        const checkboxes = document.querySelectorAll('.access-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const event = e.target.dataset.event;
                const isChecked = e.target.checked;

                // Update local config for the selected role
                if (!this.accessConfig[this.selectedRole]) {
                    this.accessConfig[this.selectedRole] = [];
                }

                if (isChecked) {
                    if (!this.accessConfig[this.selectedRole].includes(event)) {
                        this.accessConfig[this.selectedRole].push(event);
                    }
                } else {
                    this.accessConfig[this.selectedRole] = this.accessConfig[this.selectedRole].filter(e => e !== event);
                }
            });
        });
    },

    // Enforce protected roles - ensure they always have access to protected events
    enforceProtectedAccess() {
        // Map event display names to FIELD_RULES keys
        const eventToRuleKey = {
            'Settings': 'EVENT6'
        };

        // For each event that has protectedRoles, ensure those roles have access
        Object.entries(eventToRuleKey).forEach(([eventKey, ruleKey]) => {
            if (window.FIELD_RULES && window.FIELD_RULES[ruleKey] && window.FIELD_RULES[ruleKey].protectedRoles) {
                const protectedRoles = window.FIELD_RULES[ruleKey].protectedRoles;

                protectedRoles.forEach(role => {
                    if (!this.accessConfig[role]) {
                        this.accessConfig[role] = [];
                    }
                    if (!this.accessConfig[role].includes(eventKey)) {
                        this.accessConfig[role].push(eventKey);
                        console.log(`Enforced protected access: ${role} -> ${eventKey}`);
                    }
                });
            }
        });
    },

    handleSave() {
        // Show confirmation
        if (!confirm('Are you sure you want to save these RBAC configuration changes? This will affect user access permissions.')) {
            return;
        }

        // In a real application, this would make an API call to save the configuration
        // For this demo, we'll update the global EVENT_ACCESS object and show success

        try {
            // Enforce protected access before saving (safety measure)
            this.enforceProtectedAccess();

            // Update global EVENT_ACCESS
            if (window.EVENT_ACCESS) {
                this.roles.forEach(role => {
                    window.EVENT_ACCESS[role] = this.accessConfig[role] || [];
                });
            }

            // Log the updated configuration
            console.log('Updated RBAC Configuration:', this.accessConfig);

            Utils.showToast('RBAC configuration saved successfully!', 'success');

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '#/po-listing';
            }, 1500);
        } catch (error) {
            console.error('Error saving RBAC configuration:', error);
            Utils.showToast('Failed to save RBAC configuration', 'error');
        }
    },

    refresh() {
        const content = this.render();
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = window.Layout.render(content);
            window.Layout.init();
            this.init();
        }
    }
};

window.SettingsPage = SettingsPage;
