// PO Creation Page Component
const POCreationPage = {
    items: [
        { id: 1, sku: '', description: '', quantity: '' }
    ],
    nextItemId: 2,
    skuDebounceTimers: {},  // Store debounce timers per input
    // Store master details to preserve on refresh
    masterDetails: {
        factory: '',
        warehouse: '',
        costBasis: '',
        shipDate: '',
        eta: ''
    },

    render() {
        const session = window.AuthService.getSession();
        if (!session) {
            window.location.href = '#/login';
            return '';
        }

        return `
            <div class="page-header">
                <h1>Event 1: PO Creation</h1>
                <p>Create a new purchase order</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>PO Master Details</h3>
                </div>

                <form id="po-creation-form">
                    <div class="form-section">
                        <div class="form-group">
                            <label for="factory">Factory <span class="required">*</span></label>
                            <select id="factory" class="form-control" required>
                                <option value="">Select Factory</option>
                                <option value="Factory 1" ${this.masterDetails.factory === 'Factory 1' ? 'selected' : ''}>Factory 1</option>
                                <option value="Factory 2" ${this.masterDetails.factory === 'Factory 2' ? 'selected' : ''}>Factory 2</option>
                                <option value="Factory 3" ${this.masterDetails.factory === 'Factory 3' ? 'selected' : ''}>Factory 3</option>
                                <option value="Factory 4" ${this.masterDetails.factory === 'Factory 4' ? 'selected' : ''}>Factory 4</option>
                                <option value="Factory 5" ${this.masterDetails.factory === 'Factory 5' ? 'selected' : ''}>Factory 5</option>
                                <option value="Factory 6" ${this.masterDetails.factory === 'Factory 6' ? 'selected' : ''}>Factory 6</option>
                                <option value="Factory 7" ${this.masterDetails.factory === 'Factory 7' ? 'selected' : ''}>Factory 7</option>
                                <option value="Factory 8" ${this.masterDetails.factory === 'Factory 8' ? 'selected' : ''}>Factory 8</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="factoryAgent">Factory Agent</label>
                            <input type="text" id="factoryAgent" class="form-control" placeholder="Auto-assigned based on factory" value="${this.masterDetails.factory ? Utils.getFactoryAgent(this.masterDetails.factory) : ''}" disabled>
                        </div>

                        <div class="form-group">
                            <label for="warehouse">Warehouse <span class="required">*</span></label>
                            <select id="warehouse" class="form-control" required>
                                <option value="">Select Warehouse</option>
                                <option value="ARMS" ${this.masterDetails.warehouse === 'ARMS' ? 'selected' : ''}>ARMS</option>
                                <option value="FCI" ${this.masterDetails.warehouse === 'FCI' ? 'selected' : ''}>FCI</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="costBasis">Cost Basis <span class="required">*</span></label>
                            <select id="costBasis" class="form-control" required>
                                <option value="">Select Cost Basis</option>
                                <option value="FOB" ${this.masterDetails.costBasis === 'FOB' ? 'selected' : ''}>FOB</option>
                                <option value="CFR" ${this.masterDetails.costBasis === 'CFR' ? 'selected' : ''}>CFR</option>
                                <option value="CIF" ${this.masterDetails.costBasis === 'CIF' ? 'selected' : ''}>CIF</option>
                                <option value="DDP" ${this.masterDetails.costBasis === 'DDP' ? 'selected' : ''}>DDP</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="shipDate">Ship Date <span class="required">*</span></label>
                            <input
                                type="date"
                                id="shipDate"
                                class="form-control"
                                value="${this.masterDetails.shipDate}"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="eta">ETA <span class="required">*</span></label>
                            <input
                                type="date"
                                id="eta"
                                class="form-control"
                                value="${this.masterDetails.eta}"
                                required
                            >
                        </div>
                    </div>

                    <div class="card-header" style="margin-top: 24px;">
                        <h3>Item Details</h3>
                    </div>

                    <div class="form-section">
                        <div class="table-container">
                            <table class="data-table" id="items-table">
                                <thead>
                                    <tr>
                                        <th style="width: 80px;">S No</th>
                                        <th>SKU <span class="required">*</span></th>
                                        <th>Description</th>
                                        <th>Quantity <span class="required">*</span></th>
                                        <th style="width: 100px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="items-tbody">
                                    ${this.renderItemRows()}
                                </tbody>
                            </table>
                        </div>

                        <div style="margin-top: 16px;">
                            <button type="button" id="add-item-btn" class="btn btn-sm" style="background: var(--success-color); color: white;">
                                + Add Row
                            </button>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" id="cancel-btn" class="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" style="width: 150px;" class="btn btn-primary">
                            Generate PO
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    renderItemRows() {
        return this.items.map((item, index) => `
            <tr data-item-id="${item.id}">
                <td class="text-center">${index + 1}</td>
                <td>
                    <div class="sku-autocomplete-wrapper" data-id="${item.id}">
                        <input
                            type="text"
                            class="form-control sku-input"
                            placeholder="Enter SKU (min 3 chars)"
                            value="${item.sku}"
                            data-item-id="${item.id}"
                            autocomplete="off"
                            required
                        >
                        <div class="sku-autocomplete-dropdown" id="sku-dropdown-${item.id}"></div>
                    </div>
                </td>
                <td class="item-description" data-item-id="${item.id}">${Utils.escapeHtml(item.description || '-')}</td>
                <td>
                    <input
                        type="number"
                        class="form-control item-quantity-input"
                        placeholder="Enter Quantity"
                        value="${item.quantity}"
                        data-item-id="${item.id}"
                        min="1"
                        required
                    >
                </td>
                <td class="text-center">
                    ${this.items.length > 1 ? `
                        <button
                            type="button"
                            class="btn btn-sm remove-item-btn"
                            data-item-id="${item.id}"
                            style="background: var(--danger-color); color: white;"
                        >
                            Remove
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    init() {
        // Factory change - auto-populate Factory Agent
        const factorySelect = document.getElementById('factory');
        if (factorySelect) {
            factorySelect.addEventListener('change', (e) => {
                const factoryAgent = Utils.getFactoryAgent(e.target.value);
                const agentInput = document.getElementById('factoryAgent');
                if (agentInput) {
                    agentInput.value = factoryAgent;
                }
            });
        }

        // Add item button
        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addItem());
        }

        // Remove item buttons
        this.attachRemoveItemListeners();

        // Item input change listeners
        this.attachItemInputListeners();

        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
                    window.location.href = '#/po-listing';
                }
            });
        }

        // Form submit
        const form = document.getElementById('po-creation-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    saveMasterDetails() {
        // Save current form values before refresh
        const factory = document.getElementById('factory');
        const warehouse = document.getElementById('warehouse');
        const costBasis = document.getElementById('costBasis');
        const shipDate = document.getElementById('shipDate');
        const eta = document.getElementById('eta');

        this.masterDetails = {
            factory: factory ? factory.value : '',
            warehouse: warehouse ? warehouse.value : '',
            costBasis: costBasis ? costBasis.value : '',
            shipDate: shipDate ? shipDate.value : '',
            eta: eta ? eta.value : ''
        };
    },

    addItem() {
        // Save master details before refresh
        this.saveMasterDetails();

        this.items.push({
            id: this.nextItemId++,
            sku: '',
            description: '',
            quantity: ''
        });
        this.refresh();
    },

    removeItem(itemId) {
        if (this.items.length === 1) {
            Utils.showToast('At least one item is required', 'error');
            return;
        }

        // Save master details before refresh
        this.saveMasterDetails();

        this.items = this.items.filter(item => item.id !== itemId);
        this.refresh();
    },

    attachRemoveItemListeners() {
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = parseInt(btn.dataset.itemId);
                this.removeItem(itemId);
            });
        });
    },

    attachItemInputListeners() {
        // SKU inputs with autocomplete and debounce
        const skuInputs = document.querySelectorAll('.sku-input');
        skuInputs.forEach(input => {
            // Input event for autocomplete search with debounce (1.5 seconds)
            input.addEventListener('input', (e) => {
                const itemId = e.target.dataset.itemId;
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

            // Change event for manual SKU entry
            input.addEventListener('change', (e) => {
                const itemId = parseInt(e.target.dataset.itemId);
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    item.sku = e.target.value;
                }
                this.hideSkuDropdown(e.target.dataset.itemId);
            });

            // Hide dropdown when clicking outside
            input.addEventListener('blur', (e) => {
                setTimeout(() => {
                    this.hideSkuDropdown(e.target.dataset.itemId);
                }, 200);
            });

            // Show dropdown again on focus if there's enough text
            input.addEventListener('focus', (e) => {
                const searchTerm = e.target.value.trim();
                if (searchTerm.length >= 3) {
                    const itemId = e.target.dataset.itemId;
                    if (this.skuDebounceTimers[itemId]) {
                        clearTimeout(this.skuDebounceTimers[itemId]);
                    }
                    this.showSkuSuggestions(itemId, searchTerm);
                }
            });
        });

        // Quantity inputs
        const quantityInputs = document.querySelectorAll('.item-quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const itemId = parseInt(e.target.dataset.itemId);
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    item.quantity = e.target.value;
                }
            });
        });
    },

    showSkuSuggestions(itemId, searchTerm) {
        const dropdown = document.getElementById(`sku-dropdown-${itemId}`);
        const input = document.querySelector(`.sku-input[data-item-id="${itemId}"]`);
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
            <div class="sku-autocomplete-item" data-sku="${Utils.escapeHtml(sku.sku)}" data-desc="${Utils.escapeHtml(sku.description)}" data-item-id="${itemId}">
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
                e.preventDefault();
                const skuCode = item.dataset.sku;
                const skuDesc = item.dataset.desc;
                const targetItemId = item.dataset.itemId;
                this.selectSku(targetItemId, skuCode, skuDesc);
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

    selectSku(itemId, skuCode, skuDesc) {
        // Find the item
        const item = this.items.find(i => i.id === parseInt(itemId));
        if (!item) return;

        // Update item with SKU and description
        item.sku = skuCode;
        item.description = skuDesc;

        // Hide dropdown
        this.hideSkuDropdown(itemId);

        // Update the input and description cell
        const skuInput = document.querySelector(`.sku-input[data-item-id="${itemId}"]`);
        if (skuInput) {
            skuInput.value = skuCode;
        }

        const descCell = document.querySelector(`.item-description[data-item-id="${itemId}"]`);
        if (descCell) {
            descCell.textContent = skuDesc || '-';
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        // Get form values
        const factory = document.getElementById('factory').value;
        const warehouse = document.getElementById('warehouse').value;
        const costBasis = document.getElementById('costBasis').value;
        const shipDate = document.getElementById('shipDate').value;
        const eta = document.getElementById('eta').value;

        // Validate items
        const hasEmptyItems = this.items.some(item => !item.sku || !item.quantity);
        if (hasEmptyItems) {
            Utils.showToast('Please fill in all item details', 'error');
            return;
        }

        // Validate ship date and ETA
        if (new Date(shipDate) >= new Date(eta)) {
            Utils.showToast('ETA must be after Ship Date', 'error');
            return;
        }

        // Get factory agent
        const factoryAgent = Utils.getFactoryAgent(factory);

        // Create PO object
        const poData = {
            factory,
            factoryAgent,
            warehouse,
            costBasis,
            shipDate,
            eta,
            items: this.items.map(item => ({
                sku: item.sku,
                description: item.description || '',
                quantity: parseInt(item.quantity)
            })),
            createdDate: new Date().toISOString().split('T')[0],
            createdBy: window.AuthService.getSession().username
        };

        console.log('PO Data:', poData);

        // Show success message
        Utils.showToast('Purchase Order created successfully!', 'success');

        // Reset form
        setTimeout(() => {
            this.resetForm();
            window.location.href = '#/po-listing';
        }, 1500);
    },

    resetForm() {
        this.items = [
            { id: 1, sku: '', description: '', quantity: '' }
        ];
        this.nextItemId = 2;
        this.skuDebounceTimers = {};

        // Reset master details
        this.masterDetails = {
            factory: '',
            warehouse: '',
            costBasis: '',
            shipDate: '',
            eta: ''
        };

        const form = document.getElementById('po-creation-form');
        if (form) {
            form.reset();
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

window.POCreationPage = POCreationPage;
