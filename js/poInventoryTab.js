// PO Inventory Tab (Event 5) - Warehouse Inventory Confirmation
const POInventoryTab = {
    currentPO: null,
    editedData: null,

    render(po) {
        this.currentPO = po;
        if (!this.editedData || this.editedData.poNumber !== po.poNumber) {
            this.editedData = JSON.parse(JSON.stringify(po));
        }

        const isAccessible = this.isAccessible();

        if (!isAccessible) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3>Event 5 - Warehouse Inventory Confirmation</h3>
                    </div>
                    <div style="padding: 24px;">
                        <div style="padding: 24px; background: #fef3c7; border-radius: 8px; text-align: center;">
                            <h4 style="margin-bottom: 8px;">PO Not Yet at This Stage</h4>
                            <p style="color: #666;">This PO needs to complete Empty Return before inventory confirmation can begin.</p>
                            <p style="color: #666; margin-top: 8px;">Current Status: ${Utils.createStatusBadge(po.poStatus)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3>Event 5 - Warehouse Inventory Confirmation</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Record received quantities and confirm inventory</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderExpectedReceiptSection()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Inventory Confirmation</h3>
                </div>
                <div style="padding: 24px;">
                    ${this.renderConfirmationSection()}
                </div>
            </div>

            ${this.renderUpdateSection()}
        `;
    },

    isAccessible() {
        const inventoryStatuses = ['Empty Return', 'Inventoried'];
        return inventoryStatuses.includes(this.currentPO.poStatus);
    },

    isEditable() {
        // Inventory is editable until status is 'Inventoried'
        return this.currentPO.poStatus !== 'Inventoried';
    },

    renderExpectedReceiptSection() {
        const isEditable = this.isEditable();
        const items = this.editedData.items || [];

        if (items.length === 0) {
            return `
                <div style="padding: 24px; background: #f5f5f5; border-radius: 8px; text-align: center;">
                    <p style="color: #666;">No items found in this PO.</p>
                </div>
            `;
        }

        return `
            <div class="section-title" style="margin-bottom: 16px;">Expected Receipt</div>
            <div class="inventory-items-list">
                ${items.map((item, index) => this.renderSkuItem(item, index, isEditable)).join('')}
            </div>
            ${this.renderSummary()}
        `;
    },

    renderSkuItem(item, index, isEditable) {
        const orderedQty = item.orderQty || 0;
        const loadingQty = item.loadingQty !== undefined ? item.loadingQty : orderedQty;
        const receivedQty = item.receivedQty || 0;
        const damagedQty = item.damagedQty || 0;
        const missingQty = orderedQty - receivedQty;
        const usableQty = receivedQty - damagedQty;

        return `
            <div class="inventory-sku-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafafa;">
                <div class="sku-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                    <div>
                        <span style="font-weight: 600; font-size: 16px;">${Utils.escapeHtml(item.sku)}</span>
                        <span style="color: #666; margin-left: 8px;">${Utils.escapeHtml(item.description || '')} ${item.variation ? '- ' + Utils.escapeHtml(item.variation) : ''}</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <div style="background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 500;">
                            Ordered: ${orderedQty}
                        </div>
                        <div style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 500;">
                            Loaded: ${loadingQty}
                        </div>
                    </div>
                </div>

                <div class="form-grid" style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <div class="form-group">
                        <label>Loading Qty</label>
                        <input type="text"
                            class="form-control inventory-loading-qty"
                            data-index="${index}"
                            value="${loadingQty}"
                            disabled
                            style="background: #f5f5f5;"
                        />
                    </div>
                    <div class="form-group">
                        <label>Received Qty ${Utils.createFieldInfo('EVENT5', 'receivedQty')}</label>
                        <input type="number"
                            class="form-control inventory-received-qty"
                            data-index="${index}"
                            value="${receivedQty}"
                            min="0"
                            max="${orderedQty}"
                            ${!isEditable ? 'disabled' : ''}
                        />
                    </div>
                    <div class="form-group">
                        <label>Damaged Qty ${Utils.createFieldInfo('EVENT5', 'damagedQty')}</label>
                        <input type="number"
                            class="form-control inventory-damaged-qty"
                            data-index="${index}"
                            value="${damagedQty}"
                            min="0"
                            max="${receivedQty}"
                            ${!isEditable ? 'disabled' : ''}
                        />
                    </div>
                    <div class="form-group">
                        <label>Missing Qty</label>
                        <input type="text"
                            class="form-control inventory-missing-qty"
                            data-index="${index}"
                            value="${missingQty}"
                            disabled
                            style="background: #f5f5f5;"
                        />
                    </div>
                    <div class="form-group">
                        <label>Usable Qty</label>
                        <input type="text"
                            class="form-control inventory-usable-qty"
                            data-index="${index}"
                            value="${usableQty}"
                            disabled
                            style="background: ${usableQty < orderedQty ? '#fef3c7' : '#d1fae5'};"
                        />
                    </div>
                </div>
            </div>
        `;
    },

    renderSummary() {
        const items = this.editedData.items || [];
        let totalOrdered = 0;
        let totalLoading = 0;
        let totalReceived = 0;
        let totalDamaged = 0;
        let totalMissing = 0;
        let totalUsable = 0;

        items.forEach(item => {
            const ordered = item.orderQty || 0;
            const loading = item.loadingQty !== undefined ? item.loadingQty : ordered;
            const received = item.receivedQty || 0;
            const damaged = item.damagedQty || 0;
            const missing = ordered - received;
            const usable = received - damaged;

            totalOrdered += ordered;
            totalLoading += loading;
            totalReceived += received;
            totalDamaged += damaged;
            totalMissing += missing;
            totalUsable += usable;
        });

        return `
            <div class="inventory-summary" style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
                <div class="section-title" style="margin-bottom: 12px;">Summary</div>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; text-align: center;">
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Ordered</div>
                        <div style="font-size: 20px; font-weight: 600; color: #1e40af;">${totalOrdered}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Loading</div>
                        <div style="font-size: 20px; font-weight: 600; color: #92400e;">${totalLoading}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Received</div>
                        <div style="font-size: 20px; font-weight: 600; color: #059669;">${totalReceived}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Damaged</div>
                        <div style="font-size: 20px; font-weight: 600; color: #dc2626;">${totalDamaged}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Missing</div>
                        <div style="font-size: 20px; font-weight: 600; color: #d97706;">${totalMissing}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Usable</div>
                        <div style="font-size: 20px; font-weight: 600; color: #7c3aed;">${totalUsable}</div>
                    </div>
                </div>
            </div>
        `;
    },

    renderConfirmationSection() {
        const isEditable = this.isEditable();

        return `
            <div class="form-grid" style="grid-template-columns: 1fr;">
                <div class="form-group">
                    <label>Inventoried Date ${Utils.createFieldInfo('EVENT5', 'inventoriedDate')}</label>
                    <input type="date"
                        class="form-control"
                        id="inventory-inventoried-date"
                        value="${this.editedData.inventoriedDate || ''}"
                        ${!isEditable ? 'disabled' : ''}
                    />
                </div>
            </div>
        `;
    },

    renderUpdateSection() {
        const isEditable = this.isEditable();

        if (!isEditable) {
            return `
                <div class="card" style="margin-top: 24px;">
                    <div style="padding: 24px;">
                        <div style="padding: 16px; background: #d1fae5; border-radius: 8px; color: #065f46; text-align: center;">
                            <strong>Inventory has been confirmed.</strong> This PO has been fully inventoried.
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card" style="margin-top: 24px;">
                <div style="padding: 24px;">
                    <div class="form-actions">
                        <button type="button" id="confirm-receipt-btn" class="btn btn-primary">
                            Confirm Receipt
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    init(po) {
        this.currentPO = po;
        this.bindEvents();
    },

    bindEvents() {
        // Received Qty change handlers
        const receivedInputs = document.querySelectorAll('.inventory-received-qty');
        receivedInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const value = parseInt(e.target.value) || 0;
                const item = this.editedData.items[index];
                const maxValue = item.orderQty || 0;

                // Ensure received doesn't exceed ordered
                if (value > maxValue) {
                    e.target.value = maxValue;
                    this.editedData.items[index].receivedQty = maxValue;
                } else if (value < 0) {
                    e.target.value = 0;
                    this.editedData.items[index].receivedQty = 0;
                } else {
                    this.editedData.items[index].receivedQty = value;
                }

                // If received qty is less than damaged qty, reset damaged
                if (this.editedData.items[index].receivedQty < (this.editedData.items[index].damagedQty || 0)) {
                    this.editedData.items[index].damagedQty = 0;
                }

                this.updateCalculatedFields(index);
            });
        });

        // Damaged Qty change handlers
        const damagedInputs = document.querySelectorAll('.inventory-damaged-qty');
        damagedInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const value = parseInt(e.target.value) || 0;
                const receivedQty = this.editedData.items[index].receivedQty || 0;

                // Ensure damaged doesn't exceed received
                if (value > receivedQty) {
                    e.target.value = receivedQty;
                    this.editedData.items[index].damagedQty = receivedQty;
                } else if (value < 0) {
                    e.target.value = 0;
                    this.editedData.items[index].damagedQty = 0;
                } else {
                    this.editedData.items[index].damagedQty = value;
                }

                this.updateCalculatedFields(index);
            });
        });

        // Inventoried Date handler
        const inventoriedDateInput = document.getElementById('inventory-inventoried-date');
        if (inventoriedDateInput) {
            inventoriedDateInput.addEventListener('change', (e) => {
                this.editedData.inventoriedDate = e.target.value;
            });
        }

        // Confirm Receipt button
        const confirmBtn = document.getElementById('confirm-receipt-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleConfirmReceipt();
            });
        }
    },

    updateCalculatedFields(index) {
        const item = this.editedData.items[index];
        const orderedQty = item.orderQty || 0;
        const receivedQty = item.receivedQty || 0;
        const damagedQty = item.damagedQty || 0;
        const missingQty = orderedQty - receivedQty;
        const usableQty = receivedQty - damagedQty;

        // Update Missing Qty field
        const missingInput = document.querySelector(`.inventory-missing-qty[data-index="${index}"]`);
        if (missingInput) {
            missingInput.value = missingQty;
        }

        // Update Usable Qty field
        const usableInput = document.querySelector(`.inventory-usable-qty[data-index="${index}"]`);
        if (usableInput) {
            usableInput.value = usableQty;
            usableInput.style.background = usableQty < orderedQty ? '#fef3c7' : '#d1fae5';
        }

        // Update the damaged input max value
        const damagedInput = document.querySelector(`.inventory-damaged-qty[data-index="${index}"]`);
        if (damagedInput) {
            damagedInput.max = receivedQty;
        }

        // Update summary
        this.refreshSummary();
    },

    refreshSummary() {
        const summaryContainer = document.querySelector('.inventory-summary');
        if (summaryContainer) {
            const items = this.editedData.items || [];
            let totalOrdered = 0;
            let totalLoading = 0;
            let totalReceived = 0;
            let totalDamaged = 0;
            let totalMissing = 0;
            let totalUsable = 0;

            items.forEach(item => {
                const ordered = item.orderQty || 0;
                const loading = item.loadingQty !== undefined ? item.loadingQty : ordered;
                const received = item.receivedQty || 0;
                const damaged = item.damagedQty || 0;
                const missing = ordered - received;
                const usable = received - damaged;

                totalOrdered += ordered;
                totalLoading += loading;
                totalReceived += received;
                totalDamaged += damaged;
                totalMissing += missing;
                totalUsable += usable;
            });

            summaryContainer.innerHTML = `
                <div class="section-title" style="margin-bottom: 12px;">Summary</div>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; text-align: center;">
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Ordered</div>
                        <div style="font-size: 20px; font-weight: 600; color: #1e40af;">${totalOrdered}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Loading</div>
                        <div style="font-size: 20px; font-weight: 600; color: #92400e;">${totalLoading}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Received</div>
                        <div style="font-size: 20px; font-weight: 600; color: #059669;">${totalReceived}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Damaged</div>
                        <div style="font-size: 20px; font-weight: 600; color: #dc2626;">${totalDamaged}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Missing</div>
                        <div style="font-size: 20px; font-weight: 600; color: #d97706;">${totalMissing}</div>
                    </div>
                    <div>
                        <div style="font-size: 13px; color: #666;">Total Usable</div>
                        <div style="font-size: 20px; font-weight: 600; color: #7c3aed;">${totalUsable}</div>
                    </div>
                </div>
            `;
        }
    },

    handleConfirmReceipt() {
        // Validate inventoried date
        if (!this.editedData.inventoriedDate || this.editedData.inventoriedDate.trim() === '') {
            Utils.showToast('Please enter Inventoried Date', 'error');
            return;
        }

        // Validate that at least some quantities are entered
        const items = this.editedData.items || [];
        let hasReceivedQty = false;
        items.forEach(item => {
            if (item.receivedQty > 0) {
                hasReceivedQty = true;
            }
        });

        if (!hasReceivedQty) {
            Utils.showToast('Please enter Received Qty for at least one item', 'error');
            return;
        }

        // Calculate missing qty for all items and update currentPO directly
        this.editedData.items.forEach((item, index) => {
            item.missingQty = (item.orderQty || 0) - (item.receivedQty || 0);
            // Update the actual PO items
            this.currentPO.items[index].receivedQty = item.receivedQty;
            this.currentPO.items[index].damagedQty = item.damagedQty;
            this.currentPO.items[index].missingQty = item.missingQty;
        });

        // Update PO data directly (reference to MockData object)
        this.currentPO.inventoriedDate = this.editedData.inventoriedDate;
        this.currentPO.poStatus = 'Inventoried';

        Utils.showToast('Inventory confirmed successfully!', 'success');

        // Refresh the view
        setTimeout(() => {
            window.POWorkflow.refresh();
        }, 1000);
    }
};

window.POInventoryTab = POInventoryTab;
