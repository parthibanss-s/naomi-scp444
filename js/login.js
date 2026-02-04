// Login Page Component
const LoginPage = {
    render() {
        return `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <h1>Naomi SCM</h1>
                        <p>Factory Purchase Order Management</p>
                    </div>

                    <div id="error-container"></div>

                    <form id="login-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                class="form-control"
                                placeholder="Enter username"
                                required
                                autocomplete="username"
                            >
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                class="form-control"
                                placeholder="Enter password"
                                required
                                autocomplete="current-password"
                            >
                        </div>

                        <button type="submit" class="btn btn-primary">
                            Login
                        </button>
                    </form>

                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
                        <p style="margin-bottom: 8px;"><strong>Demo Credentials:</strong></p>
                        <ul style="list-style: none; padding-left: 0;">
                            <li style="margin-bottom: 4px;">• <strong>lead</strong> / 123 (NH Lead)</li>
                            <li style="margin-bottom: 4px;">• <strong>ops</strong> / 123 (NH Operations)</li>
                            <li style="margin-bottom: 4px;">• <strong>usops</strong> / 123 (NH US Operations)</li>
                            <li style="margin-bottom: 4px;">• <strong>factory</strong> / 123 (Factory Agent)</li>
                            <li style="margin-bottom: 4px;">• <strong>warehouse</strong> / 123 (Warehouse Agent)</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Auto-focus username field
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Clear previous errors
        document.getElementById('error-container').innerHTML = '';

        // Attempt login
        const result = window.AuthService.login(username, password);

        if (result.success) {
            // Show success message and redirect
            Utils.showToast('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = '#/po-listing';
            }, 500);
        } else {
            // Show error message
            document.getElementById('error-container').innerHTML = `
                <div class="error-message">
                    ${Utils.escapeHtml(result.error)}
                </div>
            `;
        }
    }
};

window.LoginPage = LoginPage;
