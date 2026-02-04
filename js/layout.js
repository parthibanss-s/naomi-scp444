// Layout Component with Sidebar
const Layout = {
    render(content) {
        const session = window.AuthService.getSession();
        if (!session) {
            return window.LoginPage.render();
        }

        const navItems = this.getNavigationItems(session.role);

        return `
            <div class="app-layout">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <h2>Naomi SCM</h2>
                        <div class="user-info">
                            <div style="margin-top: 8px;">
                                <strong>${Utils.escapeHtml(session.fullName)}</strong>
                            </div>
                            <div style="opacity: 0.7; font-size: 12px;">
                                ${Utils.escapeHtml(session.role)}
                            </div>
                        </div>
                    </div>

                    <nav>
                        <ul class="sidebar-nav">
                            ${navItems.map(item => `
                                <li class="nav-item">
                                    <a href="#${item.href}" class="nav-link ${item.active ? 'active' : ''}">
                                        ${Utils.escapeHtml(item.label)}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </nav>

                    <button class="btn logout-btn" id="logout-btn">
                        Logout
                    </button>
                </aside>

                <main class="main-content">
                    ${content}
                </main>
            </div>
        `;
    },

    getNavigationItems(role) {
        const currentHash = window.location.hash || '#/po-listing';
        const items = [];

        // PO Listing - accessible to all roles
        items.push({
            label: 'PO Listing',
            href: '/po-listing',
            active: currentHash === '#/po-listing'
        });

        // PO Create - accessible to NH_LEAD and NH_OPS
        if (window.RBAC.canAccessEvent('PoCreation')) {
            items.push({
                label: 'PO Create',
                href: '/po-create',
                active: currentHash === '#/po-create'
            });
        }

        // Settings - accessible to NH_LEAD only (according to RBAC rules EVENT6)
        if (window.RBAC.canAccessEvent('Settings')) {
            items.push({
                label: 'Settings',
                href: '/settings',
                active: currentHash === '#/settings'
            });
        }

        return items;
    },

    init() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    window.AuthService.logout();
                }
            });
        }

        // Highlight active nav link
        this.updateActiveNavLink();
    },

    updateActiveNavLink() {
        const currentHash = window.location.hash || '#/po-listing';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};

window.Layout = Layout;
