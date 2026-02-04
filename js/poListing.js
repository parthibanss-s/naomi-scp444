// PO Listing Page Component
const POListingPage = {
    currentPage: 1,
    itemsPerPage: 25,
    filteredPOs: [],
    allPOs: [],
    selectedPOs: [],  // Track selected PO numbers for bulk actions

    filters: {
        search: '',
        status: '',
        warehouse: '',
        factory: '',
        productName: '',
        createdFrom: '',
        createdTo: ''
    },

    // Check if role can perform bulk actions
    canBulkApprove(role) {
        return role === 'NH_LEAD';
    },

    canBulkSubmit(role) {
        return role === 'NH_OPS';
    },

    hasBulkActions(role) {
        return this.canBulkApprove(role) || this.canBulkSubmit(role);
    },

    // Get role type for display logic
    getRoleType(role) {
        if (['NH_LEAD', 'NH_OPS', 'NH_USOPS'].includes(role)) {
            return 'NH_TEAM';
        } else if (role === 'FACTORY_AGENT') {
            return 'FACTORY_AGENT';
        } else if (role === 'WH_AGENT') {
            return 'WH_AGENT';
        }
        return 'DEFAULT';
    },

    // Check if role should see Factory and Product Name filters
    hasExtendedFilters(role) {
        return ['NH_LEAD', 'NH_OPS', 'NH_USOPS', 'FACTORY_AGENT'].includes(role);
    },

    // Status order for sorting
    statusOrder: [
        'Open',
        'Pending Approval',
        'Approved',
        'Agent Approved',
        'Agent Rejected',
        'In production',
        'Ready at Factory',
        'Container Booked',
        'Space Released',
        'Hold',
        'Shipped',
        'Arrived At Port',
        'Picked Up',
        'Arrived At WH',
        'Empty Notification',
        'Empty Return',
        'Inventoried',
        'Cancelled'
    ],

    render() {
        const session = window.AuthService.getSession();
        if (!session) {
            window.location.href = '#/login';
            return '';
        }

        // Load POs based on role
        this.allPOs = window.MockData.getPOsByRole(session.role);
        this.applyFilters();

        const roleType = this.getRoleType(session.role);
        const showBulkActions = this.hasBulkActions(session.role);

        return `
            <div class="page-header">
                <h1>Purchase Order Listing</h1>
                <p>View and manage purchase orders based on your role</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Filters</h3>
                </div>

                ${this.renderFilters(session.role)}
            </div>

            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>Purchase Orders (${this.filteredPOs.length} total)</h3>
                    ${showBulkActions ? this.renderBulkActionBar(session.role) : ''}
                </div>

                ${this.renderTable(roleType, session.role)}

                ${this.renderPagination()}
            </div>
        `;
    },

    renderBulkActionBar(role) {
        const canApprove = this.canBulkApprove(role);
        const canSubmit = this.canBulkSubmit(role);

        return `
            <div class="bulk-action-bar" id="bulk-action-bar">
                <span class="selected-count" id="selected-count">0 selected</span>
                ${canApprove ? `
                    <button class="btn btn-success btn-sm" id="bulk-approve-btn" disabled>
                        Bulk Approve
                    </button>
                ` : ''}
                ${canSubmit ? `
                    <button class="btn btn-info btn-sm" id="bulk-submit-btn" disabled>
                        Submit for Approval
                    </button>
                ` : ''}
            </div>
        `;
    },

    renderFilters(role) {
        const accessibleStatuses = window.ROLE_ACCESSIBLE_STATUSES[role] || [];
        const warehouses = ['ARMS', 'FCI'];
        const factories = ['Factory 1', 'Factory 2', 'Factory 3', 'Factory 4', 'Factory 5', 'Factory 6', 'Factory 7', 'Factory 8'];
        const showExtendedFilters = this.hasExtendedFilters(role);

        return `
            <div class="filters">
                <div class="filter-group">
                    <label>PO Search</label>
                    <input
                        type="text"
                        id="filter-search"
                        class="form-control"
                        placeholder="Search by PO#"
                        value="${this.filters.search}"
                    >
                </div>

                ${showExtendedFilters ? `
                <div class="filter-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        id="filter-product-name"
                        class="form-control"
                        placeholder="Search by Product"
                        value="${this.filters.productName}"
                    >
                </div>

                <div class="filter-group">
                    <label>Factory</label>
                    <select id="filter-factory" class="form-control">
                        <option value="">All Factories</option>
                        ${factories.map(f => `
                            <option value="${f}" ${this.filters.factory === f ? 'selected' : ''}>
                                ${f}
                            </option>
                        `).join('')}
                    </select>
                </div>
                ` : ''}

                <div class="filter-group">
                    <label>Status</label>
                    <select id="filter-status" class="form-control">
                        <option value="">All Statuses</option>
                        ${accessibleStatuses.map(status => `
                            <option value="${status}" ${this.filters.status === status ? 'selected' : ''}>
                                ${status}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="filter-group">
                    <label>Warehouse</label>
                    <select id="filter-warehouse" class="form-control">
                        <option value="">All Warehouses</option>
                        ${warehouses.map(wh => `
                            <option value="${wh}" ${this.filters.warehouse === wh ? 'selected' : ''}>
                                ${wh}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="filter-group">
                    <label>Created From Date</label>
                    <input
                        type="date"
                        id="filter-created-from"
                        class="form-control"
                        value="${this.filters.createdFrom}"
                    >
                </div>

                <div class="filter-group">
                    <label>Created To Date</label>
                    <input
                        type="date"
                        id="filter-created-to"
                        class="form-control"
                        value="${this.filters.createdTo}"
                    >
                </div>

                <div class="filter-actions">
                    <button id="apply-filters-btn" class="btn btn-primary btn-sm">
                        Apply Filters
                    </button>
                    <button id="clear-filters-btn" class="btn btn-sm" style="background: #e2e8f0; color: #334155;">
                        Clear Filters
                    </button>
                </div>
            </div>
        `;
    },

    renderTable(roleType, role) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedPOs = this.filteredPOs.slice(startIndex, endIndex);

        if (paginatedPOs.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No Purchase Orders Found</h3>
                    <p>Try adjusting your filters or check back later.</p>
                </div>
            `;
        }

        const showCheckbox = this.hasBulkActions(role);

        switch (roleType) {
            case 'WH_AGENT':
                return this.renderWarehouseAgentTable(paginatedPOs);
            case 'FACTORY_AGENT':
                return this.renderFactoryAgentTable(paginatedPOs);
            case 'NH_TEAM':
            default:
                return this.renderNHTeamTable(paginatedPOs, showCheckbox, role);
        }
    },

    // NH_LEAD / NH_OPS / NH_USOPS table
    // Columns: [Checkbox], PO, Factory, Product Name, Warehouse, PO Creation Date, Ship Date, ETA, Status, Action
    renderNHTeamTable(paginatedPOs, showCheckbox = false, role = '') {
        // Get selectable POs based on role and status
        const selectablePOs = paginatedPOs.filter(po => this.isSelectableForBulkAction(po, role));
        const allSelectableChecked = selectablePOs.length > 0 &&
            selectablePOs.every(po => this.selectedPOs.includes(po.poNumber));

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${showCheckbox ? `
                                <th style="width: 50px;">
                                    <input type="checkbox" id="select-all-checkbox"
                                        class="bulk-checkbox"
                                        ${allSelectableChecked && selectablePOs.length > 0 ? 'checked' : ''}
                                        ${selectablePOs.length === 0 ? 'disabled' : ''}>
                                </th>
                            ` : ''}
                            <th>PO</th>
                            <th>Factory</th>
                            <th>Product Name</th>
                            <th>Warehouse</th>
                            <th>PO Creation Date</th>
                            <th>Ship Date</th>
                            <th>ETA</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedPOs.map(po => {
                            const isSelectable = this.isSelectableForBulkAction(po, role);
                            const isChecked = this.selectedPOs.includes(po.poNumber);
                            return `
                            <tr class="${isChecked ? 'selected-row' : ''}">
                                ${showCheckbox ? `
                                    <td class="text-center">
                                        ${isSelectable ? `
                                            <input type="checkbox"
                                                class="bulk-checkbox po-checkbox"
                                                data-po="${Utils.escapeHtml(po.poNumber)}"
                                                ${isChecked ? 'checked' : ''}>
                                        ` : `
                                            <input type="checkbox" class="bulk-checkbox" disabled title="Not eligible for bulk action">
                                        `}
                                    </td>
                                ` : ''}
                                <td><strong>${Utils.escapeHtml(po.poNumber)}</strong></td>
                                <td>${Utils.escapeHtml(po.factory)}</td>
                                <td>${Utils.escapeHtml(po.productName || '-')}</td>
                                <td>${Utils.escapeHtml(po.warehouse)}</td>
                                <td>${Utils.formatDate(po.createdDate)}</td>
                                <td>${Utils.formatDate(po.expectShipDate)}</td>
                                <td>${Utils.formatDate(po.eta)}</td>
                                <td>${Utils.createStatusBadge(po.poStatus)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm preview-btn" data-po="${Utils.escapeHtml(po.poNumber)}">
                                        Preview
                                    </button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Check if a PO is selectable for bulk action based on role
    isSelectableForBulkAction(po, role) {
        if (role === 'NH_LEAD') {
            // NH_LEAD can bulk approve POs with status 'Open' or 'Pending Approval'
            return po.poStatus === 'Open' || po.poStatus === 'Pending Approval';
        } else if (role === 'NH_OPS') {
            // NH_OPS can bulk submit POs with status 'Open'
            return po.poStatus === 'Open';
        }
        return false;
    },

    // Factory Agent table
    // Columns: PO, Factory, Product Name, Loading Quantity, Warehouse, PO Creation Date, Required Ship Date, Ready Date, Actual Ship Date, Status, Action
    renderFactoryAgentTable(paginatedPOs) {
        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>PO</th>
                            <th>Factory</th>
                            <th>Product Name</th>
                            <th>Loading Qty</th>
                            <th>Warehouse</th>
                            <th>PO Creation Date</th>
                            <th>Required Ship Date</th>
                            <th>Ready Date</th>
                            <th>Actual Ship Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedPOs.map(po => `
                            <tr>
                                <td><strong>${Utils.escapeHtml(po.poNumber)}</strong></td>
                                <td>${Utils.escapeHtml(po.factory)}</td>
                                <td>${Utils.escapeHtml(po.productName || '-')}</td>
                                <td>${Utils.escapeHtml(po.loadingQuantity || po.totalQuantity || '-')}</td>
                                <td>${Utils.escapeHtml(po.warehouse)}</td>
                                <td>${Utils.formatDate(po.createdDate)}</td>
                                <td>${Utils.formatDate(po.expectShipDate)}</td>
                                <td>${Utils.formatDate(po.readyDate) || '-'}</td>
                                <td>${Utils.formatDate(po.actualShipDate) || '-'}</td>
                                <td>${Utils.createStatusBadge(po.poStatus)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm preview-btn" data-po="${Utils.escapeHtml(po.poNumber)}">
                                        Preview
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Warehouse Agent table
    // Columns: PO, Container, MBL, Destination, Forwarder, Carrier, Vessel Name, Port Date, Vessel Status, LFD, Appointment, Status, Action
    renderWarehouseAgentTable(paginatedPOs) {
        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>PO</th>
                            <th>Container</th>
                            <th>MBL</th>
                            <th>Destination</th>
                            <th>Forwarder</th>
                            <th>Carrier</th>
                            <th>Vessel Name</th>
                            <th>Port Date</th>
                            <th>Vessel Status</th>
                            <th>LFD</th>
                            <th>Appointment</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedPOs.map(po => `
                            <tr>
                                <td><strong>${Utils.escapeHtml(po.poNumber)}</strong></td>
                                <td>${Utils.escapeHtml(po.containerNumber || '-')}</td>
                                <td>${Utils.escapeHtml(po.mbl || '-')}</td>
                                <td>${Utils.escapeHtml(po.destinationPort || '-')}</td>
                                <td>${Utils.escapeHtml(po.forwarder || '-')}</td>
                                <td>${Utils.escapeHtml(po.carrier || '-')}</td>
                                <td>${Utils.escapeHtml(po.vessel || '-')}</td>
                                <td>${Utils.formatDate(po.portDate) || '-'}</td>
                                <td>${Utils.escapeHtml(po.vesselStatus || '-')}</td>
                                <td>${Utils.formatDate(po.lfd) || '-'}</td>
                                <td>${Utils.formatDate(po.appointmentBookDate) || '-'}</td>
                                <td>${Utils.createStatusBadge(po.poStatus)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm preview-btn" data-po="${Utils.escapeHtml(po.poNumber)}">
                                        Preview
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderPagination() {
        const totalPages = Math.ceil(this.filteredPOs.length / this.itemsPerPage);

        if (totalPages <= 1) {
            return '';
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredPOs.length);

        return `
            <div class="pagination">
                <div class="pagination-info">
                    Showing ${startIndex + 1} to ${endIndex} of ${this.filteredPOs.length} entries
                </div>

                <div class="pagination-controls">
                    <button
                        class="pagination-btn"
                        id="prev-page-btn"
                        ${this.currentPage === 1 ? 'disabled' : ''}
                    >
                        Previous
                    </button>

                    ${this.renderPageNumbers(totalPages)}

                    <button
                        class="pagination-btn"
                        id="next-page-btn"
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                    >
                        Next
                    </button>
                </div>
            </div>
        `;
    },

    renderPageNumbers(totalPages) {
        let pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (this.currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages];
            } else if (this.currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages];
            }
        }

        return pages.map(page => {
            if (page === '...') {
                return '<span class="pagination-btn" style="cursor: default; border: none;">...</span>';
            }
            return `
                <button
                    class="pagination-btn page-number-btn ${page === this.currentPage ? 'active' : ''}"
                    data-page="${page}"
                >
                    ${page}
                </button>
            `;
        }).join('');
    },

    init() {
        // Attach filter event listeners
        const searchInput = document.getElementById('filter-search');
        const statusSelect = document.getElementById('filter-status');
        const warehouseSelect = document.getElementById('filter-warehouse');
        const factorySelect = document.getElementById('filter-factory');
        const productNameInput = document.getElementById('filter-product-name');
        const createdFromInput = document.getElementById('filter-created-from');
        const createdToInput = document.getElementById('filter-created-to');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.filters.search = searchInput ? searchInput.value.trim() : '';
                this.filters.status = statusSelect ? statusSelect.value : '';
                this.filters.warehouse = warehouseSelect ? warehouseSelect.value : '';
                this.filters.factory = factorySelect ? factorySelect.value : '';
                this.filters.productName = productNameInput ? productNameInput.value.trim() : '';
                this.filters.createdFrom = createdFromInput ? createdFromInput.value : '';
                this.filters.createdTo = createdToInput ? createdToInput.value : '';

                this.currentPage = 1; // Reset to first page
                this.applyFilters();
                this.refresh();
            });
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.filters = {
                    search: '',
                    status: '',
                    warehouse: '',
                    factory: '',
                    productName: '',
                    createdFrom: '',
                    createdTo: ''
                };

                this.currentPage = 1;
                this.applyFilters();
                this.refresh();
            });
        }

        // Attach pagination event listeners
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.refresh();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredPOs.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.refresh();
                }
            });
        }

        // Page number buttons
        const pageNumberBtns = document.querySelectorAll('.page-number-btn');
        pageNumberBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.dataset.page);
                this.refresh();
            });
        });

        // Preview buttons
        const previewBtns = document.querySelectorAll('.preview-btn');
        previewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const poNumber = btn.dataset.po;
                window.location.href = `#/po-workflow?po=${encodeURIComponent(poNumber)}`;
            });
        });

        // Bulk action checkbox listeners
        this.attachBulkActionListeners();
    },

    attachBulkActionListeners() {
        const session = window.AuthService.getSession();
        if (!session || !this.hasBulkActions(session.role)) return;

        // Select All checkbox
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.handleSelectAll(e.target.checked, session.role);
            });
        }

        // Individual PO checkboxes
        const poCheckboxes = document.querySelectorAll('.po-checkbox');
        poCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handlePOSelect(e.target.dataset.po, e.target.checked);
            });
        });

        // Bulk Approve button (NH_LEAD)
        const bulkApproveBtn = document.getElementById('bulk-approve-btn');
        if (bulkApproveBtn) {
            bulkApproveBtn.addEventListener('click', () => this.handleBulkApprove());
        }

        // Bulk Submit button (NH_OPS)
        const bulkSubmitBtn = document.getElementById('bulk-submit-btn');
        if (bulkSubmitBtn) {
            bulkSubmitBtn.addEventListener('click', () => this.handleBulkSubmit());
        }
    },

    handleSelectAll(checked, role) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedPOs = this.filteredPOs.slice(startIndex, endIndex);

        // Get only selectable POs on current page
        const selectablePOs = paginatedPOs.filter(po => this.isSelectableForBulkAction(po, role));

        if (checked) {
            // Add all selectable POs to selection
            selectablePOs.forEach(po => {
                if (!this.selectedPOs.includes(po.poNumber)) {
                    this.selectedPOs.push(po.poNumber);
                }
            });
        } else {
            // Remove all selectable POs from selection
            selectablePOs.forEach(po => {
                const idx = this.selectedPOs.indexOf(po.poNumber);
                if (idx > -1) {
                    this.selectedPOs.splice(idx, 1);
                }
            });
        }

        this.updateBulkActionUI();
        this.updateCheckboxStates();
    },

    handlePOSelect(poNumber, checked) {
        if (checked) {
            if (!this.selectedPOs.includes(poNumber)) {
                this.selectedPOs.push(poNumber);
            }
        } else {
            const idx = this.selectedPOs.indexOf(poNumber);
            if (idx > -1) {
                this.selectedPOs.splice(idx, 1);
            }
        }

        this.updateBulkActionUI();
        this.updateSelectAllState();
    },

    updateBulkActionUI() {
        const selectedCount = document.getElementById('selected-count');
        const bulkApproveBtn = document.getElementById('bulk-approve-btn');
        const bulkSubmitBtn = document.getElementById('bulk-submit-btn');

        if (selectedCount) {
            selectedCount.textContent = `${this.selectedPOs.length} selected`;
        }

        if (bulkApproveBtn) {
            bulkApproveBtn.disabled = this.selectedPOs.length === 0;
        }

        if (bulkSubmitBtn) {
            bulkSubmitBtn.disabled = this.selectedPOs.length === 0;
        }
    },

    updateCheckboxStates() {
        // Update individual checkboxes
        const poCheckboxes = document.querySelectorAll('.po-checkbox');
        poCheckboxes.forEach(checkbox => {
            checkbox.checked = this.selectedPOs.includes(checkbox.dataset.po);
            const row = checkbox.closest('tr');
            if (row) {
                row.classList.toggle('selected-row', checkbox.checked);
            }
        });
    },

    updateSelectAllState() {
        const session = window.AuthService.getSession();
        if (!session) return;

        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (!selectAllCheckbox) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedPOs = this.filteredPOs.slice(startIndex, endIndex);
        const selectablePOs = paginatedPOs.filter(po => this.isSelectableForBulkAction(po, session.role));

        const allChecked = selectablePOs.length > 0 &&
            selectablePOs.every(po => this.selectedPOs.includes(po.poNumber));

        selectAllCheckbox.checked = allChecked;
    },

    handleBulkApprove() {
        if (this.selectedPOs.length === 0) return;

        const count = this.selectedPOs.length;
        if (!confirm(`Are you sure you want to approve ${count} PO(s)?`)) return;

        // Process each selected PO - update the original MockData
        this.selectedPOs.forEach(poNumber => {
            // Find and update in original MockData.purchaseOrders
            const originalPO = window.MockData.purchaseOrders.find(p => p.poNumber === poNumber);
            // NH_LEAD can approve POs with 'Open' or 'Pending Approval' status
            if (originalPO && (originalPO.poStatus === 'Open' || originalPO.poStatus === 'Pending Approval')) {
                const oldStatus = originalPO.poStatus;
                originalPO.poStatus = 'Approved';

                // Track in history
                window.POHistory.trackApproval(poNumber, 'Bulk PO Approval', true);
                window.POHistory.trackStatusChange(poNumber, oldStatus, 'Approved');
            }
        });

        Utils.showToast(`${count} PO(s) approved successfully!`, 'success');

        // Clear selection and refresh
        this.selectedPOs = [];
        this.refresh();
    },

    handleBulkSubmit() {
        if (this.selectedPOs.length === 0) return;

        const count = this.selectedPOs.length;
        if (!confirm(`Are you sure you want to submit ${count} PO(s) for approval?`)) return;

        // Process each selected PO - update the original MockData
        this.selectedPOs.forEach(poNumber => {
            // Find and update in original MockData.purchaseOrders
            const originalPO = window.MockData.purchaseOrders.find(p => p.poNumber === poNumber);
            if (originalPO && originalPO.poStatus === 'Open') {
                const oldStatus = originalPO.poStatus;
                originalPO.poStatus = 'Pending Approval';

                // Track in history
                window.POHistory.trackStatusChange(poNumber, oldStatus, 'Pending Approval');
            }
        });

        Utils.showToast(`${count} PO(s) submitted for approval!`, 'success');

        // Clear selection and refresh
        this.selectedPOs = [];
        this.refresh();
    },

    applyFilters() {
        let filtered = [...this.allPOs];

        // Search filter (PO number)
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(po =>
                po.poNumber.toLowerCase().includes(searchLower)
            );
        }

        // Factory filter
        if (this.filters.factory) {
            filtered = filtered.filter(po => po.factory === this.filters.factory);
        }

        // Product Name filter
        if (this.filters.productName) {
            const productLower = this.filters.productName.toLowerCase();
            filtered = filtered.filter(po =>
                po.productName && po.productName.toLowerCase().includes(productLower)
            );
        }

        // Status filter
        if (this.filters.status) {
            filtered = filtered.filter(po => po.poStatus === this.filters.status);
        }

        // Warehouse filter
        if (this.filters.warehouse) {
            filtered = filtered.filter(po => po.warehouse === this.filters.warehouse);
        }

        // Date range filter
        if (this.filters.createdFrom) {
            filtered = filtered.filter(po =>
                new Date(po.createdDate) >= new Date(this.filters.createdFrom)
            );
        }

        if (this.filters.createdTo) {
            filtered = filtered.filter(po =>
                new Date(po.createdDate) <= new Date(this.filters.createdTo)
            );
        }

        // Sort by status order
        filtered.sort((a, b) => {
            const statusA = this.statusOrder.indexOf(a.poStatus);
            const statusB = this.statusOrder.indexOf(b.poStatus);

            // If status not found in order list, put it at the end
            const orderA = statusA === -1 ? 9999 : statusA;
            const orderB = statusB === -1 ? 9999 : statusB;

            return orderA - orderB;
        });

        this.filteredPOs = filtered;
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

window.POListingPage = POListingPage;
