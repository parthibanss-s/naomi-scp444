// PO Modification Tab (Event 2) - Used within POWorkflow
const POModificationTab = {
    currentPO: null,
    editedPO: null,
    editedItems: [],
    nextItemId: 1000,
    showModificationRemarks: false,
    showRejectionRemarks: false,
    factories: ['Factory 1', 'Factory 2', 'Factory 3', 'Factory 4', 'Factory 5', 'Factory 6', 'Factory 7', 'Factory 8'],
    warehouses: ['ARMS', 'FCI'],
    costBasisOptions: ['FOB', 'CFR', 'CIF', 'DDP'],
    skuDebounceTimers: {},  // Store debounce timers per input
    activeAutocompleteInput: null,  // Track which input has active autocomplete

    render(po) {
        this.currentPO = po;
        if (!this.editedPO || this.editedPO.poNumber !== po.poNumber) {
            this.editedPO = JSON.parse(JSON.stringify(po));
            this.editedItems = JSON.parse(JSON.stringify(po.items)).map((item, idx) => {
                // Enrich item with SKU master data (htsCode, availableStock)
                const skuData = MockData.getSKUByCode(item.sku);
                return {
                    ...item,
                    _id: idx + 1,
                    htsCode: skuData ? skuData.htsCode : (item.htsCode || ''),
                    availableStock: skuData ? skuData.availableStock : (item.availableStock || 0)
                };
            });
            this.nextItemId = this.editedItems.length + 1;
        }

        return `

            <div class="card">
                <div class="card-header">
                    <h3>Event 2 - FPO Modifications & Approval</h3>
                </div>
                <div style="padding: 24px;">
                    ${this.renderPODetailsSection()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Customs Estimate</h3>
                </div>
                <div style="padding: 24px;">
                    ${this.renderCustomsEstimateSection()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>Item Details</h3>
                    ${this.isEditable() ? `
                        <button type="button" id="add-item-btn" class="btn btn-sm" style="background: var(--success-color); color: white;">
                            + Add Item
                        </button>
                    ` : ''}
                </div>
                <div style="padding: 24px;">
                    ${this.renderItemDetailsSection()}
                </div>
            </div>

            ${this.renderApprovalActionsSection()}
        `;
    },

    isEditable() {
        return this.currentPO.poStatus === 'Open' || this.currentPO.poStatus === 'Pending Approval' || this.currentPO.poStatus === 'Agent Rejected';
    },

    isReadOnly() {
        return this.currentPO.poStatus === 'Cancelled' || !this.isEditable();
    },


    renderPODetailsSection() {
        const isReadOnly = this.isReadOnly();
        const canEdit = window.RBAC.canEditField('EVENT2', 'factory') && !isReadOnly;
        const canEditCostBasis = window.RBAC.canEditField('EVENT2', 'costBasis') && !isReadOnly;

        return `
            <div class="detail-grid">
                <div class="detail-field">
                    <label>PO Number</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedPO.poNumber)}" disabled>
                </div>
                <div class="detail-field">
                    <label>Factory ${Utils.createFieldInfo('EVENT2', 'factory')} ${!isReadOnly ? '<span class="required">*</span>' : ''}</label>
                    <select class="form-control" id="mod-factory" ${!canEdit ? 'disabled' : ''}>
                        ${this.factories.map(f => `<option value="${f}" ${this.editedPO.factory === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
                <div class="detail-field">
                    <label>Warehouse ${Utils.createFieldInfo('EVENT2', 'warehouse')} ${!isReadOnly ? '<span class="required">*</span>' : ''}</label>
                    <select class="form-control" id="mod-warehouse" ${!canEdit ? 'disabled' : ''}>
                        ${this.warehouses.map(w => `<option value="${w}" ${this.editedPO.warehouse === w ? 'selected' : ''}>${w}</option>`).join('')}
                    </select>
                </div>
                <div class="detail-field">
                    <label>Cost Basis ${Utils.createFieldInfo('EVENT2', 'costBasis')} ${!isReadOnly ? '<span class="required">*</span>' : ''}</label>
                    <select class="form-control" id="mod-cost-basis" ${!canEditCostBasis ? 'disabled' : ''}>
                        <option value="">Select Cost Basis</option>
                        ${this.costBasisOptions.map(cb => `<option value="${cb}" ${this.editedPO.costBasis === cb ? 'selected' : ''}>${cb}</option>`).join('')}
                    </select>
                </div>
                <div class="detail-field">
                    <label>Expected Ship Date ${Utils.createFieldInfo('EVENT2', 'expectShipDate')} ${!isReadOnly ? '<span class="required">*</span>' : ''}</label>
                    <input type="date" class="form-control" id="mod-ship-date" value="${this.editedPO.expectShipDate}" ${!canEdit ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>ETA ${Utils.createFieldInfo('EVENT2', 'eta')} ${!isReadOnly ? '<span class="required">*</span>' : ''}</label>
                    <input type="date" class="form-control" id="mod-eta" value="${this.editedPO.eta}" ${!canEdit ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>Factory Agent</label>
                    <input type="text" class="form-control" id="mod-factory-agent" value="${Utils.escapeHtml(this.editedPO.factoryAgent)}" disabled>
                </div>
                <div class="detail-field">
                    <label>Total PO Value</label>
                    <input type="text" class="form-control" id="mod-total-value" value="$${this.calculateTotalValue().toFixed(2)}" disabled>
                </div>
            </div>
        `;
    },

    renderCustomsEstimateSection() {
        const isReadOnly = this.isReadOnly();
        const canEdit = window.RBAC.canEditField('EVENT2', 'factory') && !isReadOnly;
        const showCustomDuties = this.editedPO.costBasis !== 'DDP';

        return `
            <div class="detail-grid" style="grid-template-columns: repeat(${showCustomDuties ? 4 : 3}, 1fr);">
                <div class="detail-field">
                    <label>Ocean Freight</label>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500;">$</span>
                        <input type="number" class="form-control" id="mod-ocean-freight"
                            value="${this.editedPO.oceanFreight || 0}"
                            ${!canEdit ? 'disabled' : ''}
                            min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
                <div class="detail-field">
                    <label>Drayage</label>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500;">$</span>
                        <input type="number" class="form-control" id="mod-drayage"
                            value="${this.editedPO.drayage || 0}"
                            ${!canEdit ? 'disabled' : ''}
                            min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
                <div class="detail-field">
                    <label>Chassis</label>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500;">$</span>
                        <input type="number" class="form-control" id="mod-chassis"
                            value="${this.editedPO.chassis || 0}"
                            ${!canEdit ? 'disabled' : ''}
                            min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
                ${showCustomDuties ? `
                <div class="detail-field">
                    <label>Custom Duties</label>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500;">$</span>
                        <input type="number" class="form-control" id="mod-custom-duties"
                            value="${this.editedPO.customDuties || 0}"
                            ${!canEdit ? 'disabled' : ''}
                            min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    },

    renderItemDetailsSection() {
        const isReadOnly = this.isReadOnly();
        const canEdit = window.RBAC.canEditField('EVENT2', 'factory') && !isReadOnly;

        return `
            <div class="table-container">
                <table class="data-table" id="mod-items-table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">S No</th>
                            <th>SKU ${!isReadOnly ? '<span class="required">*</span>' : ''}</th>
                            <th>Description</th>
                            <th>Variation</th>
                            <th>Unit Cost</th>
                            <th>Order Qty ${!isReadOnly ? '<span class="required">*</span>' : ''}</th>
                            <th>Amount</th>
                            <th>Weight</th>
                            <th>Volume</th>
                            <th>Total Volume</th>
                            <th>HTS Code</th>
                            <th>Available Stock</th>
                            ${canEdit ? '<th style="width: 80px;">Action</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.editedItems.map((item, idx) => {
                            const amount = (item.unitCost || 0) * (item.orderQty || 0);
                            const totalVolume = (item.orderQty || 0) * (item.volume || 0);
                            return `
                                <tr data-item-id="${item._id}">
                                    <td class="text-center">${idx + 1}</td>
                                    <td>
                                        ${canEdit ? `
                                            <div class="sku-autocomplete-wrapper" data-id="${item._id}">
                                                <input type="text" class="form-control item-sku" data-id="${item._id}" value="${Utils.escapeHtml(item.sku || '')}" placeholder="Enter SKU (min 3 chars)" autocomplete="off">
                                                <div class="sku-autocomplete-dropdown" id="sku-dropdown-${item._id}"></div>
                                            </div>
                                        ` : Utils.escapeHtml(item.sku || '')}
                                    </td>
                                    <td>${Utils.escapeHtml(item.description || '-')}</td>
                                    <td>${Utils.escapeHtml(item.variation || '-')}</td>
                                    <td>$${item.unitCost || 0}</td>
                                    <td>
                                        ${canEdit ? `
                                            <input type="number" class="form-control item-order-qty" data-id="${item._id}" value="${item.orderQty || ''}" placeholder="0" min="1">
                                        ` : item.orderQty || 0}
                                    </td>
                                    <td class="item-amount" data-id="${item._id}">$${amount.toFixed(2)}</td>
                                    <td>${item.weight || 0} kg</td>
                                    <td>${item.volume || 0} m³</td>
                                    <td class="item-total-volume" data-id="${item._id}">${totalVolume.toFixed(3)} m³</td>
                                    <td>${Utils.escapeHtml(item.htsCode || '-')}</td>
                                    <td>${item.availableStock || 0}</td>
                                    ${canEdit ? `
                                        <td class="text-center">
                                            ${this.editedItems.length > 1 ? `
                                                <button type="button" class="btn btn-sm remove-item-btn" data-id="${item._id}" style="background: var(--danger-color); color: white; padding: 4px 8px;">
                                                    Remove
                                                </button>
                                            ` : ''}
                                        </td>
                                    ` : ''}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderApprovalActionsSection() {
        const isReadOnly = this.isReadOnly();
        const isCancelled = this.currentPO.poStatus === 'Cancelled';
        const canApprove = window.RBAC.canPerformAction('EVENT2', 'approveButton');
        const canReject = window.RBAC.canPerformAction('EVENT2', 'rejectButton');
        const canModReq = window.RBAC.canPerformAction('EVENT2', 'modificationRequired');
        const canSave = window.RBAC.canPerformAction('EVENT2', 'save');
        const canSubmit = window.RBAC.canPerformAction('EVENT2', 'submit');

        if (this.showModificationRemarks) {
            return `
                <div class="card" style="margin-top: 24px; border-left: 4px solid #f59e0b;">
                    <div class="card-header">
                        <h3>Request Modification</h3>
                    </div>
                    <div style="padding: 24px;">
                        <p style="margin-bottom: 12px; color: #666;">Remarks (Mandatory for email notification)</p>
                        <textarea id="mod-remarks" class="form-control" rows="4" placeholder="Enter modification remarks..."></textarea>
                        <div class="form-actions" style="margin-top: 16px;">
                            <button type="button" id="cancel-mod-remarks-btn" class="btn btn-secondary">Cancel</button>
                            <button type="button" id="send-mod-request-btn" class="btn btn-warning">Send Modification Request</button>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.showRejectionRemarks) {
            return `
                <div class="card" style="margin-top: 24px; border-left: 4px solid #ef4444;">
                    <div class="card-header">
                        <h3>Reject Purchase Order</h3>
                    </div>
                    <div style="padding: 24px;">
                        <p style="margin-bottom: 12px; color: #666;">Remarks (Mandatory for email notification)</p>
                        <textarea id="reject-remarks" class="form-control" rows="4" placeholder="Enter rejection reason..."></textarea>
                        <div class="form-actions" style="margin-top: 16px;">
                            <button type="button" id="cancel-reject-remarks-btn" class="btn btn-secondary">Cancel</button>
                            <button type="button" id="confirm-rejection-btn" class="btn btn-danger">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Approval Actions</h3>
                </div>
                <div style="padding: 0px 24px;">
                    ${isCancelled ? `
                        <div style="padding: 16px; background: #fee2e2; border-radius: 8px; color: #991b1b;">
                            This PO has been cancelled. No further modifications allowed.
                        </div>
                    ` : isReadOnly ? `
                        <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; color: #666;">
                            This PO has been approved. Event 2 is now locked.
                        </div>
                    ` : `
                        <div class="form-actions" style="flex-wrap: wrap;justify-content: space-between;">
                            <div>
                                ${canSave ? `<button type="button" id="save-changes-btn" class="btn btn-secondary">Save Changes</button>` : ''}
                                ${canSubmit ? `<button type="button" id="submit-changes-btn" class="btn btn-info">Submit for Approval</button>` : ''}                         
                            </div>
                            <div>
                                ${canModReq ? `<button type="button" id="mod-required-btn" class="btn btn-warning">Modification Required</button>` : ''}
                                ${canReject ? `<button type="button" id="reject-po-btn" class="btn btn-danger">Reject PO</button>` : ''}
                                ${canApprove ? `<button type="button" id="approve-po-btn" class="btn btn-success">Approve PO</button>` : ''}
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    calculateTotalValue() {
        return this.editedItems.reduce((total, item) => {
            return total + ((item.unitCost || 0) * (item.orderQty || 0));
        }, 0);
    },

    init(po) {
        this.currentPO = po;

        // Add item button
        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addItem());
        }

        // Remove item buttons
        const removeItemBtns = document.querySelectorAll('.remove-item-btn');
        removeItemBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = parseInt(btn.dataset.id);
                this.removeItem(itemId);
            });
        });

        // Item input listeners
        this.attachItemInputListeners();

        // PO detail listeners
        this.attachPODetailListeners();

        // Customs estimate listeners
        this.attachCustomsEstimateListeners();

        // Approval action listeners
        this.attachApprovalListeners();
    },

    attachItemInputListeners() {
        // SKU with autocomplete and debounce
        document.querySelectorAll('.item-sku').forEach(input => {
            // Input event for autocomplete search with debounce (1.5 seconds)
            input.addEventListener('input', (e) => {
                const itemId = e.target.dataset.id;
                const searchTerm = e.target.value.trim();

                // Clear any existing timer for this input
                if (this.skuDebounceTimers[itemId]) {
                    clearTimeout(this.skuDebounceTimers[itemId]);
                }

                // Hide dropdown if less than 3 characters
                if (searchTerm.length < 3) {
                    this.hideSkuDropdown(itemId);
                    return;
                }

                // Set debounce timer (1.5 seconds = 1500ms)
                this.skuDebounceTimers[itemId] = setTimeout(() => {
                    this.showSkuSuggestions(itemId, searchTerm);
                }, 1500);
            });

            // Change event for manual SKU entry (when user tabs out without selecting)
            input.addEventListener('change', (e) => {
                this.updateItemField(e, 'sku');
                this.hideSkuDropdown(e.target.dataset.id);
            });

            // Hide dropdown when clicking outside
            input.addEventListener('blur', (e) => {
                // Delay to allow click on dropdown item
                setTimeout(() => {
                    this.hideSkuDropdown(e.target.dataset.id);
                }, 200);
            });

            // Show dropdown again on focus if there's enough text
            input.addEventListener('focus', (e) => {
                const searchTerm = e.target.value.trim();
                if (searchTerm.length >= 3) {
                    // Clear existing timer and search immediately
                    const itemId = e.target.dataset.id;
                    if (this.skuDebounceTimers[itemId]) {
                        clearTimeout(this.skuDebounceTimers[itemId]);
                    }
                    this.showSkuSuggestions(itemId, searchTerm);
                }
            });
        });

        // Description, Variation, Unit Cost, Weight, Volume are read-only in Modification Event

        // Order Qty - editable
        document.querySelectorAll('.item-order-qty').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateItemField(e, 'orderQty', true);
                this.updateAmountDisplay(e.target.dataset.id);
                this.updateTotalValue();
            });
        });
    },

    showSkuSuggestions(itemId, searchTerm) {
        const dropdown = document.getElementById(`sku-dropdown-${itemId}`);
        const input = document.querySelector(`.item-sku[data-id="${itemId}"]`);
        if (!dropdown || !input) return;

        // Search SKUs using MockData
        const results = MockData.searchSKUs(searchTerm);

        if (results.length === 0) {
            dropdown.innerHTML = `<div class="sku-autocomplete-item no-results">No SKUs found</div>`;
            this.positionDropdown(dropdown, input);
            dropdown.classList.add('show');
            return;
        }

        // Build dropdown HTML - show only SKU and description
        dropdown.innerHTML = results.map(sku => `
            <div class="sku-autocomplete-item" data-sku="${Utils.escapeHtml(sku.sku)}" data-item-id="${itemId}">
                <span class="sku-code">${Utils.escapeHtml(sku.sku)}</span>
                <span class="sku-desc"> - ${Utils.escapeHtml(sku.description)}</span>
            </div>
        `).join('');

        // Position dropdown using fixed positioning
        this.positionDropdown(dropdown, input);
        dropdown.classList.add('show');

        // Add click listeners to dropdown items
        dropdown.querySelectorAll('.sku-autocomplete-item:not(.no-results)').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();  // Prevent blur from firing first
                const skuCode = item.dataset.sku;
                const targetItemId = item.dataset.itemId;
                this.selectSku(targetItemId, skuCode);
            });
        });
    },

    positionDropdown(dropdown, input) {
        const rect = input.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 2}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.width = `${Math.max(rect.width, 280)}px`;
    },

    hideSkuDropdown(itemId) {
        const dropdown = document.getElementById(`sku-dropdown-${itemId}`);
        if (dropdown) {
            dropdown.classList.remove('show');
            dropdown.innerHTML = '';
        }
    },

    selectSku(itemId, skuCode) {
        // Get SKU details from MockData
        const skuData = MockData.getSKUByCode(skuCode);
        if (!skuData) return;

        // Find the item in editedItems
        const item = this.editedItems.find(i => i._id === parseInt(itemId));
        if (!item) return;

        // Update item with SKU details
        item.sku = skuData.sku;
        item.description = skuData.description;
        item.variation = skuData.variation || '';
        item.unitCost = skuData.unitCost;
        item.weight = skuData.weight || 0;
        item.volume = skuData.volume || 0;
        item.htsCode = skuData.htsCode || '';
        item.availableStock = skuData.availableStock || 0;

        // Hide dropdown
        this.hideSkuDropdown(itemId);

        // Refresh the row to show updated values
        this.updateRowDisplay(itemId);
        this.updateTotalValue();
    },

    updateRowDisplay(itemId) {
        const item = this.editedItems.find(i => i._id === parseInt(itemId));
        if (!item) return;

        const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
        if (!row) return;

        // Update the SKU input
        const skuInput = row.querySelector('.item-sku');
        if (skuInput) {
            skuInput.value = item.sku || '';
        }

        // Update read-only cells (find by column index)
        const cells = row.querySelectorAll('td');
        if (cells.length >= 12) {
            cells[2].textContent = item.description || '-';  // Description
            cells[3].textContent = item.variation || '-';     // Variation
            cells[4].textContent = `$${item.unitCost || 0}`;  // Unit Cost
            const amount = (item.unitCost || 0) * (item.orderQty || 0);
            cells[6].textContent = `$${amount.toFixed(2)}`;   // Amount
            cells[7].textContent = `${item.weight || 0} kg`;  // Weight
            cells[8].textContent = `${item.volume || 0} m³`;  // Volume
            const totalVolume = (item.orderQty || 0) * (item.volume || 0);
            cells[9].textContent = `${totalVolume.toFixed(3)} m³`;  // Total Volume
            cells[10].textContent = item.htsCode || '-';      // HTS Code
            cells[11].textContent = item.availableStock || 0; // Available Stock
        }
    },

    updateItemField(e, field, isNumber = false) {
        const itemId = parseInt(e.target.dataset.id);
        const item = this.editedItems.find(i => i._id === itemId);
        if (item) {
            item[field] = isNumber ? parseFloat(e.target.value) || 0 : e.target.value;
        }
    },

    updateAmountDisplay(itemId) {
        const item = this.editedItems.find(i => i._id === parseInt(itemId));
        if (item) {
            // Update Amount
            const amount = (item.unitCost || 0) * (item.orderQty || 0);
            const amountCell = document.querySelector(`.item-amount[data-id="${itemId}"]`);
            if (amountCell) {
                amountCell.textContent = `$${amount.toFixed(2)}`;
            }
            // Update Total Volume (Quantity × Volume)
            const totalVolume = (item.orderQty || 0) * (item.volume || 0);
            const totalVolumeCell = document.querySelector(`.item-total-volume[data-id="${itemId}"]`);
            if (totalVolumeCell) {
                totalVolumeCell.textContent = `${totalVolume.toFixed(3)} m³`;
            }
        }
    },

    updateTotalValue() {
        const totalInput = document.getElementById('mod-total-value');
        if (totalInput) {
            totalInput.value = `$${this.calculateTotalValue().toFixed(2)}`;
        }
    },

    attachPODetailListeners() {
        const factorySelect = document.getElementById('mod-factory');
        if (factorySelect) {
            factorySelect.addEventListener('change', (e) => {
                this.editedPO.factory = e.target.value;
                this.editedPO.factoryAgent = Utils.getFactoryAgent(e.target.value);
                const agentInput = document.getElementById('mod-factory-agent');
                if (agentInput) {
                    agentInput.value = this.editedPO.factoryAgent;
                }
            });
        }

        const warehouseSelect = document.getElementById('mod-warehouse');
        if (warehouseSelect) {
            warehouseSelect.addEventListener('change', (e) => {
                this.editedPO.warehouse = e.target.value;
            });
        }

        const costBasisSelect = document.getElementById('mod-cost-basis');
        if (costBasisSelect) {
            costBasisSelect.addEventListener('change', (e) => {
                this.editedPO.costBasis = e.target.value;
                // Refresh the page to show/hide Custom Duties based on Cost Basis
                window.POWorkflow.refresh();
            });
        }

        const shipDateInput = document.getElementById('mod-ship-date');
        if (shipDateInput) {
            shipDateInput.addEventListener('change', (e) => {
                this.editedPO.expectShipDate = e.target.value;
            });
        }

        const etaInput = document.getElementById('mod-eta');
        if (etaInput) {
            etaInput.addEventListener('change', (e) => {
                this.editedPO.eta = e.target.value;
            });
        }
    },

    attachCustomsEstimateListeners() {
        const oceanFreightInput = document.getElementById('mod-ocean-freight');
        if (oceanFreightInput) {
            oceanFreightInput.addEventListener('input', (e) => {
                this.editedPO.oceanFreight = parseFloat(e.target.value) || 0;
            });
        }

        const drayageInput = document.getElementById('mod-drayage');
        if (drayageInput) {
            drayageInput.addEventListener('input', (e) => {
                this.editedPO.drayage = parseFloat(e.target.value) || 0;
            });
        }

        const chassisInput = document.getElementById('mod-chassis');
        if (chassisInput) {
            chassisInput.addEventListener('input', (e) => {
                this.editedPO.chassis = parseFloat(e.target.value) || 0;
            });
        }

        const customDutiesInput = document.getElementById('mod-custom-duties');
        if (customDutiesInput) {
            customDutiesInput.addEventListener('input', (e) => {
                this.editedPO.customDuties = parseFloat(e.target.value) || 0;
            });
        }
    },

    attachApprovalListeners() {
        const saveBtn = document.getElementById('save-changes-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveChanges());
        }

        const submitBtn = document.getElementById('submit-changes-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmitForApproval());
        }

        const modReqBtn = document.getElementById('mod-required-btn');
        if (modReqBtn) {
            modReqBtn.addEventListener('click', () => {
                this.showModificationRemarks = true;
                window.POWorkflow.refresh();
            });
        }

        const cancelModBtn = document.getElementById('cancel-mod-remarks-btn');
        if (cancelModBtn) {
            cancelModBtn.addEventListener('click', () => {
                this.showModificationRemarks = false;
                window.POWorkflow.refresh();
            });
        }

        const sendModBtn = document.getElementById('send-mod-request-btn');
        if (sendModBtn) {
            sendModBtn.addEventListener('click', () => this.handleSendModificationRequest());
        }

        const rejectBtn = document.getElementById('reject-po-btn');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                this.showRejectionRemarks = true;
                window.POWorkflow.refresh();
            });
        }

        const cancelRejectBtn = document.getElementById('cancel-reject-remarks-btn');
        if (cancelRejectBtn) {
            cancelRejectBtn.addEventListener('click', () => {
                this.showRejectionRemarks = false;
                window.POWorkflow.refresh();
            });
        }

        const confirmRejectBtn = document.getElementById('confirm-rejection-btn');
        if (confirmRejectBtn) {
            confirmRejectBtn.addEventListener('click', () => this.handleRejectPO());
        }

        const approveBtn = document.getElementById('approve-po-btn');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => this.handleApprovePO());
        }
    },

    addItem() {
        this.editedItems.push({
            _id: this.nextItemId++,
            sku: '',
            description: '',
            variation: '',
            unitCost: 0,
            orderQty: 0,
            weight: 0,
            volume: 0,
            receivedQty: 0,
            damagedQty: 0,
            missingQty: 0
        });
        window.POWorkflow.refresh();
    },

    removeItem(itemId) {
        if (this.editedItems.length <= 1) {
            Utils.showToast('At least one item is required', 'error');
            return;
        }
        this.editedItems = this.editedItems.filter(item => item._id !== itemId);
        window.POWorkflow.refresh();
    },

    validateItems() {
        for (const item of this.editedItems) {
            if (!item.sku || item.sku.trim() === '') {
                Utils.showToast('Please enter SKU for all items', 'error');
                return false;
            }
            if (!item.orderQty || item.orderQty <= 0) {
                Utils.showToast('Please enter valid order quantity for all items', 'error');
                return false;
            }
        }
        return true;
    },

    // Calculate total volume in cubic feet (CFT)
    // Volume in items is stored in m³, convert to CFT (1 m³ = 35.3147 CFT)
    calculateTotalVolumeCFT() {
        const CUBIC_METERS_TO_CFT = 35.3147;
        let totalVolumeM3 = 0;

        for (const item of this.editedItems) {
            const itemVolume = (item.orderQty || 0) * (item.volume || 0);
            totalVolumeM3 += itemVolume;
        }

        return totalVolumeM3 * CUBIC_METERS_TO_CFT;
    },

    // Validate total volume is within limit (2400 CFT max)
    validateVolume() {
        const MAX_VOLUME_CFT = 2400;
        const totalVolumeCFT = this.calculateTotalVolumeCFT();

        if (totalVolumeCFT > MAX_VOLUME_CFT) {
            alert('Total volume should be less than 2400 CFT.');
            return false;
        }
        return true;
    },

    handleSaveChanges() {
        if (!this.validateItems()) return;

        if (new Date(this.editedPO.expectShipDate) >= new Date(this.editedPO.eta)) {
            Utils.showToast('ETA must be after Ship Date', 'error');
            return;
        }

        // Track field changes before saving
        const poNumber = this.currentPO.poNumber;

        const fieldLabels = {
            factory: 'Factory',
            warehouse: 'Warehouse',
            expectShipDate: 'Expected Ship Date',
            eta: 'ETA',
            costBasis: 'Cost Basis'
        };

        Object.keys(fieldLabels).forEach(field => {
            const oldValue = this.currentPO[field] || '';
            const newValue = this.editedPO[field] || '';
            if (oldValue !== newValue) {
                window.POHistory.trackFieldChange(poNumber, field, oldValue, newValue, fieldLabels[field]);
            }
        });

        // Update the original PO
        Object.assign(this.currentPO, this.editedPO);
        this.currentPO.items = this.editedItems.map(item => {
            const { _id, ...rest } = item;
            return rest;
        });

        // Persist changes to MockData
        window.MockData.updatePO(this.currentPO.poNumber, this.currentPO);

        Utils.showToast('Changes saved successfully!', 'success');
        window.POWorkflow.refresh();
    },

    handleSubmitForApproval() {
        if (!this.validateItems()) return;

        if (new Date(this.editedPO.expectShipDate) >= new Date(this.editedPO.eta)) {
            Utils.showToast('ETA must be after Ship Date', 'error');
            return;
        }

        // Volume validation - max 2400 CFT
        if (!this.validateVolume()) {
            return;
        }

        if (!confirm('Are you sure you want to submit this PO for approval?')) return;

        Object.assign(this.currentPO, this.editedPO);
        this.currentPO.items = this.editedItems.map(item => {
            const { _id, ...rest } = item;
            return rest;
        });
        this.currentPO.poStatus = 'Pending Approval';

        // Persist changes to MockData
        window.MockData.updatePO(this.currentPO.poNumber, this.currentPO);

        Utils.showToast('PO submitted for approval!', 'success');
        setTimeout(() => window.location.href = '#/po-listing', 1500);
    },

    handleSendModificationRequest() {
        const remarks = document.getElementById('mod-remarks').value.trim();
        if (!remarks) {
            Utils.showToast('Please enter modification remarks', 'error');
            return;
        }
        this.showModificationModal(remarks);
    },

    handleRejectPO() {
        const remarks = document.getElementById('reject-remarks').value.trim();
        if (!remarks) {
            Utils.showToast('Please enter rejection reason', 'error');
            return;
        }
        this.showRejectionModal(remarks);
    },

    handleApprovePO() {
        // Volume validation - max 2400 CFT
        if (!this.validateVolume()) {
            return;
        }
        this.showApprovalModal();
    },

    showModificationModal(remarks) {
        const modalHTML = `
            <div class="modal-overlay" style="z-index: 20000;">
                <div class="modal-container" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Modification Request Sent</h2>
                        <button type="button" class="modal-close-btn" id="close-mod-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                            <p><strong>Notified to PO Creator via Email.</strong></p>
                        </div>
                        <p><strong>Subject:</strong> Action Required for PO #${Utils.escapeHtml(this.currentPO.poNumber)}</p>
                        <p><strong>Reason:</strong></p>
                        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px; margin-top: 8px;">${Utils.escapeHtml(remarks)}</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="cancel-mod-modal-btn" class="btn btn-secondary">Cancel</button>
                        <button type="button" id="acknowledge-mod-btn" class="btn btn-primary">Acknowledge</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);

        document.getElementById('close-mod-modal').addEventListener('click', () => tempDiv.remove());
        document.getElementById('cancel-mod-modal-btn').addEventListener('click', () => tempDiv.remove());
        document.getElementById('acknowledge-mod-btn').addEventListener('click', () => {
            const oldStatus = this.currentPO.poStatus;
            this.currentPO.poStatus = 'Open';
            this.currentPO.poModificationRequiredReason = remarks;
            this.showModificationRemarks = false;

            // Track modification request
            window.POHistory.trackRemarks(this.currentPO.poNumber, 'Modification Requested', remarks);
            window.POHistory.trackStatusChange(this.currentPO.poNumber, oldStatus, 'Open');

            // Persist changes to MockData
            window.MockData.updatePO(this.currentPO.poNumber, this.currentPO);

            tempDiv.remove();
            Utils.showToast('Modification request sent. PO status changed to Open.', 'success');
            setTimeout(() => window.location.href = '#/po-listing', 1500);
        });
    },

    showRejectionModal(remarks) {
        const modalHTML = `
            <div class="modal-overlay" style="z-index: 20000;">
                <div class="modal-container" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>PO Rejected</h2>
                        <button type="button" class="modal-close-btn" id="close-reject-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: #fee2e2; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                            <p><strong>Notified to PO Creator via Email.</strong></p>
                        </div>
                        <p><strong>Subject:</strong> Rejection Notice for PO #${Utils.escapeHtml(this.currentPO.poNumber)}</p>
                        <p><strong>Reason:</strong></p>
                        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px; margin-top: 8px;">${Utils.escapeHtml(remarks)}</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="cancel-reject-modal-btn" class="btn btn-secondary">Cancel</button>
                        <button type="button" id="acknowledge-reject-btn" class="btn btn-danger">Acknowledge</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);

        document.getElementById('close-reject-modal').addEventListener('click', () => tempDiv.remove());
        document.getElementById('cancel-reject-modal-btn').addEventListener('click', () => tempDiv.remove());
        document.getElementById('acknowledge-reject-btn').addEventListener('click', () => {
            const oldStatus = this.currentPO.poStatus;
            this.currentPO.poStatus = 'Cancelled';
            this.currentPO.poModificationRequiredReason = remarks;
            this.showRejectionRemarks = false;

            // Track rejection
            window.POHistory.trackApproval(this.currentPO.poNumber, 'PO Rejection', false, remarks);
            window.POHistory.trackStatusChange(this.currentPO.poNumber, oldStatus, 'Cancelled');

            // Persist changes to MockData
            window.MockData.updatePO(this.currentPO.poNumber, this.currentPO);

            tempDiv.remove();
            Utils.showToast('PO rejected. Status changed to Cancelled.', 'success');
            setTimeout(() => window.location.href = '#/po-listing', 1500);
        });
    },

    showApprovalModal() {
        const modalHTML = `
            <div class="modal-overlay" style="z-index: 20000;">
                <div class="modal-container" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>PO Approved</h2>
                        <button type="button" class="modal-close-btn" id="close-approval-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: #dcfce7; padding: 16px; border-radius: 8px;">
                            <p><strong>Purchase Order has been approved and moved to the Production Tracker (Event 3).</strong></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="acknowledge-approval-btn" class="btn btn-success">Proceed to Next Step</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);

        document.getElementById('close-approval-modal').addEventListener('click', () => tempDiv.remove());
        document.getElementById('acknowledge-approval-btn').addEventListener('click', () => {
            const oldStatus = this.currentPO.poStatus;
            this.currentPO.poStatus = 'Approved';

            // Track approval
            window.POHistory.trackApproval(this.currentPO.poNumber, 'PO Approval', true);
            window.POHistory.trackStatusChange(this.currentPO.poNumber, oldStatus, 'Approved');

            // Persist changes to MockData
            window.MockData.updatePO(this.currentPO.poNumber, this.currentPO);

            tempDiv.remove();
            Utils.showToast('PO approved successfully!', 'success');
            setTimeout(() => {
                window.POWorkflow.activeTab = 'production';
                window.POWorkflow.refresh();
            }, 1500);
        });
    }
};

window.POModificationTab = POModificationTab;
