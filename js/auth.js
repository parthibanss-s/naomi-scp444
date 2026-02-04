// Authentication Service
const AuthService = {
    // Mock user credentials
    users: {
        'lead': { username: 'lead', password: '123', role: 'NH_LEAD', fullName: 'NH Lead User' },
        'ops': { username: 'ops', password: '123', role: 'NH_OPS', fullName: 'NH Operations' },
        'usops': { username: 'usops', password: '123', role: 'NH_USOPS', fullName: 'NH US Operations' },
        'factory': { username: 'factory', password: '123', role: 'FACTORY_AGENT', fullName: 'Factory Agent' },
        'warehouse': { username: 'warehouse', password: '123', role: 'WH_AGENT', fullName: 'Warehouse Agent' }
    },

    // Login method
    login(username, password) {
        const user = this.users[username];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Invalid password' };
        }

        // Store user session
        const session = {
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('userSession', JSON.stringify(session));
        window.RBAC.setRole(user.role);

        return { success: true, user: session };
    },

    // Logout method
    logout() {
        localStorage.removeItem('userSession');
        localStorage.removeItem('USER_ROLE');
        window.location.href = '#/login';
    },

    // Get current session
    getSession() {
        const sessionData = localStorage.getItem('userSession');
        return sessionData ? JSON.parse(sessionData) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.getSession() !== null;
    },

    // Get current user role
    getCurrentRole() {
        const session = this.getSession();
        return session ? session.role : null;
    },

    // Check if user has access to a feature
    canAccess(eventName) {
        if (!this.isAuthenticated()) return false;
        return window.RBAC.canAccessEvent(eventName);
    }
};

window.AuthService = AuthService;
