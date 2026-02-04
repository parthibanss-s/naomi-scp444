// Main Application Router and Controller
const App = {
    init() {
        // Initialize routing
        this.setupRouter();

        // Load initial page
        this.route();

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.route());
    },

    setupRouter() {
        // Define routes
        this.routes = {
            '': this.handleRoot.bind(this),
            '/': this.handleRoot.bind(this),
            '/login': this.handleLogin.bind(this),
            '/po-listing': this.handlePOListing.bind(this),
            '/po-create': this.handlePOCreate.bind(this),
            '/po-workflow': this.handlePOModify.bind(this),
            '/settings': this.handleSettings.bind(this)
        };
    },

    route() {
        // Get current route from hash (remove query parameters for matching)
        const fullHash = window.location.hash.slice(1) || '/';
        const hashPath = fullHash.split('?')[0]; // Remove query params for route matching

        // Find matching route handler
        const handler = this.routes[hashPath];

        if (handler) {
            handler();
        } else {
            // Default to PO listing if route not found
            this.handlePOListing();
        }
    },

    // Helper to get query params from hash
    getHashParams() {
        const hash = window.location.hash.slice(1) || '/';
        const queryIndex = hash.indexOf('?');
        if (queryIndex === -1) return new URLSearchParams();
        return new URLSearchParams(hash.slice(queryIndex + 1));
    },

    handleRoot() {
        // Redirect to login if not authenticated, otherwise to PO listing
        if (window.AuthService.isAuthenticated()) {
            window.location.href = '#/po-listing';
        } else {
            window.location.href = '#/login';
        }
    },

    handleLogin() {
        // If already authenticated, redirect to PO listing
        if (window.AuthService.isAuthenticated()) {
            window.location.href = '#/po-listing';
            return;
        }

        // Render login page
        const content = window.LoginPage.render();
        document.getElementById('app').innerHTML = content;
        window.LoginPage.init();
    },

    handlePOListing() {
        // Check authentication
        if (!window.AuthService.isAuthenticated()) {
            window.location.href = '#/login';
            return;
        }

        // Render PO listing page with layout
        const content = window.POListingPage.render();
        document.getElementById('app').innerHTML = window.Layout.render(content);
        window.Layout.init();
        window.POListingPage.init();
    },

    handlePOCreate() {
        // Check authentication
        if (!window.AuthService.isAuthenticated()) {
            window.location.href = '#/login';
            return;
        }

        // Check permission
        if (!window.RBAC.canAccessEvent('PoCreation')) {
            window.Utils.showToast('You do not have permission to access this page', 'error');
            window.location.href = '#/po-listing';
            return;
        }

        // Render PO creation page with layout
        const content = window.POCreationPage.render();
        document.getElementById('app').innerHTML = window.Layout.render(content);
        window.Layout.init();
        window.POCreationPage.init();
    },

    handlePOModify() {
        // Check authentication
        if (!window.AuthService.isAuthenticated()) {
            window.location.href = '#/login';
            return;
        }

        // Get PO number from hash parameters (not window.location.search)
        const params = this.getHashParams();
        const poNumber = params.get('po');

        if (!poNumber) {
            window.Utils.showToast('No PO selected', 'error');
            window.location.href = '#/po-listing';
            return;
        }

        // Load PO first to determine which event tab to show
        const loaded = window.POWorkflow.loadPO(poNumber);
        if (!loaded) return;

        // Check permission based on the tab that will be shown
        const currentTab = window.POWorkflow.activeTab;
        const tabConfig = window.POWorkflow.tabs.find(t => t.id === currentTab);
        if (tabConfig && !window.RBAC.canAccessEvent(tabConfig.event)) {
            window.Utils.showToast('You do not have permission to access this page', 'error');
            window.location.href = '#/po-listing';
            return;
        }

        // Render workflow page with tabs
        const content = window.POWorkflow.render();
        document.getElementById('app').innerHTML = window.Layout.render(content);
        window.Layout.init();
        window.POWorkflow.init();
    },

    handleSettings() {
        // Check authentication
        if (!window.AuthService.isAuthenticated()) {
            window.location.href = '#/login';
            return;
        }

        // Check permission (only NH_LEAD has access to Settings)
        if (!window.RBAC.canAccessEvent('Settings')) {
            window.Utils.showToast('You do not have permission to access this page', 'error');
            window.location.href = '#/po-listing';
            return;
        }

        // Render settings page with layout
        const content = window.SettingsPage.render();
        document.getElementById('app').innerHTML = window.Layout.render(content);
        window.Layout.init();
        window.SettingsPage.init();
    }
};

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

window.App = App;
