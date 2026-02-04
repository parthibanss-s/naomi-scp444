// PO Logistics Tab (Event 4) - Logistics Tracker
const POLogisticsTab = {
    currentPO: null,
    editedData: null,
    telexFile: null,
    showPenaltyCalculator: false,

    // Dropdown options
    forwarders: ['PNB', 'FMED', 'TOPOCEAN', 'HLS', 'DeWell', 'Donglixin', 'Top Ocean'],
    carriers: ['MSC', 'Hapag-Lloyd', 'Maersk', 'SLS', 'CMA CGM Securities B.V.', 'ZIM', 'WHL'],
    costBasisOptions: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP'],

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
                        <h3>Event 4 - Logistics Tracker</h3>
                        <p style="color: #666; font-size: 14px; margin-top: 4px;">Track shipment from factory to warehouse</p>
                    </div>
                    <div style="padding: 24px;">
                        <div style="padding: 24px; background: #fef3c7; border-radius: 8px; text-align: center;">
                            <h4 style="margin-bottom: 8px;">PO Not Yet at This Stage</h4>
                            <p style="color: #666;">This PO needs to be shipped from the factory before logistics tracking can begin.</p>
                            <p style="color: #666; margin-top: 8px;">Current Status: ${Utils.createStatusBadge(po.poStatus)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `

            <div class="card">
                <div class="card-header">
                    <h3>Event 4 - Logistics Tracker</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Track shipment from factory to warehouse</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderSection1ShippingDetails()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Documentation</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Manage shipping documents</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderSection2Documentation()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Port Operations</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Track port arrival and pickup</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderSection3PortOperations()}
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3>Delivery & Returns</h3>
                    <p style="color: #666; font-size: 14px; margin-top: 4px;">Track warehouse delivery and container return</p>
                </div>
                <div style="padding: 24px;">
                    ${this.renderSection4DeliveryReturns()}
                </div>
            </div>

            ${this.renderUpdateSection()}
        `;
    },

    isAccessible() {
        const logisticsStatuses = ['Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification',
            'Empty Return', 'Inventoried'];
        return logisticsStatuses.includes(this.currentPO.poStatus);
    },

    isEditable() {
        // Event 4 is editable until inventoried
        const editableStatuses = ['Shipped', 'Arrived At Port', 'Picked Up', 'Arrived At WH', 'Empty Notification'];
        return editableStatuses.includes(this.currentPO.poStatus);
    },


    // Helper methods for checking field values
    hasPortDate() {
        return this.editedData.portDate && this.editedData.portDate.trim() !== '';
    },

    hasAppointmentBookDate() {
        return this.editedData.appointmentBookDate && this.editedData.appointmentBookDate.trim() !== '';
    },

    hasPickedDate() {
        return this.editedData.pickedDate && this.editedData.pickedDate.trim() !== '';
    },

    hasWarehouseDeliveryDate() {
        return this.editedData.warehouseDeliveryDate && this.editedData.warehouseDeliveryDate.trim() !== '';
    },

    hasEmptyNotificationDate() {
        return this.editedData.emptyNotificationDate && this.editedData.emptyNotificationDate.trim() !== '';
    },

    hasEmptyPickupDate() {
        return this.editedData.emptyPickupDate && this.editedData.emptyPickupDate.trim() !== '';
    },

    isTerminalEnabled() {
        // Terminal enabled 5 days before Port Date
        if (!this.hasPortDate()) return false;
        const portDate = new Date(this.editedData.portDate);
        const today = new Date();
        const diffDays = Math.ceil((portDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 5;
    },

    isFCIWarehouse() {
        return this.editedData.warehouse === 'FCI';
    },

    renderSection1ShippingDetails() {
        const isEditable = this.isEditable();

        // RBAC per-field visibility checks
        const canViewFactory = window.RBAC.canViewField('EVENT4', 'factory');
        const canViewHBL = window.RBAC.canViewField('EVENT4', 'hbl');
        const canViewFreightRate = window.RBAC.canViewField('EVENT4', 'freightRate');

        // RBAC per-field edit checks
        const canEditCarrier = window.RBAC.canEditField('EVENT4', 'carrier') && isEditable;
        const canEditForwarder = window.RBAC.canEditField('EVENT4', 'forwarder') && isEditable;
        const canEditVessel = window.RBAC.canEditField('EVENT4', 'vessel') && isEditable;
        const canEditHBL = window.RBAC.canEditField('EVENT4', 'hbl') && isEditable;
        const canEditMBL = window.RBAC.canEditField('EVENT4', 'mbl') && isEditable;
        // Cost Basis and Actual Ship Date are always disabled in Logistics (view-only from Production)
        const canEditFreightRate = window.RBAC.canEditField('EVENT4', 'freightRate') && isEditable;
        const canEditPortDate = window.RBAC.canEditField('EVENT4', 'portDate') && isEditable;
        const canEditTrackingUrl = window.RBAC.canEditField('EVENT4', 'addTrackingUrl') && isEditable;

        return `
            <div class="detail-grid">
                ${canViewFactory ? `
                <div class="detail-field">
                    <label>Factory</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.factory)}" disabled>
                </div>
                ` : ''}
                <div class="detail-field">
                    <label>Warehouse</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.warehouse)}" disabled>
                </div>
                <div class="detail-field">
                    <label>Destination Port</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.destinationPort || '')}" disabled>
                </div>
                <div class="detail-field">
                    <label>Container #</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.containerNumber || '')}" disabled>
                </div>
                ${canViewHBL ? `
                <div class="detail-field">
                    <label>HBL ${Utils.createFieldInfo('EVENT4', 'hbl')}</label>
                    <input type="text" class="form-control" id="log-hbl"
                        value="${Utils.escapeHtml(this.editedData.hbl || '')}"
                        placeholder="Enter HBL"
                        ${!canEditHBL ? 'disabled' : ''}>
                </div>
                ` : ''}
                <div class="detail-field">
                    <label>MBL ${Utils.createFieldInfo('EVENT4', 'mbl')}</label>
                    <input type="text" class="form-control" id="log-mbl"
                        value="${Utils.escapeHtml(this.editedData.mbl || '')}"
                        placeholder="Enter MBL"
                        ${!canEditMBL ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>Forwarder ${Utils.createFieldInfo('EVENT4', 'forwarder')}</label>
                    <select class="form-control" id="log-forwarder" ${!canEditForwarder ? 'disabled' : ''}>
                        <option value="">Select Forwarder</option>
                        ${this.forwarders.map(f => `<option value="${f}" ${this.editedData.forwarder === f ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
                <div class="detail-field">
                    <label>Carrier ${Utils.createFieldInfo('EVENT4', 'carrier')}</label>
                    <select class="form-control" id="log-carrier" ${!canEditCarrier ? 'disabled' : ''}>
                        <option value="">Select Carrier</option>
                        ${this.carriers.map(c => `<option value="${c}" ${this.editedData.carrier === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="detail-field">
                    <label>Cost Basis</label>
                    <input type="text" class="form-control" value="${Utils.escapeHtml(this.editedData.costBasis || '-')}" disabled>
                </div>
                <div class="detail-field">
                    <label>Vessel ${Utils.createFieldInfo('EVENT4', 'vessel')}</label>
                    <input type="text" class="form-control" id="log-vessel"
                        value="${Utils.escapeHtml(this.editedData.vessel || '')}"
                        placeholder="Enter vessel name"
                        ${!canEditVessel ? 'disabled' : ''}>
                </div>
                ${canViewFreightRate ? `
                <div class="detail-field">
                    <label>Freight Rate ($) ${Utils.createFieldInfo('EVENT4', 'freightRate')}</label>
                    <input type="number" class="form-control" id="log-freight-rate"
                        value="${this.editedData.freightRate || ''}"
                        placeholder="Enter freight rate"
                        ${!canEditFreightRate ? 'disabled' : ''}>
                </div>
                ` : ''}
                <div class="detail-field">
                    <label>Port Date ${Utils.createFieldInfo('EVENT4', 'portDate')}</label>
                    <input type="date" class="form-control" id="log-port-date"
                        value="${this.editedData.portDate || ''}"
                        ${!canEditPortDate ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>Actual Ship Date</label>
                    <input type="text" class="form-control" value="${this.editedData.actualShipDate ? Utils.formatDate(this.editedData.actualShipDate) : '-'}" disabled>
                </div>
                <div class="detail-field" style="grid-column: span 2;">
                    <label>Add Tracking URL ${Utils.createFieldInfo('EVENT4', 'addTrackingUrl')}</label>
                    <input type="url" class="form-control" id="log-tracking-url"
                        value="${Utils.escapeHtml(this.editedData.trackingUrl || '')}"
                        placeholder="Enter tracking URL"
                        ${!canEditTrackingUrl ? 'disabled' : ''}>
                </div>
            </div>
        `;
    },

    renderSection2Documentation() {
        const isEditable = this.isEditable();
        const hasPortDate = this.hasPortDate();

        // RBAC visibility checks
        const canViewTelexRelease = window.RBAC.canViewField('EVENT4', 'telexRelease');
        const canViewTelexDocument = window.RBAC.canViewField('EVENT4', 'telexDocument');
        const canViewCustoms = window.RBAC.canViewField('EVENT4', 'customs');
        const canViewPackingList = window.RBAC.canViewField('EVENT4', 'packingList');
        const canViewLaceyAct = window.RBAC.canViewField('EVENT4', 'laceyAct');

        // RBAC checks for telex actions
        const canEditTelex = window.RBAC.canEditField('EVENT4', 'telexUpload') && isEditable;
        const canUploadTelex = window.RBAC.canEditField('EVENT4', 'telexUpload') && isEditable;
        const canDeleteTelex = window.RBAC.canEditField('EVENT4', 'telexDelete') && isEditable;
        const canPreviewTelex = window.RBAC.canEditField('EVENT4', 'telexPreview');
        const canDownloadTelex = window.RBAC.canEditField('EVENT4', 'telexDownload');

        // RBAC checks for other doc fields - all require Port Date to be entered first
        const canEditCustoms = window.RBAC.canEditField('EVENT4', 'customs') && isEditable && hasPortDate;
        const canEditPackingList = window.RBAC.canEditField('EVENT4', 'packingList') && isEditable && hasPortDate;
        const canEditLaceyAct = window.RBAC.canEditField('EVENT4', 'laceyAct') && isEditable && hasPortDate;
        const canEditDO = window.RBAC.canEditField('EVENT4', 'doField') && isEditable && hasPortDate;

        const telexIsYes = this.editedData.telexRelease === 'Yes';
        const telexHasFile = this.telexFile || (telexIsYes && this.editedData.telexFileName);

        return `
            <div class="detail-grid">
                ${canViewTelexRelease ? `
                <div class="detail-field">
                    <label>Telex Release ${Utils.createFieldInfo('EVENT4', 'telexUpload')}</label>
                    <select class="form-control" id="log-telex-release" ${!canEditTelex ? 'disabled' : ''}>
                        <option value="No" ${this.editedData.telexRelease !== 'Yes' ? 'selected' : ''}>No</option>
                        <option value="Yes" ${this.editedData.telexRelease === 'Yes' ? 'selected' : ''}>Yes</option>
                    </select>
                </div>
                ${telexIsYes && canViewTelexDocument ? `
                    <div class="detail-field">
                        <label>Telex Document</label>
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            ${telexHasFile ? `
                                <span style="padding: 6px 12px; background: #d1fae5; border-radius: 4px; font-size: 13px;">
                                    ${this.telexFile ? this.telexFile.name : 'Document Available'}
                                </span>
                            ` : `
                                <span style="padding: 6px 12px; background: #fee2e2; border-radius: 4px; font-size: 13px;">
                                    No file uploaded
                                </span>
                            `}
                            ${canUploadTelex ? `
                                <input type="file" id="telex-file-input" style="display: none;" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
                                <button type="button" class="btn btn-sm btn-primary" id="telex-upload-btn">
                                    ${telexHasFile ? 'Replace' : 'Upload'}
                                </button>
                            ` : ''}
                            ${telexHasFile && canPreviewTelex ? `
                                <button type="button" class="btn btn-sm btn-secondary" id="telex-preview-btn">Preview</button>
                            ` : ''}
                            ${telexHasFile && canDownloadTelex ? `
                                <button type="button" class="btn btn-sm btn-secondary" id="telex-download-btn">Download</button>
                            ` : ''}
                            ${telexHasFile && canDeleteTelex ? `
                                <button type="button" class="btn btn-sm" id="telex-delete-btn" style="background: #fee2e2; color: #991b1b;">Delete</button>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                ` : ''}
                ${canViewCustoms ? `
                <div class="detail-field">
                    <label>Customs ${Utils.createFieldInfo('EVENT4', 'customs')}</label>
                    <select class="form-control" id="log-customs" ${!canEditCustoms ? 'disabled' : ''}>
                        <option value="">Select Status</option>
                        <option value="Yes" ${this.editedData.customs === 'Yes' ? 'selected' : ''}>Yes</option>
                        <option value="No" ${this.editedData.customs === 'No' ? 'selected' : ''}>No</option>
                    </select>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                ` : ''}
                ${canViewPackingList ? `
                <div class="detail-field">
                    <label>Packing List ${Utils.createFieldInfo('EVENT4', 'packingList')}</label>
                    <select class="form-control" id="log-packing-list" ${!canEditPackingList ? 'disabled' : ''}>
                        <option value="">Select Status</option>
                        <option value="Yes" ${this.editedData.packingList === 'Yes' ? 'selected' : ''}>Yes</option>
                        <option value="No" ${this.editedData.packingList === 'No' ? 'selected' : ''}>No</option>
                    </select>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                ` : ''}
                ${canViewLaceyAct ? `
                <div class="detail-field">
                    <label>Lacey Act ${Utils.createFieldInfo('EVENT4', 'laceyAct')}</label>
                    <select class="form-control" id="log-lacey-act" ${!canEditLaceyAct ? 'disabled' : ''}>
                        <option value="">Select Status</option>
                        <option value="Yes" ${this.editedData.laceyAct === 'Yes' ? 'selected' : ''}>Yes</option>
                        <option value="No" ${this.editedData.laceyAct === 'No' ? 'selected' : ''}>No</option>
                    </select>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                ` : ''}
                <div class="detail-field">
                    <label>Delivery Order ${Utils.createFieldInfo('EVENT4', 'doField')}</label>
                    <select class="form-control" id="log-do-field" ${!canEditDO ? 'disabled' : ''}>
                        <option value="">Select Status</option>
                        <option value="Yes" ${this.editedData.doField === 'Yes' ? 'selected' : ''}>Yes</option>
                        <option value="No" ${this.editedData.doField === 'No' ? 'selected' : ''}>No</option>
                    </select>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
            </div>
        `;
    },

    renderSection3PortOperations() {
        const isEditable = this.isEditable();
        const hasPortDate = this.hasPortDate();
        const hasAppointment = this.hasAppointmentBookDate();
        const terminalEnabled = this.isTerminalEnabled();
        const isFCI = this.isFCIWarehouse();

        // RBAC checks
        const canEditVesselStatus = window.RBAC.canEditField('EVENT4', 'vesselStatus') && isEditable && hasPortDate;
        const canEditTerminal = window.RBAC.canEditField('EVENT4', 'terminal') && isEditable && terminalEnabled;
        const canEditRailOffDate = window.RBAC.canEditField('EVENT4', 'railOffDate') && isEditable && hasPortDate && isFCI;
        const canEditRailOnDate = window.RBAC.canEditField('EVENT4', 'railOnDate') && isEditable && hasPortDate && isFCI;
        const canEditAppointment = window.RBAC.canEditField('EVENT4', 'appointmentBookDate') && isEditable && hasPortDate;
        const canEditTrucker = window.RBAC.canEditField('EVENT4', 'truckerDetail') && isEditable && hasAppointment;
        const canEditLFD = window.RBAC.canEditField('EVENT4', 'lfd') && isEditable && hasPortDate;
        const canEditPerDiem = window.RBAC.canEditField('EVENT4', 'perDiem') && isEditable && hasPortDate;

        return `
            ${!hasPortDate ? `
                <div style="padding: 16px; background: #fef3c7; border-radius: 8px; margin-bottom: 16px; color: #92400e;">
                    Port Operations fields will be enabled once Port Date is entered in Shipping Details.
                </div>
            ` : ''}

            <div class="detail-grid">
                <div class="detail-field">
                    <label>Vessel Status ${Utils.createFieldInfo('EVENT4', 'vesselStatus')}</label>
                    <select class="form-control" id="log-vessel-status" ${!canEditVesselStatus ? 'disabled' : ''}>
                        <option value="">Select Status</option>
                        <option value="VESSEL" ${this.editedData.vesselStatus === 'VESSEL' ? 'selected' : ''}>VESSEL</option>
                        <option value="CUSTOMS & FREIGHT HOLD" ${this.editedData.vesselStatus === 'CUSTOMS & FREIGHT HOLD' ? 'selected' : ''}>CUSTOMS & FREIGHT HOLD</option>
                        <option value="READY FOR APPOINTMENT" ${this.editedData.vesselStatus === 'READY FOR APPOINTMENT' ? 'selected' : ''}>READY FOR APPOINTMENT</option>
                        <option value="APPOINTMENT SCHEDULED" ${this.editedData.vesselStatus === 'APPOINTMENT SCHEDULED' ? 'selected' : ''}>APPOINTMENT SCHEDULED</option>
                        <option value="Others" ${this.editedData.vesselStatus === 'Others' ? 'selected' : ''}>Others</option>
                    </select>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field" id="vessel-status-other-container" style="display: ${this.editedData.vesselStatus === 'Others' ? 'block' : 'none'};">
                    <label>Vessel Status Comments ${Utils.createFieldInfo('EVENT4', 'vesselStatusOther')}</label>
                    <input type="text" class="form-control" id="log-vessel-status-other"
                        value="${Utils.escapeHtml(this.editedData.vesselStatusOther || '')}"
                        placeholder="Enter vessel status details"
                        ${!canEditVesselStatus ? 'disabled' : ''}>
                </div>
                <div class="detail-field">
                    <label>Terminal ${Utils.createFieldInfo('EVENT4', 'terminal')}</label>
                    <input type="text" class="form-control" id="log-terminal"
                        value="${Utils.escapeHtml(this.editedData.terminal || '')}"
                        placeholder="Enter terminal"
                        ${!canEditTerminal ? 'disabled' : ''}>
                    <span class="field-hint">${!terminalEnabled && hasPortDate ? 'Enabled 5 days before Port Date' : '&nbsp;'}</span>
                </div>
                ${isFCI ? `
                    <div class="detail-field">
                        <label>Rail Off Date ${Utils.createFieldInfo('EVENT4', 'railOffDate')}</label>
                        <input type="date" class="form-control" id="log-rail-off-date"
                            value="${this.editedData.railOffDate || ''}"
                            ${!canEditRailOffDate ? 'disabled' : ''}>
                        <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                    </div>
                    <div class="detail-field">
                        <label>Rail On Date ${Utils.createFieldInfo('EVENT4', 'railOnDate')}</label>
                        <input type="date" class="form-control" id="log-rail-on-date"
                            value="${this.editedData.railOnDate || ''}"
                            ${!canEditRailOnDate ? 'disabled' : ''}>
                        <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                    </div>
                ` : ''}
                <div class="detail-field">
                    <label>Appointment Book Date ${Utils.createFieldInfo('EVENT4', 'appointmentBookDate')}</label>
                    <input type="date" class="form-control" id="log-appointment-date"
                        value="${this.editedData.appointmentBookDate || ''}"
                        ${!canEditAppointment ? 'disabled' : ''}>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Trucker Detail ${Utils.createFieldInfo('EVENT4', 'truckerDetail')}</label>
                    <input type="text" class="form-control" id="log-trucker"
                        value="${Utils.escapeHtml(this.editedData.truckerDetail || '')}"
                        placeholder="Enter trucker details"
                        ${!canEditTrucker ? 'disabled' : ''}>
                    <span class="field-hint">${!hasAppointment ? 'Enter Appointment Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>LFD (Last Free Day) ${Utils.createFieldInfo('EVENT4', 'lfd')}</label>
                    <input type="date" class="form-control" id="log-lfd"
                        value="${this.editedData.lfd || ''}"
                        ${!canEditLFD ? 'disabled' : ''}>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Per Diem (Free Days) ${Utils.createFieldInfo('EVENT4', 'perDiem')}</label>
                    <input type="number" class="form-control" id="log-per-diem-value"
                        value="${this.editedData.perDiemValue || ''}"
                        placeholder="Enter number of free days"
                        ${!canEditPerDiem ? 'disabled' : ''}>
                    <span class="field-hint">${!hasPortDate ? 'Enter Port Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Per Diem Type ${Utils.createFieldInfo('EVENT4', 'perDiem')}</label>
                    <select class="form-control" id="log-per-diem-type" ${!canEditPerDiem ? 'disabled' : ''}>
                        <option value="">Select Type</option>
                        <option value="Calendar" ${this.editedData.perDiemType === 'Calendar' ? 'selected' : ''}>Calendar Days</option>
                        <option value="Working" ${this.editedData.perDiemType === 'Working' ? 'selected' : ''}>Working Days</option>
                    </select>
                    <span class="field-hint">&nbsp;</span>
                </div>
            </div>

            ${hasPortDate ? this.renderPenaltyCalculator() : ''}
        `;
    },

    renderPenaltyCalculator() {
        const lfd = this.editedData.lfd;
        const portDate = this.editedData.portDate;
        const perDiemDays = parseInt(this.editedData.perDiemValue) || 0; // Number of free days
        const perDiemType = this.editedData.perDiemType || 'Calendar';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let hasDemurrage = false;
        let hasDetention = false;
        let demurrageDays = 0;
        let detentionDays = 0;
        let detentionDeadline = null;

        // Demurrage: Picked Date > LFD
        const pickedDate = this.editedData.pickedDate;
        if (lfd && pickedDate) {
            const lfdDate = new Date(lfd);
            lfdDate.setHours(0, 0, 0, 0);
            const pickedDateObj = new Date(pickedDate);
            pickedDateObj.setHours(0, 0, 0, 0);
            if (pickedDateObj > lfdDate) {
                hasDemurrage = true;
                demurrageDays = this.calculateDays(lfdDate, pickedDateObj, 'Calendar'); // Days past LFD
            }
        }

        // Detention: Empty Container Return Date > (Port Date + Per Diem Days)
        const emptyContainerReturnDate = this.editedData.emptyContainerReturnDate;
        if (portDate && perDiemDays > 0) {
            const portDateObj = new Date(portDate);
            portDateObj.setHours(0, 0, 0, 0);

            // Calculate detention deadline based on Per Diem Type
            detentionDeadline = this.addDays(portDateObj, perDiemDays, perDiemType);

            if (emptyContainerReturnDate) {
                const emptyReturnDateObj = new Date(emptyContainerReturnDate);
                emptyReturnDateObj.setHours(0, 0, 0, 0);
                if (emptyReturnDateObj > detentionDeadline) {
                    hasDetention = true;
                    detentionDays = this.calculateDays(detentionDeadline, emptyReturnDateObj, 'Calendar'); // Days past deadline
                }
            }
        }

        const hasPenalty = hasDemurrage || hasDetention;

        // Build penalty status text
        let penaltyStatus = 'No Penalty';
        if (hasDemurrage && hasDetention) {
            penaltyStatus = 'Demurrage & Detention';
        } else if (hasDemurrage) {
            penaltyStatus = 'Demurrage';
        } else if (hasDetention) {
            penaltyStatus = 'Detention';
        }

        return `
            <div style="margin-top: 24px; padding: 20px; background: ${hasPenalty ? '#fef2f2' : '#f0fdf4'}; border-radius: 8px; border: 1px solid ${hasPenalty ? '#fecaca' : '#bbf7d0'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; color: ${hasPenalty ? '#991b1b' : '#166534'};">Penalty Calculator</h4>
                    <button type="button" class="btn btn-sm" id="toggle-penalty-details" style="background: #e5e7eb;">
                        ${this.showPenaltyCalculator ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>

                <div style="margin-bottom: 16px; padding: 16px; background: white; border-radius: 8px; text-align: center;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Penalty Status</div>
                    <div style="font-size: 28px; font-weight: 700; color: ${hasPenalty ? '#dc2626' : '#16a34a'};">
                        ${penaltyStatus}
                    </div>
                </div>

                <div class="detail-grid" style="gap: 16px;">
                    <div style="padding: 12px; background: white; border-radius: 6px;">
                        <div style="font-size: 12px; color: #666;">Demurrage</div>
                        <div style="font-size: 20px; font-weight: 600; color: ${hasDemurrage ? '#dc2626' : '#16a34a'};">
                            ${hasDemurrage ? 'YES' : 'NO'}
                        </div>
                        ${hasDemurrage ? `<div style="font-size: 13px; color: #666;">${demurrageDays} days past LFD</div>` :
                            (!pickedDate ? `<div style="font-size: 13px; color: #999;">Picked Date not set</div>` :
                            (lfd ? `<div style="font-size: 13px; color: #666;">LFD: ${Utils.formatDate(lfd)}</div>` :
                            `<div style="font-size: 13px; color: #999;">LFD not set</div>`))}
                    </div>
                    <div style="padding: 12px; background: white; border-radius: 6px;">
                        <div style="font-size: 12px; color: #666;">Detention</div>
                        <div style="font-size: 20px; font-weight: 600; color: ${hasDetention ? '#dc2626' : '#16a34a'};">
                            ${hasDetention ? 'YES' : 'NO'}
                        </div>
                        ${hasDetention ? `<div style="font-size: 13px; color: #666;">${detentionDays} days past free period</div>` :
                            (!emptyContainerReturnDate ? `<div style="font-size: 13px; color: #999;">Empty Return Date not set</div>` :
                            (detentionDeadline ? `<div style="font-size: 13px; color: #666;">Free until: ${Utils.formatDate(detentionDeadline)}</div>` :
                            `<div style="font-size: 13px; color: #999;">Per Diem not set</div>`))}
                    </div>
                </div>

                ${this.showPenaltyCalculator ? `
                    <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 6px; font-size: 13px;">
                        <strong>Calculation Details:</strong>
                        <ul style="margin: 8px 0 0 20px; color: #666;">
                            <li>Port Date: ${portDate ? Utils.formatDate(portDate) : 'Not set'}</li>
                            <li>LFD (Last Free Day): ${lfd ? Utils.formatDate(lfd) : 'Not set'}</li>
                            <li>Per Diem Days: ${perDiemDays} ${perDiemType} days</li>
                            ${detentionDeadline ? `<li>Detention Deadline: ${Utils.formatDate(detentionDeadline)}</li>` : ''}
                            <li><strong>Demurrage:</strong> Applies when Picked Date > LFD</li>
                            <li><strong>Detention:</strong> Applies when Empty Container Return Date > (Port Date + ${perDiemDays} ${perDiemType} days)</li>
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // Helper to add days based on type (Calendar or Working)
    addDays(startDate, numDays, type) {
        const result = new Date(startDate);
        if (type === 'Working') {
            let added = 0;
            while (added < numDays) {
                result.setDate(result.getDate() + 1);
                const day = result.getDay();
                if (day !== 0 && day !== 6) { // Skip weekends
                    added++;
                }
            }
        } else {
            // Calendar days
            result.setDate(result.getDate() + numDays);
        }
        return result;
    },

    calculateDays(startDate, endDate, type) {
        if (type === 'Working') {
            let count = 0;
            let current = new Date(startDate);
            while (current < endDate) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) { // Skip weekends
                    count++;
                }
                current.setDate(current.getDate() + 1);
            }
            return count;
        } else {
            // Calendar days
            return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        }
    },

    renderSection4DeliveryReturns() {
        const isEditable = this.isEditable();
        const hasAppointment = this.hasAppointmentBookDate();
        const hasPicked = this.hasPickedDate();
        const hasWHDelivery = this.hasWarehouseDeliveryDate();
        const hasEmptyNotification = this.hasEmptyNotificationDate();
        const hasEmptyPickup = this.hasEmptyPickupDate();

        // RBAC checks with sequential enabling
        const canEditPickDate = window.RBAC.canEditField('EVENT4', 'pickDate') && isEditable && hasAppointment;
        const canEditWHDelivery = window.RBAC.canEditField('EVENT4', 'warehouseDelivery') && isEditable && hasPicked;
        const canEditEmptyNotification = window.RBAC.canEditField('EVENT4', 'emptyNotificationDate') && isEditable && hasWHDelivery;
        const canEditEmptyPickup = window.RBAC.canEditField('EVENT4', 'emptyPickupDate') && isEditable && hasEmptyNotification;
        const canEditEmptyReturn = window.RBAC.canEditField('EVENT4', 'emptyReturnDate') && isEditable && hasEmptyPickup;

        return `
            <div class="detail-grid">
                <div class="detail-field">
                    <label>Picked Date ${Utils.createFieldInfo('EVENT4', 'pickDate')}</label>
                    <input type="date" class="form-control" id="log-picked-date"
                        value="${this.editedData.pickedDate || ''}"
                        ${!canEditPickDate ? 'disabled' : ''}>
                    <span class="field-hint">${!hasAppointment ? 'Enter Appointment Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Warehouse Delivery Date ${Utils.createFieldInfo('EVENT4', 'warehouseDelivery')}</label>
                    <input type="date" class="form-control" id="log-wh-delivery-date"
                        value="${this.editedData.warehouseDeliveryDate || ''}"
                        ${!canEditWHDelivery ? 'disabled' : ''}>
                    <span class="field-hint">${!hasPicked ? 'Enter Picked Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Empty Notification Date ${Utils.createFieldInfo('EVENT4', 'emptyNotificationDate')}</label>
                    <input type="date" class="form-control" id="log-empty-notification-date"
                        value="${this.editedData.emptyNotificationDate || ''}"
                        ${!canEditEmptyNotification ? 'disabled' : ''}>
                    <span class="field-hint">${!hasWHDelivery ? 'Enter WH Delivery Date first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Empty Pickup Date ${Utils.createFieldInfo('EVENT4', 'emptyPickupDate')}</label>
                    <input type="date" class="form-control" id="log-empty-pickup-date"
                        value="${this.editedData.emptyPickupDate || ''}"
                        ${!canEditEmptyPickup ? 'disabled' : ''}>
                    <span class="field-hint">${!hasEmptyNotification ? 'Enter Empty Notification first' : '&nbsp;'}</span>
                </div>
                <div class="detail-field">
                    <label>Empty Container Return Date ${Utils.createFieldInfo('EVENT4', 'emptyReturnDate')}</label>
                    <input type="date" class="form-control" id="log-empty-return-date"
                        value="${this.editedData.emptyContainerReturnDate || ''}"
                        ${!canEditEmptyReturn ? 'disabled' : ''}>
                    <span class="field-hint">${!hasEmptyPickup ? 'Enter Empty Pickup first' : '&nbsp;'}</span>
                </div>
            </div>
        `;
    },

    renderUpdateSection() {
        const isEditable = this.isEditable();

        return `
            <div class="card" style="margin-top: 24px;">
                <div style="padding: 24px;">
                    ${!isEditable ? `
                        <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; color: #666;">
                            This PO has been moved to inventoried. Logistics tracking is now locked.
                        </div>
                    ` : `
                        <div class="form-actions">
                            <button type="button" id="update-logistics-btn" class="btn btn-primary">
                                Update Logistics Tracker
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

        // Attach field listeners
        this.attachFieldListeners();

        // Attach action listeners
        this.attachActionListeners();
    },

    attachFieldListeners() {
        // Section 1 - Shipping Details
        const hbl = document.getElementById('log-hbl');
        if (hbl) hbl.addEventListener('change', (e) => { this.editedData.hbl = e.target.value; });

        const mbl = document.getElementById('log-mbl');
        if (mbl) mbl.addEventListener('change', (e) => { this.editedData.mbl = e.target.value; });

        const forwarder = document.getElementById('log-forwarder');
        if (forwarder) forwarder.addEventListener('change', (e) => { this.editedData.forwarder = e.target.value; });

        const carrier = document.getElementById('log-carrier');
        if (carrier) carrier.addEventListener('change', (e) => { this.editedData.carrier = e.target.value; });

        // Cost Basis is read-only in Logistics (no event listener needed)

        const vessel = document.getElementById('log-vessel');
        if (vessel) vessel.addEventListener('change', (e) => { this.editedData.vessel = e.target.value; });

        const freightRate = document.getElementById('log-freight-rate');
        if (freightRate) freightRate.addEventListener('change', (e) => { this.editedData.freightRate = e.target.value; });

        const portDate = document.getElementById('log-port-date');
        if (portDate) {
            portDate.addEventListener('change', (e) => {
                this.editedData.portDate = e.target.value;
                // Don't auto-update status - wait for user to click Update Logistics button
                window.POWorkflow.refresh();
            });
        }

        // Actual Ship Date is read-only in Logistics (no event listener needed)

        const trackingUrl = document.getElementById('log-tracking-url');
        if (trackingUrl) trackingUrl.addEventListener('change', (e) => { this.editedData.trackingUrl = e.target.value; });

        // Section 2 - Documentation
        const telexRelease = document.getElementById('log-telex-release');
        if (telexRelease) {
            telexRelease.addEventListener('change', (e) => {
                this.editedData.telexRelease = e.target.value;
                // If changed to "No", clear any uploaded file
                if (e.target.value === 'No') {
                    this.telexFile = null;
                    this.editedData.telexFileName = '';
                }
                window.POWorkflow.refresh();
            });
        }

        const customs = document.getElementById('log-customs');
        if (customs) customs.addEventListener('change', (e) => { this.editedData.customs = e.target.value; });

        const packingList = document.getElementById('log-packing-list');
        if (packingList) packingList.addEventListener('change', (e) => { this.editedData.packingList = e.target.value; });

        const laceyAct = document.getElementById('log-lacey-act');
        if (laceyAct) laceyAct.addEventListener('change', (e) => { this.editedData.laceyAct = e.target.value; });

        const doField = document.getElementById('log-do-field');
        if (doField) doField.addEventListener('change', (e) => { this.editedData.doField = e.target.value; });

        // Section 3 - Port Operations
        // Status updates only happen when user clicks Update Logistics button
        const vesselStatus = document.getElementById('log-vessel-status');
        if (vesselStatus) {
            vesselStatus.addEventListener('change', (e) => {
                this.editedData.vesselStatus = e.target.value;
                // Show/hide the "Others" comments field
                const otherContainer = document.getElementById('vessel-status-other-container');
                if (otherContainer) {
                    otherContainer.style.display = e.target.value === 'Others' ? 'block' : 'none';
                    // Clear the comments if not "Others"
                    if (e.target.value !== 'Others') {
                        this.editedData.vesselStatusOther = '';
                        const otherInput = document.getElementById('log-vessel-status-other');
                        if (otherInput) otherInput.value = '';
                    }
                }
            });
        }

        const vesselStatusOther = document.getElementById('log-vessel-status-other');
        if (vesselStatusOther) {
            vesselStatusOther.addEventListener('change', (e) => {
                this.editedData.vesselStatusOther = e.target.value;
            });
        }

        const terminal = document.getElementById('log-terminal');
        if (terminal) terminal.addEventListener('change', (e) => { this.editedData.terminal = e.target.value; });

        const railOffDate = document.getElementById('log-rail-off-date');
        if (railOffDate) railOffDate.addEventListener('change', (e) => { this.editedData.railOffDate = e.target.value; });

        const railOnDate = document.getElementById('log-rail-on-date');
        if (railOnDate) railOnDate.addEventListener('change', (e) => { this.editedData.railOnDate = e.target.value; });

        const appointmentDate = document.getElementById('log-appointment-date');
        if (appointmentDate) {
            appointmentDate.addEventListener('change', (e) => {
                this.editedData.appointmentBookDate = e.target.value;
                window.POWorkflow.refresh();
            });
        }

        const trucker = document.getElementById('log-trucker');
        if (trucker) trucker.addEventListener('change', (e) => { this.editedData.truckerDetail = e.target.value; });

        const lfd = document.getElementById('log-lfd');
        if (lfd) {
            lfd.addEventListener('change', (e) => {
                this.editedData.lfd = e.target.value;
                window.POWorkflow.refresh();
            });
        }

        const perDiemValue = document.getElementById('log-per-diem-value');
        if (perDiemValue) {
            perDiemValue.addEventListener('change', (e) => {
                this.editedData.perDiemValue = e.target.value;
                window.POWorkflow.refresh();
            });
        }

        const perDiemType = document.getElementById('log-per-diem-type');
        if (perDiemType) {
            perDiemType.addEventListener('change', (e) => {
                this.editedData.perDiemType = e.target.value;
                window.POWorkflow.refresh();
            });
        }

        // Section 4 - Delivery & Returns
        // Status updates only happen when user clicks Update Logistics button
        const pickedDate = document.getElementById('log-picked-date');
        if (pickedDate) {
            pickedDate.addEventListener('change', (e) => {
                this.editedData.pickedDate = e.target.value;
                window.POWorkflow.refresh();
            });
        }

        const whDeliveryDate = document.getElementById('log-wh-delivery-date');
        if (whDeliveryDate) {
            whDeliveryDate.addEventListener('change', (e) => {
                this.editedData.warehouseDeliveryDate = e.target.value;
                window.POWorkflow.refresh();
            });
        }

        const emptyNotificationDate = document.getElementById('log-empty-notification-date');
        if (emptyNotificationDate) {
            emptyNotificationDate.addEventListener('change', (e) => {
                this.editedData.emptyNotificationDate = e.target.value;
                // Don't auto-update status - wait for user to click Update Logistics button
                window.POWorkflow.refresh();
            });
        }

        const emptyPickupDate = document.getElementById('log-empty-pickup-date');
        if (emptyPickupDate) {
            emptyPickupDate.addEventListener('change', (e) => {
                this.editedData.emptyPickupDate = e.target.value;
                // Don't auto-update status - wait for user to click Update Logistics button
                window.POWorkflow.refresh();
            });
        }

        const emptyReturnDate = document.getElementById('log-empty-return-date');
        if (emptyReturnDate) {
            emptyReturnDate.addEventListener('change', (e) => {
                this.editedData.emptyContainerReturnDate = e.target.value;
                // Don't auto-update status - wait for user to click Update Logistics button
                window.POWorkflow.refresh();
            });
        }
    },

    attachActionListeners() {
        // Telex file upload
        const telexUploadBtn = document.getElementById('telex-upload-btn');
        const telexFileInput = document.getElementById('telex-file-input');
        if (telexUploadBtn && telexFileInput) {
            telexUploadBtn.addEventListener('click', () => telexFileInput.click());
            telexFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.telexFile = e.target.files[0];
                    this.editedData.telexRelease = 'Yes';
                    Utils.showToast(`Telex document "${this.telexFile.name}" selected. Click Update to save.`, 'success');
                    window.POWorkflow.refresh();
                }
            });
        }

        // Telex preview
        const telexPreviewBtn = document.getElementById('telex-preview-btn');
        if (telexPreviewBtn) {
            telexPreviewBtn.addEventListener('click', () => {
                this.showTelexPreviewModal();
            });
        }

        // Telex download
        const telexDownloadBtn = document.getElementById('telex-download-btn');
        if (telexDownloadBtn) {
            telexDownloadBtn.addEventListener('click', () => {
                this.downloadTelexDocument();
            });
        }

        // Telex delete
        const telexDeleteBtn = document.getElementById('telex-delete-btn');
        if (telexDeleteBtn) {
            telexDeleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete the telex document?')) {
                    this.editedData.telexRelease = 'No';
                    this.telexFile = null;
                    Utils.showToast('Telex document deleted.', 'success');
                    window.POWorkflow.refresh();
                }
            });
        }

        // Toggle penalty calculator details
        const togglePenaltyBtn = document.getElementById('toggle-penalty-details');
        if (togglePenaltyBtn) {
            togglePenaltyBtn.addEventListener('click', () => {
                this.showPenaltyCalculator = !this.showPenaltyCalculator;
                window.POWorkflow.refresh();
            });
        }

        // Update Logistics button
        const updateBtn = document.getElementById('update-logistics-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.handleUpdateLogistics());
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

    validateDates() {
        const errors = [];

        // Get all dates
        const portDate = this.editedData.portDate ? new Date(this.editedData.portDate) : null;
        const pickedDate = this.editedData.pickedDate ? new Date(this.editedData.pickedDate) : null;
        const warehouseDeliveryDate = this.editedData.warehouseDeliveryDate ? new Date(this.editedData.warehouseDeliveryDate) : null;
        const emptyNotificationDate = this.editedData.emptyNotificationDate ? new Date(this.editedData.emptyNotificationDate) : null;
        const emptyPickupDate = this.editedData.emptyPickupDate ? new Date(this.editedData.emptyPickupDate) : null;
        const emptyContainerReturnDate = this.editedData.emptyContainerReturnDate ? new Date(this.editedData.emptyContainerReturnDate) : null;

        // Sequential date validation: each date must be >= previous date

        // Port Date must be <= Picked Date
        if (portDate && pickedDate && portDate > pickedDate) {
            errors.push('Picked Date must be on or after Port Date');
        }

        // Picked Date must be <= Warehouse Delivery Date
        if (pickedDate && warehouseDeliveryDate && pickedDate > warehouseDeliveryDate) {
            errors.push('Warehouse Delivery Date must be on or after Picked Date');
        }

        // Warehouse Delivery Date must be <= Empty Notification Date
        if (warehouseDeliveryDate && emptyNotificationDate && warehouseDeliveryDate > emptyNotificationDate) {
            errors.push('Empty Notification Date must be on or after Warehouse Delivery Date');
        }

        // Empty Notification Date must be <= Empty Pickup Date
        if (emptyNotificationDate && emptyPickupDate && emptyNotificationDate > emptyPickupDate) {
            errors.push('Empty Pickup Date must be on or after Empty Notification Date');
        }

        // Empty Pickup Date must be <= Empty Container Return Date
        if (emptyPickupDate && emptyContainerReturnDate && emptyPickupDate > emptyContainerReturnDate) {
            errors.push('Empty Container Return Date must be on or after Empty Pickup Date');
        }

        return errors;
    },

    handleUpdateLogistics() {
        // Validate date sequence
        const dateErrors = this.validateDates();
        if (dateErrors.length > 0) {
            Utils.showToast(dateErrors[0], 'error');
            return;
        }

        // Track field changes before saving
        const poNumber = this.currentPO.poNumber;

        // Field labels for better readability in history
        const fieldLabels = {
            hbl: 'HBL',
            mbl: 'MBL',
            forwarder: 'Forwarder',
            carrier: 'Carrier',
            costBasis: 'Cost Basis',
            vessel: 'Vessel',
            freightRate: 'Freight Rate',
            portDate: 'Port Date',
            actualShipDate: 'Actual Ship Date',
            trackingUrl: 'Tracking URL',
            telexRelease: 'Telex Release',
            customs: 'Customs',
            packingList: 'Packing List',
            laceyAct: 'Lacey Act',
            doField: 'D/O',
            vesselStatus: 'Vessel Status',
            vesselStatusOther: 'Vessel Status Comments',
            terminal: 'Terminal',
            railOffDate: 'Rail Off Date',
            railOnDate: 'Rail On Date',
            appointmentBookDate: 'Appointment Book Date',
            truckerDetail: 'Trucker Detail',
            lfd: 'LFD',
            perDiemValue: 'Per Diem Value',
            perDiemType: 'Per Diem Type',
            pickedDate: 'Picked Date',
            warehouseDeliveryDate: 'Warehouse Delivery Date',
            emptyNotificationDate: 'Empty Notification Date',
            emptyPickupDate: 'Empty Pickup Date',
            emptyContainerReturnDate: 'Empty Container Return Date'
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
            hbl: this.editedData.hbl,
            mbl: this.editedData.mbl,
            forwarder: this.editedData.forwarder,
            carrier: this.editedData.carrier,
            costBasis: this.editedData.costBasis,
            vessel: this.editedData.vessel,
            freightRate: this.editedData.freightRate,
            portDate: this.editedData.portDate,
            actualShipDate: this.editedData.actualShipDate,
            trackingUrl: this.editedData.trackingUrl,
            telexRelease: this.editedData.telexRelease,
            customs: this.editedData.customs,
            packingList: this.editedData.packingList,
            laceyAct: this.editedData.laceyAct,
            doField: this.editedData.doField,
            vesselStatus: this.editedData.vesselStatus,
            vesselStatusOther: this.editedData.vesselStatusOther,
            terminal: this.editedData.terminal,
            railOffDate: this.editedData.railOffDate,
            railOnDate: this.editedData.railOnDate,
            appointmentBookDate: this.editedData.appointmentBookDate,
            truckerDetail: this.editedData.truckerDetail,
            lfd: this.editedData.lfd,
            perDiemValue: this.editedData.perDiemValue,
            perDiemType: this.editedData.perDiemType,
            pickedDate: this.editedData.pickedDate,
            warehouseDeliveryDate: this.editedData.warehouseDeliveryDate,
            emptyNotificationDate: this.editedData.emptyNotificationDate,
            emptyPickupDate: this.editedData.emptyPickupDate,
            emptyContainerReturnDate: this.editedData.emptyContainerReturnDate
        });

        // Check if ready to move to inventory - only when Empty Return date is met
        if (this.editedData.emptyContainerReturnDate && this.isDateMet(this.editedData.emptyContainerReturnDate)) {
            this.currentPO.poStatus = 'Empty Return';
            // Track status change
            if (oldStatus !== this.currentPO.poStatus) {
                window.POHistory.trackStatusChange(poNumber, oldStatus, this.currentPO.poStatus);
            }
            // Persist changes to MockData
            window.MockData.updatePO(poNumber, this.currentPO);
            Utils.showToast('Logistics tracker updated. PO moved to Empty Return status (Event 5: Inventory).', 'success');
            setTimeout(() => {
                window.POWorkflow.activeTab = 'inventory';
                window.POWorkflow.refresh();
            }, 1500);
        } else {
            this.updateStatusBasedOnProgress();
            // Track status change
            if (oldStatus !== this.currentPO.poStatus) {
                window.POHistory.trackStatusChange(poNumber, oldStatus, this.currentPO.poStatus);
            }
            // Persist changes to MockData
            window.MockData.updatePO(poNumber, this.currentPO);
            Utils.showToast('Logistics tracker data saved successfully!', 'success');
            window.POWorkflow.refresh();
        }
    },

    updateStatusBasedOnProgress() {
        // Status progression based on milestones - only change status when date is met (date <= today)
        if (this.editedData.emptyContainerReturnDate && this.isDateMet(this.editedData.emptyContainerReturnDate)) {
            this.currentPO.poStatus = 'Empty Return';
        } else if (this.editedData.emptyNotificationDate && this.isDateMet(this.editedData.emptyNotificationDate)) {
            this.currentPO.poStatus = 'Empty Notification';
        } else if (this.editedData.warehouseDeliveryDate && this.isDateMet(this.editedData.warehouseDeliveryDate)) {
            this.currentPO.poStatus = 'Arrived At WH';
        } else if (this.editedData.pickedDate && this.isDateMet(this.editedData.pickedDate)) {
            this.currentPO.poStatus = 'Picked Up';
        } else if (this.editedData.vesselStatus === 'Arrived' || (this.editedData.portDate && this.isDateMet(this.editedData.portDate))) {
            this.currentPO.poStatus = 'Arrived At Port';
        } else {
            // Keep as Shipped (the status from Production Tab)
            this.currentPO.poStatus = 'Shipped';
        }
    },

    showTelexPreviewModal() {
        const file = this.telexFile;
        const fileName = file ? file.name : (this.editedData.telexFileName || 'Telex Document');

        // Determine file type
        const extension = fileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
        const isPDF = extension === 'pdf';

        let previewContent = '';

        if (file) {
            // File is selected but not yet saved - create object URL for preview
            const fileUrl = URL.createObjectURL(file);

            if (isImage) {
                previewContent = `
                    <div style="text-align: center; max-height: 70vh; overflow: auto;">
                        <img src="${fileUrl}" alt="${fileName}" style="max-width: 100%; max-height: 65vh; object-fit: contain;">
                    </div>
                `;
            } else if (isPDF) {
                previewContent = `
                    <div style="height: 70vh;">
                        <iframe src="${fileUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
                    </div>
                `;
            } else {
                previewContent = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10,9 9,9 8,9"></polyline>
                            </svg>
                        </div>
                        <h4 style="margin-bottom: 8px; color: #374151;">Preview not available</h4>
                        <p style="color: #6b7280; margin-bottom: 16px;">This file type (.${extension}) cannot be previewed directly.</p>
                        <p style="color: #6b7280;">File: ${fileName}</p>
                    </div>
                `;
            }
        } else {
            // No file object - show placeholder for existing document
            previewContent = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; color: #10b981; margin-bottom: 16px;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <path d="M9 15l2 2 4-4"></path>
                        </svg>
                    </div>
                    <h4 style="margin-bottom: 8px; color: #374151;">Telex Document Available</h4>
                    <p style="color: #6b7280; margin-bottom: 16px;">Document has been uploaded to the server.</p>
                    <p style="color: #6b7280;">Use the Download button to view the full document.</p>
                </div>
            `;
        }

        const modalHTML = `
            <div class="modal-overlay" id="telex-preview-modal" style="z-index: 20000;">
                <div class="modal-container" style="max-width: 900px; z-index: 20001;">
                    <div class="modal-header">
                        <h3>Telex Document Preview</h3>
                        <button type="button" class="modal-close-btn" id="close-telex-preview">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 16px;">
                        <div style="margin-bottom: 12px; padding: 8px 12px; background: #f3f4f6; border-radius: 6px;">
                            <strong>File:</strong> ${fileName}
                        </div>
                        ${previewContent}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="close-telex-preview-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv);

        // Close button handlers
        document.getElementById('close-telex-preview').addEventListener('click', () => {
            tempDiv.remove();
        });
        document.getElementById('close-telex-preview-btn').addEventListener('click', () => {
            tempDiv.remove();
        });

        // Close on overlay click
        document.getElementById('telex-preview-modal').addEventListener('click', (e) => {
            if (e.target.id === 'telex-preview-modal') {
                tempDiv.remove();
            }
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                tempDiv.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    downloadTelexDocument() {
        const file = this.telexFile;
        const fileName = file ? file.name : (this.editedData.telexFileName || 'telex-document');

        if (file) {
            // File is selected but not yet saved - create download from file object
            const fileUrl = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileUrl);
            Utils.showToast(`Downloaded: ${fileName}`, 'success');
        } else if (this.editedData.telexRelease === 'Yes') {
            // Document exists on server - in real app would fetch from server
            // For demo, show message that document would be downloaded from server
            Utils.showToast(`Downloading ${fileName} from server...`, 'info');

            // Simulate server download delay
            setTimeout(() => {
                Utils.showToast('Document downloaded successfully!', 'success');
            }, 1000);
        } else {
            Utils.showToast('No document available to download', 'error');
        }
    }
};

window.POLogisticsTab = POLogisticsTab;
