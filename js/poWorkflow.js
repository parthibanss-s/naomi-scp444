// PO Workflow Component - Main container for all event tabs
const POWorkflow = {
    currentPO: null,
    activeTab: 'modification', // Default tab
    tabs: [
        { id: 'modification', name: 'Event 2: Modifications', event: 'PoModification' },
        { id: 'production', name: 'Event 3: Production', event: 'ProductionTracker' },
        { id: 'logistics', name: 'Event 4: Logistics', event: 'LogisticsTracker' },
        { id: 'inventory', name: 'Event 5: Inventory', event: 'WarehouseInventory' }
    ],

    // Status to tab mapping
    statusToTab: {
        'Open': 'modification',
        'Pending Approval': 'modification',
        'Cancelled': 'modification',
        'Approved': 'production',
        'Agent Approved': 'production',
        'Agent Rejected': 'modification',
        'In production': 'production',
        'Ready at Factory': 'production',
        'Container Booked': 'production',
        'Space Released': 'production',
        'Hold': 'production',
        'Shipped': 'logistics',
        'Arrived At Port': 'logistics',
        'Picked Up': 'logistics',
        'Arrived At WH': 'logistics',
        'Empty Notification': 'logistics',
        'Empty Return': 'inventory',
        'Inventoried': 'inventory'
    },

    render() {
        const session = window.AuthService.getSession();
        if (!session) {
            window.location.href = '#/login';
            return '';
        }

        if (!this.currentPO) {
            return '<div class="card"><p>No PO selected</p></div>';
        }

        return `
            <div class="workflow-header">
                <div class="workflow-title" id="workflow-title-clickable" style="cursor: pointer;">
                    <h1>PO #${Utils.escapeHtml(this.currentPO.poNumber)}</h1>
                    <div class="workflow-status">
                        ${Utils.createStatusBadge(this.currentPO.poStatus)}
                    </div>
                </div>
                ${this.renderRemarksInHeader()}
                <p>Click on PO# to view Purchase Order Details</p>
            </div>

            <div class="workflow-tabs">
                ${this.renderTabs()}
            </div>

            <div class="workflow-content">
                ${this.renderActiveTabContent()}
            </div>

            ${this.renderHistoryAccordion()}

            <div style="margin-top: 24px; display: flex; justify-content: flex-end; align-items: center;">
                <button type="button" id="back-to-listing-btn" class="btn btn-secondary">
                    Back to Listing
                </button>
            </div>
        `;
    },

    renderRemarksInHeader() {
        const status = this.currentPO.poStatus;
        const remarks = this.currentPO.poModificationRequiredReason;
        const holdReason = this.currentPO.holdReason;

        const remarksList = [];

        // Determine remark type based on status
        if (remarks && remarks.trim() !== '') {
            let remarkType = '';
            let textColor = '#92400e';
            let shouldShow = true;

            if (status === 'Cancelled') {
                remarkType = 'Rejection Reason';
                textColor = '#dc2626';
            } else if (status === 'Agent Rejected' || this.currentPO.factoryAgentApproval === 'Factory Agent Rejected') {
                remarkType = 'Factory Agent Rejection Reason';
                textColor = '#7c3aed';
            } else if (status === 'Open' || status === 'Pending Approval') {
                remarkType = 'Modification Reason';
                textColor = '#d97706';
            } else if (status === 'Approved') {
                shouldShow = false;
            } else {
                // For other statuses, no remark needed
                shouldShow = false;
            }

            if (shouldShow) {
                remarksList.push({
                    type: remarkType,
                    reason: remarks,
                    textColor: textColor
                });
            }
        }

        // Hold Reason (separate field)
        if (this.currentPO.holdPO === 'Yes' && holdReason && holdReason.trim() !== '') {
            remarksList.push({
                type: 'Hold Reason',
                reason: holdReason,
                textColor: '#dc2626'
            });
        }

        if (remarksList.length === 0) {
            return '';
        }

        const maxChars = 200;

        return `
            <div style="margin-top: 8px;border: 2px solid #b8b8b8;padding: 10px;border-radius: 10px;box-shadow: 1px 1px 6px 0px #ababab;">
                ${remarksList.map((remark, index) => {
                    const escapedReason = Utils.escapeHtml(remark.reason);
                    const isTruncated = remark.reason.length > maxChars;
                    const truncatedReason = isTruncated ? escapedReason.substring(0, maxChars) + '...' : escapedReason;
                    const remarkId = `remark-${index}-${Date.now()}`;

                    return `
                        <p style="margin: 4px 0; font-size: 14px; color: ${remark.textColor};">
                            <strong>${remark.type}:</strong>
                            <span id="${remarkId}-short" ${!isTruncated ? 'style="display:none;"' : ''}>${truncatedReason}
                                ${isTruncated ? `<a href="javascript:void(0)" onclick="document.getElementById('${remarkId}-short').style.display='none'; document.getElementById('${remarkId}-full').style.display='inline';" style="color: #2563eb; cursor: pointer; font-weight: 500;">Read more</a>` : ''}
                            </span>
                            <span id="${remarkId}-full" style="display: ${isTruncated ? 'none' : 'inline'};">${escapedReason}
                                ${isTruncated ? ` <a href="javascript:void(0)" onclick="document.getElementById('${remarkId}-full').style.display='none'; document.getElementById('${remarkId}-short').style.display='inline';" style="color: #2563eb; cursor: pointer; font-weight: 500;">Show less</a>` : ''}
                            </span>
                        </p>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderHistoryAccordion() {
        const auditLog = this.getAuditLog();
        const historyCount = auditLog.length;

        return `
            <div style="margin-top: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div id="history-accordion-toggle"
                     style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f9fafb; cursor: pointer; user-select: none;"
                     onmouseover="this.style.background='#f3f4f6'"
                     onmouseout="this.style.background='#f9fafb'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span id="history-accordion-icon" style="font-size: 12px; color: #6b7280;">▶</span>
                        <span style="font-weight: 600; color: #374151;">PO History & Audit Log</span>
                        <span style="background: #e5e7eb; color: #6b7280; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${historyCount}</span>
                    </div>
                    <span id="history-accordion-hint" style="font-size: 12px; color: #9ca3af;">Click to expand</span>
                </div>
                <div id="history-accordion-content" style="display: none; border-top: 1px solid #e5e7eb;">
                    <div style="max-height: 300px; overflow-y: auto;">
                        <table class="data-table" style="margin: 0; border: none;">
                            <thead>
                                <tr style="background: #f9fafb;">
                                    <th style="padding: 10px 12px; font-size: 13px; width: 45%;">Detail</th>
                                    <th style="padding: 10px 12px; font-size: 13px; width: 20%;">Who</th>
                                    <th style="padding: 10px 12px; font-size: 13px; width: 15%;">Action</th>
                                    <th style="padding: 10px 12px; font-size: 13px; width: 20%;">When</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${auditLog.length === 0 ?
                                    '<tr><td colspan="4" style="text-align: center; color: #999; padding: 20px;">No history available yet.</td></tr>'
                                    : auditLog.map((log, index) => {
                                        const maxChars = 80;
                                        const detail = log.detail || '';
                                        const isTruncated = detail.length > maxChars;
                                        const displayDetail = isTruncated ? detail.substring(0, maxChars) + '...' : detail;
                                        const rowId = 'history-detail-' + index;
                                        return `
                                        <tr>
                                            <td style="padding: 8px 12px; font-size: 13px;">
                                                <span id="${rowId}-short" style="${!isTruncated ? 'display:none;' : ''}">${Utils.escapeHtml(displayDetail)}
                                                    ${isTruncated ? `<a href="javascript:void(0)" onclick="document.getElementById('${rowId}-short').style.display='none'; document.getElementById('${rowId}-full').style.display='inline';" style="color: #2563eb; cursor: pointer; margin-left: 4px; font-size: 12px;">more</a>` : ''}
                                                </span>
                                                <span id="${rowId}-full" style="display: ${isTruncated ? 'none' : 'inline'};">${Utils.escapeHtml(detail)}
                                                    ${isTruncated ? ` <a href="javascript:void(0)" onclick="document.getElementById('${rowId}-full').style.display='none'; document.getElementById('${rowId}-short').style.display='inline';" style="color: #2563eb; cursor: pointer; margin-left: 4px; font-size: 12px;">less</a>` : ''}
                                                </span>
                                            </td>
                                            <td style="padding: 8px 12px; font-size: 13px;">${Utils.escapeHtml(log.who)}</td>
                                            <td style="padding: 8px 12px; font-size: 13px;">${Utils.escapeHtml(log.action)}</td>
                                            <td style="padding: 8px 12px; font-size: 13px;">${Utils.escapeHtml(log.when)}</td>
                                        </tr>
                                    `}).join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderTabs() {
        const session = window.AuthService.getSession();
        const currentStageTabId = this.statusToTab[this.currentPO.poStatus];
        const currentStageIndex = this.tabs.findIndex(t => t.id === currentStageTabId);

        return this.tabs.map((tab, tabIndex) => {
            const isActive = this.activeTab === tab.id;
            const hasAccess = window.RBAC.canAccessEvent(tab.event);
            const isReached = this.isTabAccessible(tab.id);
            const isNotYetReached = !isReached;
            const isPreviousStage = tabIndex < currentStageIndex; // Tab is before current stage
            const isCurrentStage = tab.id === currentStageTabId; // Tab is the current PO stage

            // Hide tabs that the role doesn't have access to
            if (!hasAccess) {
                return '';
            }

            // Can navigate to: any reached tab (backward)
            // Cannot navigate to: tabs not yet reached
            const isDisabled = isNotYetReached;

            // View-only if: previous stage (completed)
            const isViewOnly = isReached && isPreviousStage;

            // Build class list
            let classes = ['workflow-tab'];
            if (isActive) classes.push('active');
            if (isCurrentStage && !isNotYetReached) classes.push('current-stage');
            if (isViewOnly) classes.push('view-only');
            if (isNotYetReached) classes.push('not-reached');

            // Build title tooltip
            let title = '';
            if (isNotYetReached) {
                title = 'PO has not reached this stage yet';
            } else if (isCurrentStage) {
                title = 'Current PO stage';
            } else if (isViewOnly) {
                title = 'View only - Previous stage';
            }

            return `
                <button
                    class="${classes.join(' ')}"
                    data-tab="${tab.id}"
                    ${isDisabled ? 'disabled' : ''}
                    title="${title}"
                >
                    ${tab.name}
                </button>
            `;
        }).join('');
    },

    isTabAccessible(tabId) {
        // Determine which tabs are accessible based on PO status
        const currentTabIndex = this.tabs.findIndex(t => t.id === this.statusToTab[this.currentPO.poStatus]);
        const targetTabIndex = this.tabs.findIndex(t => t.id === tabId);

        // Special case: Logistics tab requires Container Number to be entered
        if (tabId === 'logistics') {
            const hasContainerNumber = this.currentPO.containerNumber && this.currentPO.containerNumber.trim() !== '';
            if (!hasContainerNumber) {
                return false;
            }
        }

        // Special case: Inventory tab also requires Container Number (since it comes after Logistics)
        if (tabId === 'inventory') {
            const hasContainerNumber = this.currentPO.containerNumber && this.currentPO.containerNumber.trim() !== '';
            if (!hasContainerNumber) {
                return false;
            }
        }

        // Can access current tab and all previous tabs
        return targetTabIndex <= currentTabIndex;
    },

    renderActiveTabContent() {
        switch (this.activeTab) {
            case 'modification':
                return window.POModificationTab.render(this.currentPO);
            case 'production':
                return window.POProductionTab.render(this.currentPO);
            case 'logistics':
                return window.POLogisticsTab.render(this.currentPO);
            case 'inventory':
                return window.POInventoryTab.render(this.currentPO);
            default:
                return '<div class="card"><p>Tab content not available</p></div>';
        }
    },

    init() {
        // Tab click listeners - all tabs are clickable (except those without RBAC access)
        const tabBtns = document.querySelectorAll('.workflow-tab:not([disabled])');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.activeTab = tabId;
                this.refresh();
            });
        });

        // PO title click to show details modal
        const titleClickable = document.getElementById('workflow-title-clickable');
        if (titleClickable) {
            titleClickable.addEventListener('click', () => {
                this.showPODetailsModal();
            });
        }

        // History accordion toggle
        const historyToggle = document.getElementById('history-accordion-toggle');
        if (historyToggle) {
            historyToggle.addEventListener('click', () => {
                const content = document.getElementById('history-accordion-content');
                const icon = document.getElementById('history-accordion-icon');
                const hint = document.getElementById('history-accordion-hint');
                if (content && icon) {
                    const isExpanded = content.style.display !== 'none';
                    content.style.display = isExpanded ? 'none' : 'block';
                    icon.textContent = isExpanded ? '▶' : '▼';
                    if (hint) {
                        hint.textContent = isExpanded ? 'Click to expand' : 'Click to collapse';
                    }
                }
            });
        }

        // Back to listing button
        const backBtn = document.getElementById('back-to-listing-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '#/po-listing';
            });
        }

        // Initialize active tab component
        this.initActiveTab();
    },

    initActiveTab() {
        switch (this.activeTab) {
            case 'modification':
                window.POModificationTab.init(this.currentPO);
                break;
            case 'production':
                window.POProductionTab.init(this.currentPO);
                break;
            case 'logistics':
                window.POLogisticsTab.init(this.currentPO);
                break;
            case 'inventory':
                window.POInventoryTab.init(this.currentPO);
                break;
        }
    },

    showPODetailsModal() {
        const totalValue = this.calculateTotalValue();

        const modalHTML = `
            <div class="modal-overlay" id="po-details-modal">
                <div class="modal-container" style="max-width: 900px;">
                    <div class="modal-header">
                        <h2>Purchase Order Details - ${Utils.escapeHtml(this.currentPO.poNumber)}</h2>
                        <button type="button" class="modal-close-btn" id="close-po-details">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="card" style="margin-bottom: 0;">
                            <div class="card-header">
                                <h3>PO Details</h3>
                            </div>
                            <div style="padding: 16px;">
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
                                        <label>Current Status</label>
                                        <div class="detail-value">${Utils.createStatusBadge(this.currentPO.poStatus)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card" style="margin-top: 16px; margin-bottom: 0;">
                            <div class="card-header">
                                <h3>Item Details</h3>
                            </div>
                            <div style="padding: 16px;">
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
                                                        <td>$${amount.toFixed(2)}</td>
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
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="close-details-btn" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);

        // Close button handlers
        document.getElementById('close-po-details').addEventListener('click', () => tempDiv.remove());
        document.getElementById('close-details-btn').addEventListener('click', () => tempDiv.remove());
        document.getElementById('po-details-modal').addEventListener('click', (e) => {
            if (e.target.id === 'po-details-modal') tempDiv.remove();
        });
    },

    getAuditLog() {
        // Get history from POHistory tracking system
        if (this.currentPO && window.POHistory) {
            window.POHistory.initPOHistory(this.currentPO.poNumber, this.currentPO.createdDate);
            return window.POHistory.getFormattedHistory(this.currentPO.poNumber);
        }
        return [];
    },

    calculateTotalValue() {
        if (!this.currentPO || !this.currentPO.items) return 0;
        return this.currentPO.items.reduce((total, item) => {
            return total + (item.unitCost * item.orderQty);
        }, 0);
    },

    loadPO(poNumber) {
        const po = window.MockData.getPOByNumber(poNumber);
        if (!po) {
            Utils.showToast('PO not found', 'error');
            window.location.href = '#/po-listing';
            return false;
        }

        this.currentPO = po;
        // Set active tab based on PO status
        // Special case: If status is 'Shipped' but Container Number is not entered,
        // stay on Production tab instead of going to Logistics
        let targetTab;
        if (po.poStatus === 'Shipped' && (!po.containerNumber || po.containerNumber.trim() === '')) {
            targetTab = 'production';
        } else {
            targetTab = this.statusToTab[po.poStatus] || 'modification';
        }

        // Check if the role has access to the target tab, if not find the first accessible tab
        const targetTabObj = this.tabs.find(t => t.id === targetTab);
        if (targetTabObj && window.RBAC.canAccessEvent(targetTabObj.event)) {
            this.activeTab = targetTab;
        } else {
            // Find the first accessible tab for this role
            const accessibleTab = this.tabs.find(t => window.RBAC.canAccessEvent(t.event));
            this.activeTab = accessibleTab ? accessibleTab.id : 'modification';
        }
        return true;
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

window.POWorkflow = POWorkflow;
