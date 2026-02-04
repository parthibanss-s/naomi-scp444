// PO Production Tab (Event 3) - Production Tracker
const POProductionTab = {
    currentPO: null,
    editedData: null,
    showModificationRequest: false,
    originPorts: ['Port 1', 'Port 2', 'Port 3', 'Port 4'],
    loadingItems: [], // Track loading quantities per SKU

    render(po) {
        this.currentPO = po;
        if (!this.editedData || this.editedData.poNumber !== po.poNumber) {
            this.editedData = JSON.parse(JSON.stringify(po));
            // Initialize loading items from PO items
            this.initializeLoadingItems();
        }

        const isAccessible = this.isAccessible();

        if (!isAccessible) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3>Event 3 - Production Tracker</h3>
                    </div>
                    <div style="padding: 24px;">
                        <div style="padding: 24px; background: #fef3c7; border-radius: 8px; text-align: center;">
                            <h4 style="margin-bottom: 8px;">PO Not Yet at This Stage</h4>
                            <p style="color: #666;">This PO needs to be approved in Event 2 before production tracking can begin.</p>
                            <p style="color: #666; margin-top: 8px;">Current Status: ${Utils.createStatusBadge(po.poStatus)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `

            <div class="card">
                <div class="card-header">
                    <h3>Event 3 - Production Tracker</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Track manufacturing progress</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderProductionTrackerSection()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Loading Confirmation <span class="field-info">i<span class="tooltip">Editable by: Factory Agent, NH Lead</span></span></h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Confirm loading quantities for each SKU</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderLoadingConfirmationSection()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Logistics Handoff</h3>
                </div>
                <div style="padding: 24px;">
                    ${this.renderLogisticsHandoffSection()}
                </div>
            </div>

            ${this.renderUpdateSection()}
        `;
    },

    isAccessible() {
        const productionStatuses = ['Approved', 'Agent Approved', 'Agent Rejected', 'In production',
            'Ready at Factory', 'Container Booked', 'Space Released', 'Hold', 'Shipped',
            'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification', 'Empty Return', 'Inventoried'];
        return productionStatuses.includes(this.currentPO.poStatus);
    },

    isEditable() {
        // Event 3 is editable until Container Number is entered and saved
        // Once Container Number exists in the saved PO data, Production is locked
        const hasContainerNumber = this.currentPO.containerNumber && this.currentPO.containerNumber.trim() !== '';
        return !hasContainerNumber;
    },

    // Sequential unlock checks
    hasExpectedProductionStart() {
        return this.editedData.expectedProductionStart && this.editedData.expectedProductionStart.trim() !== '';
    },

    hasReadyDate() {
        return this.editedData.readyDate && this.editedData.readyDate.trim() !== '';
    },

    hasContainerBookedDate() {
        return this.editedData.containerBookedDate && this.editedData.containerBookedDate.trim() !== '';
    },

    hasSpaceReleasedDate() {
        return this.editedData.spaceReleasedDate && this.editedData.spaceReleasedDate.trim() !== '';
    },

    hasActualShipDate() {
        return this.editedData.actualShipDate && this.editedData.actualShipDate.trim() !== '';
    },

    initializeLoadingItems() {
        // Get items from the PO - use existing items array or fetch from mockData
        const poItems = this.currentPO.items || [];

        // Initialize loading items with PO quantity as default loading quantity
        // Items use orderQty for PO quantity
        this.loadingItems = poItems.map(item => {
            const poQty = item.orderQty || item.quantity || 0;
            // Check if loadingQty was already saved, otherwise default to PO quantity
            const existingLoadingQty = item.loadingQty !== undefined ? item.loadingQty : poQty;
            return {
                sku: item.sku,
                description: item.description || '',
                poQuantity: poQty,
                loadingQty: existingLoadingQty,
                unitCost: item.unitCost || 0
            };
        });
    },

    renderLoadingConfirmationSection() {
        const isEditable = this.isEditable();
        const session = window.AuthService.getSession();

        // Only Factory Agent and NH_LEAD can edit loading quantities
        const canEditLoadingQty = (session.role === 'FACTORY_AGENT' || session.role === 'NH_LEAD') && isEditable;

        if (this.loadingItems.length === 0) {
            return `
                <div style="padding: 24px; background: #f5f5f5; border-radius: 8px; text-align: center; color: #666;">
                    No items found for this PO.
                </div>
            `;
        }

        // Calculate totals
        const totalPOQty = this.loadingItems.reduce((sum, item) => sum + (item.poQuantity || 0), 0);
        const totalLoadingQty = this.loadingItems.reduce((sum, item) => sum + (item.loadingQty || 0), 0);
        const totalValue = this.loadingItems.reduce((sum, item) => sum + ((item.loadingQty || 0) * (item.unitCost || 0)), 0);

        return `
            <div class="table-container">
                <table class="data-table" id="loading-confirmation-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Description</th>
                            <th style="text-align: right;">PO Quantity</th>
                            <th style="text-align: right;">Loading Quantity</th>
                            <th style="text-align: right;">Unit Cost</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.loadingItems.map((item, index) => `
                            <tr>
                                <td>
                                    <input type="text" class="form-control" value="${Utils.escapeHtml(item.sku)}" disabled style="background: #f5f5f5;">
                                </td>
                                <td>
                                    <input type="text" class="form-control" value="${Utils.escapeHtml(item.description)}" disabled style="background: #f5f5f5;">
                                </td>
                                <td style="text-align: right;">
                                    <input type="number" class="form-control" value="${item.poQuantity}" disabled style="background: #f5f5f5; text-align: right;">
                                </td>
                                <td style="text-align: right;">
                                    <input type="number" class="form-control loading-qty-input"
                                        data-index="${index}"
                                        value="${item.loadingQty}"
                                        min="0"
                                        max="${item.poQuantity}"
                                        ${!canEditLoadingQty ? 'disabled style="background: #f5f5f5; text-align: right;"' : 'style="text-align: right;"'}>
                                </td>
                                <td style="text-align: right;">
                                    <input type="text" class="form-control" value="$${(item.unitCost || 0).toFixed(2)}" disabled style="background: #f5f5f5; text-align: right;">
                                </td>
                                <td style="text-align: right;">
                                    <input type="text" class="form-control loading-total" data-index="${index}"
                                        value="$${((item.loadingQty || 0) * (item.unitCost || 0)).toFixed(2)}" disabled style="background: #f5f5f5; text-align: right; font-weight: 600;">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot style="background: #f8fafc; font-weight: 600;">
                        <tr>
                            <td colspan="2" style="text-align: right;">Totals:</td>
                            <td style="text-align: right;">${totalPOQty}</td>
                            <td style="text-align: right;" id="total-loading-qty">${totalLoadingQty}</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right;" id="total-loading-value">$${totalValue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            ${canEditLoadingQty ? `
                <div style="margin-top: 12px; padding: 12px; background: #f0f9ff; border-radius: 6px; color: #0369a1; font-size: 13px;">
                    <strong>Note:</strong> Loading Quantity is prefilled with PO Quantity. Update if the actual loading quantity differs.
                </div>
            ` : ''}
        `;
    },

    renderProductionTrackerSection() {
        const isEditable = this.isEditable();

        // Sequential unlock logic:
        // Expected Production Start Date -> unlocks Ready Date
        // Ready Date -> unlocks Container Booked Date (and locks all fields above)
        // Container Booked Date -> unlocks Space Released Date
        // Space Released Date -> unlocks Actual Ship Date (in Logistics Handoff)
        // Actual Ship Date -> unlocks Container Number

        const hasExpProdStart = this.hasExpectedProductionStart();
        const hasReadyDate = this.hasReadyDate();
        const hasContainerBooked = this.hasContainerBookedDate();
        const hasActualShipDate = this.hasActualShipDate();

        // Once Ready Date is entered, lock all fields above it
        const fieldsLockedByReadyDate = hasReadyDate;

        // Once Actual Ship Date is entered, lock all production fields (cannot edit after shipping)
        const fieldsLockedByActualShipDate = hasActualShipDate;

        // Per-field RBAC checks combined with sequential unlock and lock logic
        const canEditOriginPort = window.RBAC.canEditField('EVENT3', 'originPortName') && isEditable && !fieldsLockedByReadyDate && !fieldsLockedByActualShipDate;
        const canEditRequestShipDate = window.RBAC.canEditField('EVENT3', 'requestedShipDate') && isEditable && !fieldsLockedByReadyDate && !fieldsLockedByActualShipDate;
        const canEditAgentApproval = window.RBAC.canEditField('EVENT3', 'factoryAgentApproval') && isEditable && !fieldsLockedByReadyDate && !fieldsLockedByActualShipDate;
        const canEditExpProdDate = window.RBAC.canEditField('EVENT3', 'expProductionDate') && isEditable && !fieldsLockedByReadyDate && !fieldsLockedByActualShipDate;

        // Sequential unlock: Ready Date unlocked when Expected Production Start Date entered
        const canEditReadyDate = window.RBAC.canEditField('EVENT3', 'readyDate') && isEditable && hasExpProdStart && !fieldsLockedByActualShipDate;

        // Sequential unlock: Container Booked unlocked when Ready Date entered
        const canEditContainerBooked = window.RBAC.canEditField('EVENT3', 'containerBookedDate') && isEditable && hasReadyDate && !fieldsLockedByActualShipDate;

        // Sequential unlock: Space Released unlocked when Container Booked entered
        const canEditSpaceReleased = window.RBAC.canEditField('EVENT3', 'spaceReleasedDate') && isEditable && hasContainerBooked && !fieldsLockedByActualShipDate;

        // Hold can still be edited even after shipping (in case of issues)
        const canEditHold = window.RBAC.canEditField('EVENT3', 'hold') && isEditable && !fieldsLockedByActualShipDate;
        const canEditHoldReason = window.RBAC.canEditField('EVENT3', 'holdReason') && isEditable && !fieldsLockedByActualShipDate;

        return `
            <div class="detail-grid">
                <div class="detail-field">
                    <label>PO Number</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.poNumber)}" disabled>
                </div>
                <div class="detail-field">
                    <label>Warehouse</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.warehouse)}" disabled>
                </div>
                <div class="detail-field">
                    <label>PO Creation Date</label>
                    <input type="text" class="form-control" value="${Utils.formatDate(this.editedData.createdDate)}" disabled>
                </div>
                <div class="detail-field">
                    <label>Factory</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.factory)}" disabled>
                </div>
                <div class="detail-field">
                    <label>Factory Agent</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.factoryAgent || this.currentPO.factoryAgent || Utils.getFactoryAgent(this.editedData.factory))}" disabled>
                </div>
                <div class="detail-field">
                    <label>Origin Port Name ${Utils.createFieldInfo('EVENT3', 'originPortName')}</label>
                    <select class="form-control" id="prod-origin-port" ${!canEditOriginPort ? 'disabled' : ''}>
                        <option value="">Select Port</option>
                        ${this.originPorts.map(p => `<option value="${p}" ${this.editedData.originPortName === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div class="detail-field">
                    <label>Request Ship Date ${Utils.createFieldInfo('EVENT3', 'requestedShipDate')}</label>
                    <input type="date" class="form-control" id="prod-request-ship-date"
                        value="${this.editedData.requestShipDate || ''}"
                        ${!canEditRequestShipDate ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>PO Status</label>
                    <div class="form-control" style="background: #f5f5f5; border: none;">
                        ${Utils.createStatusBadge(this.currentPO.poStatus)}
                    </div>
                </div>
                <div class="detail-field">
                    <label>Factory Agent Approval ${Utils.createFieldInfo('EVENT3', 'factoryAgentApproval')}</label>
                    <select class="form-control" id="prod-agent-approval" ${!canEditAgentApproval ? 'disabled' : ''}>
                        <option value="">Select Status</option>
                        <option value="Factory Agent Approved" ${this.editedData.factoryAgentApproval === 'Factory Agent Approved' ? 'selected' : ''}>Factory Agent Approved</option>
                        <option value="Factory Agent Rejected" ${this.editedData.factoryAgentApproval === 'Factory Agent Rejected' ? 'selected' : ''}>Factory Agent Rejected</option>
                    </select>
                </div>
                ${this.editedData.factoryAgentApproval === 'Factory Agent Rejected' ? `
                <div class="detail-field">
                    <label>Rejection Remarks</label>
                    <input type="text" class="form-control" id="prod-rejection-remarks"
                        value="${Utils.escapeHtml(this.editedData.poModificationRequiredReason || '')}"
                        placeholder="Enter rejection reason"
                        ${!canEditAgentApproval ? 'disabled' : ''}>
                </div>
                ` : ''}
                <div class="detail-field">
                    <label>Expected Production Start Date ${Utils.createFieldInfo('EVENT3', 'expProductionDate')}</label>
                    <input type="date" class="form-control" id="prod-exp-start-date"
                        value="${this.editedData.expectedProductionStart || ''}"
                        ${!canEditExpProdDate ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>Ready Date ${Utils.createFieldInfo('EVENT3', 'readyDate')}</label>
                    <input type="date" class="form-control" id="prod-ready-date"
                        value="${this.editedData.readyDate || ''}"
                        ${!canEditReadyDate ? 'disabled' : ''}>
                    <span class="field-hint">${!hasExpProdStart ? 'Enter Expected Production Start Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Container Booked Date ${Utils.createFieldInfo('EVENT3', 'containerBookedDate')}</label>
                    <input type="date" class="form-control" id="prod-container-booked-date"
                        value="${this.editedData.containerBookedDate || ''}"
                        ${!canEditContainerBooked ? 'disabled' : ''}>
                    <span class="field-hint">${!hasReadyDate ? 'Enter Ready Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Space Released Date ${Utils.createFieldInfo('EVENT3', 'spaceReleasedDate')}</label>
                    <input type="date" class="form-control" id="prod-space-released-date"
                        value="${this.editedData.spaceReleasedDate || ''}"
                        ${!canEditSpaceReleased ? 'disabled' : ''}>
                    <span class="field-hint">${!hasContainerBooked ? 'Enter Container Booked Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Hold PO ${Utils.createFieldInfo('EVENT3', 'hold')}</label>
                    <select class="form-control" id="prod-hold-po" ${!canEditHold ? 'disabled' : ''}>
                        <option value="No" ${this.editedData.holdPO === 'No' ? 'selected' : ''}>No</option>
                        <option value="Yes" ${this.editedData.holdPO === 'Yes' ? 'selected' : ''}>Yes</option>
                    </select>
                </div>
                ${this.editedData.holdPO === 'Yes' ? `
                <div class="detail-field">
                    <label>Hold Reason ${Utils.createFieldInfo('EVENT3', 'holdReason')}</label>
                    <input type="text" class="form-control" id="prod-hold-reason"
                        value="${Utils.escapeHtml(this.editedData.holdReason || '')}"
                        placeholder="Enter hold reason"
                        ${!canEditHoldReason ? 'disabled' : ''}>
                </div>
                ` : ''}
            </div>
        `;
    },

    renderLogisticsHandoffSection() {
        const isEditable = this.isEditable();
        const hasSpaceReleased = this.hasSpaceReleasedDate();
        const hasActualShip = this.hasActualShipDate();
        const isOnHold = this.editedData.holdPO === 'Yes';

        // Sequential unlock: Actual Ship Date unlocked when Space Released entered
        // Container Number unlocked when Actual Ship Date entered
        // If Hold PO is Yes, cannot enter Actual Ship Date or Container Number
        const canEditActualShipDate = window.RBAC.canEditField('EVENT3', 'actualShipDate') && isEditable && hasSpaceReleased && !isOnHold;
        const canEditContainerNumber = window.RBAC.canEditField('EVENT3', 'containerNumber') && isEditable && hasActualShip && !isOnHold;

        return `
            <div class="detail-grid">
                <div class="detail-field">
                    <label>Actual Ship Date ${Utils.createFieldInfo('EVENT3', 'actualShipDate')}</label>
                    <input type="date" class="form-control" id="prod-actual-ship-date"
                        value="${this.editedData.actualShipDate || ''}"
                        ${!canEditActualShipDate ? 'disabled' : ''}>
                    <span class="field-hint">${isOnHold ? 'Cannot ship while PO is on Hold' : (!hasSpaceReleased ? 'Enter Space Released Date first' : '&nbsp;')}</span>
                </div>
                <div class="detail-field">
                    <label>Container # ${Utils.createFieldInfo('EVENT3', 'containerNumber')}</label>
                    <input type="text" class="form-control" id="prod-container-number"
                        value="${Utils.escapeHtml(this.editedData.containerNumber || '')}"
                        placeholder="Enter container number"
                        ${!canEditContainerNumber ? 'disabled' : ''}>
                    <span class="field-hint">${isOnHold ? 'Cannot enter while PO is on Hold' : (!hasActualShip ? 'Enter Actual Ship Date first' : '&nbsp;')}</span>
                </div>
            </div>
            ${isOnHold ? `
                <div style="margin-top: 16px; padding: 12px; background: #fef2f2; border-radius: 6px; color: #991b1b; font-size: 14px;">
                    <strong>PO is on Hold.</strong> Actual Ship Date and Container Number cannot be entered until hold is released.
                </div>
            ` : (!hasSpaceReleased ? `
                <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 6px; color: #92400e; font-size: 14px;">
                    Logistics Handoff fields will be enabled once Space Released Date is entered.
                </div>
            ` : '')}
        `;
    },

    renderUpdateSection() {
        const isEditable = this.isEditable();
        const hasReadyDate = this.hasReadyDate();
        const canModify = !hasReadyDate && isEditable;

        if (this.showModificationRequest) {
            return `
                <div class="card" style="margin-top: 24px; border-left: 4px solid #f59e0b;">
                    <div class="card-header">
                        <h3>Reason for Modification Request</h3>
                    </div>
                    <div style="padding: 24px;">
                        <div class="form-group" style="max-width: 100%;">
                            <textarea id="prod-mod-reason" class="form-control" rows="4"
                                placeholder="Enter reason for modification request..."></textarea>
                        </div>
                        <div class="form-actions" style="margin-top: 16px;">
                            <button type="button" id="cancel-prod-mod-btn" class="btn btn-secondary">Cancel</button>
                            <button type="button" id="submit-prod-mod-btn" class="btn btn-warning">Submit Request</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div style="padding: 24px;">
                    ${!isEditable ? `
                        <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; color: #666;">
                            Container Number has been entered. Production tracking is now locked.
                        </div>
                    ` : `
                        <div class="form-actions" style="flex-wrap: wrap;">
                            ${canModify ? `
                                <button type="button" id="prod-mod-required-btn" class="btn btn-warning">
                                    PO Modification Required?
                                </button>
                            ` : `
                                <div style="padding: 8px 16px; background: #f5f5f5; border-radius: 6px; color: #666; font-size: 14px;">
                                    Modification not available after Ready Date is entered.
                                </div>
                            `}
                            <button type="button" id="update-production-btn" class="btn btn-primary">
                                Update Production Tracker
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    init(po) {
        this.currentPO = po;

        if (!this.isAccessible()) return;

        // Production Tracker field listeners
        this.attachFieldListeners();

        // Action button listeners
        this.attachActionListeners();
    },

    attachFieldListeners() {
        // Loading Quantity inputs
        this.attachLoadingQtyListeners();

        // Origin Port
        const originPortSelect = document.getElementById('prod-origin-port');
        if (originPortSelect) {
            originPortSelect.addEventListener('change', (e) => {
                this.editedData.originPortName = e.target.value;
            });
        }

        // Request Ship Date
        const requestShipDate = document.getElementById('prod-request-ship-date');
        if (requestShipDate) {
            requestShipDate.addEventListener('change', (e) => {
                this.editedData.requestShipDate = e.target.value;
            });
        }

        // Factory Agent Approval
        const agentApproval = document.getElementById('prod-agent-approval');
        if (agentApproval) {
            agentApproval.addEventListener('change', (e) => {
                this.editedData.factoryAgentApproval = e.target.value;
                // Update status based on current progress
                this.updateStatusBasedOnProgress();
                // Refresh to show/hide Rejection Remarks field
                window.POWorkflow.refresh();
            });
        }

        // Rejection Remarks
        const rejectionRemarks = document.getElementById('prod-rejection-remarks');
        if (rejectionRemarks) {
            rejectionRemarks.addEventListener('change', (e) => {
                this.editedData.poModificationRequiredReason = e.target.value;
            });
        }

        // Expected Production Start Date
        const expStartDate = document.getElementById('prod-exp-start-date');
        if (expStartDate) {
            expStartDate.addEventListener('change', (e) => {
                this.editedData.expectedProductionStart = e.target.value;
                // Update status based on current progress
                this.updateStatusBasedOnProgress();
                window.POWorkflow.refresh();
            });
        }

        // Ready Date
        const readyDate = document.getElementById('prod-ready-date');
        if (readyDate) {
            readyDate.addEventListener('change', (e) => {
                this.editedData.readyDate = e.target.value;
                // Update status based on current progress
                this.updateStatusBasedOnProgress();
                // Refresh to update field states
                window.POWorkflow.refresh();
            });
        }

        // Container Booked Date
        const containerBookedDate = document.getElementById('prod-container-booked-date');
        if (containerBookedDate) {
            containerBookedDate.addEventListener('change', (e) => {
                this.editedData.containerBookedDate = e.target.value;
                // Update status based on current progress
                this.updateStatusBasedOnProgress();
                window.POWorkflow.refresh();
            });
        }

        // Space Released Date
        const spaceReleasedDate = document.getElementById('prod-space-released-date');
        if (spaceReleasedDate) {
            spaceReleasedDate.addEventListener('change', (e) => {
                this.editedData.spaceReleasedDate = e.target.value;
                // Update status based on current progress
                this.updateStatusBasedOnProgress();
                // Refresh to enable logistics handoff section
                window.POWorkflow.refresh();
            });
        }

        // Hold PO
        const holdPO = document.getElementById('prod-hold-po');
        if (holdPO) {
            holdPO.addEventListener('change', (e) => {
                this.editedData.holdPO = e.target.value;
                // Update status based on current progress (handles Hold Yes/No)
                this.updateStatusBasedOnProgress();
                // Refresh to show/hide Hold Reason field
                window.POWorkflow.refresh();
            });
        }

        // Hold Reason
        const holdReason = document.getElementById('prod-hold-reason');
        if (holdReason) {
            holdReason.addEventListener('change', (e) => {
                this.editedData.holdReason = e.target.value;
            });
        }

        // Actual Ship Date
        const actualShipDate = document.getElementById('prod-actual-ship-date');
        if (actualShipDate) {
            actualShipDate.addEventListener('change', (e) => {
                this.editedData.actualShipDate = e.target.value;
                // Refresh to unlock Container # field
                window.POWorkflow.refresh();
            });
        }

        // Container Number
        const containerNumber = document.getElementById('prod-container-number');
        if (containerNumber) {
            containerNumber.addEventListener('change', (e) => {
                this.editedData.containerNumber = e.target.value;
            });
        }
    },

    attachActionListeners() {
        // PO Modification Required button
        const modRequiredBtn = document.getElementById('prod-mod-required-btn');
        if (modRequiredBtn) {
            modRequiredBtn.addEventListener('click', () => {
                this.showModificationRequest = true;
                window.POWorkflow.refresh();
            });
        }

        // Cancel modification request
        const cancelModBtn = document.getElementById('cancel-prod-mod-btn');
        if (cancelModBtn) {
            cancelModBtn.addEventListener('click', () => {
                this.showModificationRequest = false;
                window.POWorkflow.refresh();
            });
        }

        // Submit modification request
        const submitModBtn = document.getElementById('submit-prod-mod-btn');
        if (submitModBtn) {
            submitModBtn.addEventListener('click', () => this.handleModificationRequest());
        }

        // Update Production Tracker button
        const updateBtn = document.getElementById('update-production-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.handleUpdateProductionTracker());
        }
    },

    attachLoadingQtyListeners() {
        const loadingQtyInputs = document.querySelectorAll('.loading-qty-input');
        loadingQtyInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                let value = parseInt(e.target.value) || 0;

                // Ensure value doesn't exceed PO quantity
                const maxQty = this.loadingItems[index].poQuantity;
                if (value > maxQty) {
                    value = maxQty;
                    e.target.value = value;
                }
                if (value < 0) {
                    value = 0;
                    e.target.value = value;
                }

                // Update the loading item
                this.loadingItems[index].loadingQty = value;

                // Update the row total
                const unitCost = this.loadingItems[index].unitCost || 0;
                const rowTotal = value * unitCost;
                const totalCell = document.querySelector(`.loading-total[data-index="${index}"]`);
                if (totalCell) {
                    totalCell.value = `$${rowTotal.toFixed(2)}`;
                }

                // Update footer totals
                this.updateLoadingTotals();
            });
        });
    },

    updateLoadingTotals() {
        const totalLoadingQty = this.loadingItems.reduce((sum, item) => sum + (item.loadingQty || 0), 0);
        const totalValue = this.loadingItems.reduce((sum, item) => sum + ((item.loadingQty || 0) * (item.unitCost || 0)), 0);

        const totalQtyCell = document.getElementById('total-loading-qty');
        const totalValueCell = document.getElementById('total-loading-value');

        if (totalQtyCell) totalQtyCell.textContent = totalLoadingQty;
        if (totalValueCell) totalValueCell.textContent = `$${totalValue.toFixed(2)}`;
    },

    handleModificationRequest() {
        const reason = document.getElementById('prod-mod-reason').value.trim();
        if (!reason) {
            Utils.showToast('Please enter a reason for modification request', 'error');
            return;
        }

        // Show confirmation modal
        this.showModificationModal(reason);
    },

    showModificationModal(reason) {
        const modalHTML = `
            <div class="modal-overlay" style="z-index: 20000;">
                <div class="modal-container" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Modification Request Submitted</h2>
                        <button type="button" class="modal-close-btn" id="close-prod-mod-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                            <p><strong>PO will be moved back to Event 2 (Modifications) for review.</strong></p>
                        </div>
                        <p><strong>Reason:</strong></p>
                        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px; margin-top: 8px;">${Utils.escapeHtml(reason)}</div>
                        <div style="margin-top: 16px; padding: 12px; background: #fee2e2; border-radius: 8px; color: #991b1b; font-size: 14px;">
                            <strong>Note:</strong> The following fields will be cleared:
                            <ul style="margin: 8px 0 0 20px;">
                                <li>Origin Port Name</li>
                                <li>Request Ship Date</li>
                                <li>Factory Agent Approval</li>
                                <li>Expected Production Start Date</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="cancel-prod-mod-modal-btn" class="btn btn-secondary">Cancel</button>
                        <button type="button" id="confirm-prod-mod-btn" class="btn btn-warning">Confirm Request</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);

        document.getElementById('close-prod-mod-modal').addEventListener('click', () => tempDiv.remove());
        document.getElementById('cancel-prod-mod-modal-btn').addEventListener('click', () => tempDiv.remove());
        document.getElementById('confirm-prod-mod-btn').addEventListener('click', () => {
            // Clear specified fields
            this.currentPO.originPortName = '';
            this.currentPO.requestShipDate = '';
            this.currentPO.factoryAgentApproval = '';
            this.currentPO.expectedProductionStart = '';
            this.currentPO.poModificationRequiredReason = reason;

            // Change status to Open
            this.currentPO.poStatus = 'Open';

            // Reset edited data
            this.editedData = JSON.parse(JSON.stringify(this.currentPO));

            this.showModificationRequest = false;
            tempDiv.remove();

            Utils.showToast('Modification request submitted. PO moved to Open status.', 'success');
            setTimeout(() => window.location.href = '#/po-listing', 1500);
        });
    },

    validateDates() {
        const errors = [];

        // Get all dates
        const requestShipDate = this.editedData.requestShipDate ? new Date(this.editedData.requestShipDate) : null;
        const expProdStart = this.editedData.expectedProductionStart ? new Date(this.editedData.expectedProductionStart) : null;
        const readyDate = this.editedData.readyDate ? new Date(this.editedData.readyDate) : null;
        const containerBookedDate = this.editedData.containerBookedDate ? new Date(this.editedData.containerBookedDate) : null;
        const spaceReleasedDate = this.editedData.spaceReleasedDate ? new Date(this.editedData.spaceReleasedDate) : null;
        const actualShipDate = this.editedData.actualShipDate ? new Date(this.editedData.actualShipDate) : null;

        // Sequential date validation: each date must be >= previous date

        // Expected Production Start Date must be <= Ready Date
        if (expProdStart && readyDate && expProdStart > readyDate) {
            errors.push('Ready Date must be on or after Expected Production Start Date');
        }

        // Ready Date must be <= Container Booked Date
        if (readyDate && containerBookedDate && readyDate > containerBookedDate) {
            errors.push('Container Booked Date must be on or after Ready Date');
        }

        // Container Booked Date must be <= Space Released Date
        if (containerBookedDate && spaceReleasedDate && containerBookedDate > spaceReleasedDate) {
            errors.push('Space Released Date must be on or after Container Booked Date');
        }

        // Space Released Date must be <= Actual Ship Date
        if (spaceReleasedDate && actualShipDate && spaceReleasedDate > actualShipDate) {
            errors.push('Actual Ship Date must be on or after Space Released Date');
        }

        // Request Ship Date validation (if entered, should be reasonable)
        if (requestShipDate && actualShipDate && requestShipDate > actualShipDate) {
            // This is just a warning, not an error - actual ship can be before requested
        }

        return errors;
    },

    handleUpdateProductionTracker() {
        // Validate required fields
        if (this.editedData.holdPO === 'Yes' && !this.editedData.holdReason) {
            Utils.showToast('Please enter a hold reason', 'error');
            return;
        }

        // Validate date sequence
        const dateErrors = this.validateDates();
        if (dateErrors.length > 0) {
            Utils.showToast(dateErrors[0], 'error');
            return;
        }

        // Check if we can move to next event (Logistics) - only Container Number is required
        const canMoveToLogistics = this.editedData.containerNumber && this.editedData.containerNumber.trim() !== '';

        // Track field changes before saving
        const poNumber = this.currentPO.poNumber;

        // Field labels for better readability in history
        const fieldLabels = {
            originPortName: 'Origin Port Name',
            requestShipDate: 'Request Ship Date',
            factoryAgentApproval: 'Factory Agent Approval',
            poModificationRequiredReason: 'Rejection Remarks',
            expectedProductionStart: 'Expected Production Start Date',
            readyDate: 'Ready Date',
            containerBookedDate: 'Container Booked Date',
            spaceReleasedDate: 'Space Released Date',
            holdPO: 'Hold PO',
            holdReason: 'Hold Reason',
            actualShipDate: 'Actual Ship Date',
            containerNumber: 'Container Number'
        };

        // Track each field change
        Object.keys(fieldLabels).forEach(field => {
            const oldValue = this.currentPO[field] || '';
            const newValue = this.editedData[field] || '';
            if (oldValue !== newValue) {
                window.POHistory.trackFieldChange(poNumber, field, oldValue, newValue, fieldLabels[field]);
            }
        });

        // Track status change
        const oldStatus = this.currentPO.poStatus;

        // Save all data to currentPO
        Object.assign(this.currentPO, {
            originPortName: this.editedData.originPortName,
            requestShipDate: this.editedData.requestShipDate,
            factoryAgentApproval: this.editedData.factoryAgentApproval,
            poModificationRequiredReason: this.editedData.poModificationRequiredReason,
            expectedProductionStart: this.editedData.expectedProductionStart,
            readyDate: this.editedData.readyDate,
            containerBookedDate: this.editedData.containerBookedDate,
            spaceReleasedDate: this.editedData.spaceReleasedDate,
            holdPO: this.editedData.holdPO,
            holdReason: this.editedData.holdReason,
            actualShipDate: this.editedData.actualShipDate,
            containerNumber: this.editedData.containerNumber
        });

        // Save loading quantities to PO items
        if (this.currentPO.items && this.loadingItems.length > 0) {
            this.currentPO.items.forEach((item, index) => {
                if (this.loadingItems[index]) {
                    item.loadingQty = this.loadingItems[index].loadingQty;
                }
            });
        }

        // Update status based on progress
        this.updateStatusBasedOnProgress();

        // Track status change if it changed
        if (oldStatus !== this.currentPO.poStatus) {
            window.POHistory.trackStatusChange(poNumber, oldStatus, this.currentPO.poStatus);
        }

        // Move to Logistics only if Container Number has a value
        if (canMoveToLogistics) {
            this.currentPO.poStatus = 'Shipped';
            Utils.showToast('Production tracker updated. PO moved to Shipped status (Event 4: Logistics).', 'success');
            setTimeout(() => {
                window.POWorkflow.activeTab = 'logistics';
                window.POWorkflow.refresh();
            }, 1500);
        } else {
            // Save data and stay on Production page
            Utils.showToast('Production tracker data saved successfully!', 'success');
            window.POWorkflow.refresh();
        }
    },

    // Helper to check if a date has been met (date <= today)
    isDateMet(dateStr) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date <= today;
    },

    updateStatusBasedOnProgress() {
        // If Hold PO is Yes, status is Hold
        if (this.editedData.holdPO === 'Yes') {
            this.currentPO.poStatus = 'Hold';
            return;
        }

        // Determine status based on latest milestone that has been MET (date <= today)
        // Check in reverse order of progress
        if (this.editedData.actualShipDate && this.isDateMet(this.editedData.actualShipDate)) {
            this.currentPO.poStatus = 'Shipped';
        } else if (this.editedData.spaceReleasedDate && this.isDateMet(this.editedData.spaceReleasedDate)) {
            this.currentPO.poStatus = 'Space Released';
        } else if (this.editedData.containerBookedDate && this.isDateMet(this.editedData.containerBookedDate)) {
            this.currentPO.poStatus = 'Container Booked';
        } else if (this.editedData.readyDate && this.isDateMet(this.editedData.readyDate)) {
            this.currentPO.poStatus = 'Ready at Factory';
        } else if (this.editedData.expectedProductionStart && this.isDateMet(this.editedData.expectedProductionStart)) {
            this.currentPO.poStatus = 'In production';
        } else if (this.editedData.factoryAgentApproval === 'Factory Agent Approved') {
            this.currentPO.poStatus = 'Agent Approved';
        } else if (this.editedData.factoryAgentApproval === 'Factory Agent Rejected') {
            this.currentPO.poStatus = 'Agent Rejected';
        } else {
            this.currentPO.poStatus = 'Approved';
        }
    }
};

window.POProductionTab = POProductionTab;
