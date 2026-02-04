// PO Details Modal and Preview Component
const PODetailsModal = {
    currentPO: null,
    auditLog: [],
    historyVisible: false,

    render() {
        if (!this.currentPO) return '';

        const totalValue = this.calculateTotalValue();
        const isModificationEvent = this.currentPO.poStatus === 'Open' || this.currentPO.poStatus === 'Pending Approval' || this.currentPO.poStatus === 'Cancelled';
        const isReadOnly = this.currentPO.poStatus === 'Cancelled';

        return `
            <div class="modal-overlay" id="po-details-modal">
                <div class="modal-container" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h2>PO #${Utils.escapeHtml(this.currentPO.poNumber)} - ${this.currentPO.poStatus}</h2>
                        <button type="button" class="modal-close-btn" id="close-po-details">&times;</button>
                    </div>

                    <div class="modal-body">
                        <!-- PO Detail Section -->
                        <div class="card">
                            <div class="card-header">
                                <h3>Purchase Order Details</h3>
                            </div>
                            <div style="padding: 24px;">
                                <div class="detail-grid">
                                    <div class="detail-field">
                                        <label>PO Number</label>
                                        <div class="detail-value">${Utils.escapeHtml(this.currentPO.poNumber)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Factory</label>
                                        <div class="detail-value">${Utils.escapeHtml(this.currentPO.factory)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Warehouse</label>
                                        <div class="detail-value">${Utils.escapeHtml(this.currentPO.warehouse)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Cost Basis</label>
                                        <div class="detail-value">${Utils.escapeHtml(this.currentPO.costBasis || '-')}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Expected Ship Date</label>
                                        <div class="detail-value">${Utils.formatDate(this.currentPO.expectShipDate)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>ETA</label>
                                        <div class="detail-value">${Utils.formatDate(this.currentPO.eta)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Factory Agent</label>
                                        <div class="detail-value">${Utils.escapeHtml(this.currentPO.factoryAgent)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Total PO Value</label>
                                        <div class="detail-value">$${totalValue.toFixed(2)}</div>
                                    </div>
                                    <div class="detail-field">
                                        <label>Created Date</label>
                                        <div class="detail-value">${Utils.formatDate(this.currentPO.createdDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Item Details Section -->
                        <div class="card" style="margin-top: 24px;">
                            <div class="card-header">
                                <h3>Item Details</h3>
                            </div>
                            <div style="padding: 24px;">
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>SKU</th>
                                                <th>Description</th>
                                                <th>Variation</th>
                                                <th>Unit Cost</th>
                                                <th>Order Qty</th>
                                                <th>Amount</th>
                                                <th>Weight</th>
                                                <th>Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${this.currentPO.items.map(item => {
                                                const amount = item.unitCost * item.orderQty;
                                                return `
                                                    <tr>
                                                        <td>${Utils.escapeHtml(item.sku)}</td>
                                                        <td>${Utils.escapeHtml(item.description)}</td>
                                                        <td>${Utils.escapeHtml(item.variation)}</td>
                                                        <td>$${item.unitCost}</td>
                                                        <td>${item.orderQty}</td>
                                                        <td>$${amount}</td>
                                                        <td>${item.weight} kg</td>
                                                        <td>${item.volume} m³</td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- View History Button -->
                        <div style="margin-top: 24px; text-align: right;">
                            <button type="button" id="view-history-btn" class="btn btn-secondary">
                                View History & Audit Log
                            </button>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="close-details-btn" class="btn btn-secondary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    calculateTotalValue() {
        if (!this.currentPO || !this.currentPO.items) return 0;
        return this.currentPO.items.reduce((total, item) => {
            return total + (item.unitCost * item.orderQty);
        }, 0);
    },

    init() {
        const closeBtn = document.getElementById('close-po-details');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        const closeDetailsBtn = document.getElementById('close-details-btn');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', () => this.close());
        }

        const viewHistoryBtn = document.getElementById('view-history-btn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => this.showAuditLog());
        }

        // Close modal on outside click
        const modal = document.getElementById('po-details-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }
    },

    showAuditLog() {
        // For now, show a simple implementation
        const auditHTML = `
            <div class="audit-log-modal">
                <div class="modal-overlay" style="z-index: 20000;">
                    <div class="modal-container" style="max-width: 800px; z-index: 20001;">
                        <div class="modal-header">
                            <h2>PO History & Audit Log</h2>
                            <button type="button" class="modal-close-btn" id="close-audit-log">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p style="margin-bottom: 16px; color: #666;">Track all changes made to this purchase order.</p>
                            <div style="max-height: 400px; overflow-y: auto;">
                                <div class="accordion">
                                    ${this.auditLog.length === 0 ?
                                        '<p style="text-align: center; color: #999;">No history available yet.</p>'
                                        : this.auditLog.map((log, idx) => `
                                            <div class="accordion-item">
                                                <button class="accordion-header">
                                                    <span><strong>${log.action}</strong> - ${log.page}</span>
                                                    <span style="float: right; color: #666; font-size: 0.9em;">${log.dateTime}</span>
                                                </button>
                                                <div class="accordion-body">
                                                    <p><strong>Actor:</strong> ${log.actor}</p>
                                                    <p><strong>Change:</strong> ${log.change}</p>
                                                </div>
                                            </div>
                                        `).join('')
                                    }
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" id="close-audit-details-btn" class="btn btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = auditHTML;
        document.body.appendChild(tempDiv);

        const closeBtn = document.getElementById('close-audit-log');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => tempDiv.remove());
        }

        const closeDetailsBtn = document.getElementById('close-audit-details-btn');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', () => tempDiv.remove());
        }

        // Add accordion functionality
        const accordionHeaders = tempDiv.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                body.style.display = body.style.display === 'block' ? 'none' : 'block';
            });
        });
    },

    open(poNumber) {
        const po = window.MockData.getPOByNumber(poNumber);
        if (!po) {
            Utils.showToast('PO not found', 'error');
            return;
        }

        this.currentPO = po;
        this.loadAuditLog();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.render();
        document.body.appendChild(tempDiv);

        this.init();

        // Store reference for later access
        this.modalElement = tempDiv;
    },

    close() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
    },

    loadAuditLog() {
        // Initialize with empty log - can be populated from server
        this.auditLog = [
            {
                action: 'PO Created',
                page: 'Event 1: PO Creation',
                actor: 'User Name',
                change: 'Purchase order created with initial details',
                dateTime: Utils.formatDate(this.currentPO.createdDate)
            }
        ];
    }
};

window.PODetailsModal = PODetailsModal;
