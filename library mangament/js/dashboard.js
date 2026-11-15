/**
 * Library Management System - Dashboard & App Controller
 * Orchestrates navigation, views, statistics, global search, reports,
 * settings, dark/light theme, and UI notifications.
 */

const DashboardModule = {
    currentView: 'dashboard',

    init() {
        this.setupAuth();
        this.setupTheme();
        this.bindNavigation();
        this.bindGlobalSearch();
        this.bindQuickActions();
        this.bindSettings();
        this.bindReports();
        this.bindAdminProfile();
        
        // Handle URL Hash navigation
        this.handleHashChange();
        window.addEventListener('hashchange', () => this.handleHashChange());

        // Refresh all counters & statistics
        this.refreshAll();
    },

    setupAuth() {
        // Guard dashboard route: ensure user is logged in
        if (!LMSAuth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        const user = LMSAuth.getCurrentUser();
        const profileDisplay = document.getElementById('header-admin-name');
        const profileRole = document.getElementById('header-admin-role');
        const profileAvatar = document.getElementById('header-admin-avatar');

        if (profileDisplay && user) profileDisplay.textContent = user.name || user.username;
        if (profileRole && user) profileRole.textContent = user.designation || 'Chief Librarian';
        if (profileAvatar && user) {
            profileAvatar.textContent = (user.name ? user.name[0] : 'A').toUpperCase();
        }
    },

    setupTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        const themeToggle = document.getElementById('theme-toggle-btn');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme') || 'light';
                const nextTheme = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', nextTheme);
                localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
                this.updateThemeIcon(nextTheme);
                showToast(`Switched to ${nextTheme} mode`, 'info', 1800);
            });
        }
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle-btn i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        }
    },

    bindNavigation() {
        // Sidebar links
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                if (view) {
                    window.location.hash = view;
                }
            });
        });

        // Mobile sidebar toggle button
        const sidebarToggle = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.getElementById('main-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                if (sidebar) sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }

        // Logout buttons
        const logoutBtns = document.querySelectorAll('.btn-logout-trigger');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showConfirmDialog({
                    title: 'Confirm Logout',
                    message: 'Are you sure you want to log out of the Library Management System?',
                    confirmText: 'Log Out',
                    confirmButtonClass: 'btn-danger',
                    onConfirm: () => {
                        LMSAuth.logout();
                    }
                });
            });
        });
    },

    handleHashChange() {
        const hash = window.location.hash.replace('#', '').trim() || 'dashboard';
        const validViews = ['dashboard', 'books', 'students', 'issue', 'return', 'reports', 'settings'];
        const targetView = validViews.includes(hash) ? hash : 'dashboard';

        this.switchView(targetView);
    },

    switchView(viewName) {
        this.currentView = viewName;

        // Hide all views
        const views = document.querySelectorAll('.view-section');
        views.forEach(v => v.classList.remove('active'));

        // Show target view
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.classList.add('active');
        }

        // Update active class on sidebar navigation
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('data-view') === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Page Title Breadcrumb
        const breadcrumbTitle = document.getElementById('page-breadcrumb-title');
        if (breadcrumbTitle) {
            const titles = {
                'dashboard': 'Dashboard Overview',
                'books': 'Book Management',
                'students': 'Student Management',
                'issue': 'Issue Books',
                'return': 'Return Books & Fines',
                'reports': 'Library Reports & Analytics',
                'settings': 'System Settings'
            };
            breadcrumbTitle.textContent = titles[viewName] || 'Dashboard';
        }

        // Close mobile sidebar if open
        const sidebar = document.getElementById('main-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger module specific renders
        if (viewName === 'books' && window.BooksModule) {
            BooksModule.renderBooks();
        } else if (viewName === 'students' && window.StudentsModule) {
            StudentsModule.renderStudents();
        } else if (viewName === 'issue' && window.IssueModule) {
            IssueModule.populateDropdowns();
            IssueModule.renderRecentIssuesTable();
        } else if (viewName === 'return' && window.ReturnModule) {
            ReturnModule.renderIssuedTable();
        } else if (viewName === 'reports') {
            this.renderReportsView();
        } else if (viewName === 'dashboard') {
            this.refreshDashboardCards();
            this.renderDashboardRecentActivity();
        }
    },

    refreshAll() {
        this.refreshDashboardCards();
        this.renderDashboardRecentActivity();
        if (window.BooksModule) BooksModule.renderCategoryOptions();
        if (window.StudentsModule) StudentsModule.renderDepartmentFilterOptions();
    },

    refreshDashboardCards() {
        const stats = LMSStorage.getDashboardStats();

        const elTotalBooks = document.getElementById('stat-total-books');
        const elAvailBooks = document.getElementById('stat-available-books');
        const elIssuedBooks = document.getElementById('stat-issued-books');
        const elTotalStudents = document.getElementById('stat-total-students');
        const elOverdueCount = document.getElementById('stat-overdue-count');
        const elTotalFines = document.getElementById('stat-total-fines');

        if (elTotalBooks) elTotalBooks.textContent = stats.totalBooks;
        if (elAvailBooks) elAvailBooks.textContent = stats.availableBooks;
        if (elIssuedBooks) elIssuedBooks.textContent = stats.issuedBooks;
        if (elTotalStudents) elTotalStudents.textContent = stats.totalStudents;
        if (elOverdueCount) elOverdueCount.textContent = stats.overdueCount;
        if (elTotalFines) elTotalFines.textContent = `₹${stats.totalFinesCollected}`;

        // Update visual progress bars on dashboard cards
        const availPercent = stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0;
        const issuedPercent = stats.totalBooks > 0 ? Math.round((stats.issuedBooks / stats.totalBooks) * 100) : 0;

        const pAvail = document.getElementById('progress-available-books');
        const pIssued = document.getElementById('progress-issued-books');

        if (pAvail) {
            pAvail.style.width = `${availPercent}%`;
            pAvail.setAttribute('aria-valuenow', availPercent);
        }
        if (pIssued) {
            pIssued.style.width = `${issuedPercent}%`;
            pIssued.setAttribute('aria-valuenow', issuedPercent);
        }
    },

    renderDashboardRecentActivity() {
        // 1. Recent Transactions Table
        const txTbody = document.getElementById('dash-recent-transactions-tbody');
        if (txTbody) {
            const transactions = LMSStorage.getTransactions().slice(0, 5);
            if (transactions.length === 0) {
                txTbody.innerHTML = '<tr><td colspan="5" class="text-center py-3 text-muted">No transactions found.</td></tr>';
            } else {
                txTbody.innerHTML = transactions.map(tx => {
                    const isReturned = tx.status === 'Returned';
                    const fineInfo = LMSStorage.calculateFine(tx.dueDate);
                    let badge = '';

                    if (isReturned) {
                        badge = '<span class="status-badge badge-success"><i class="fa-solid fa-check"></i> Returned</span>';
                    } else if (fineInfo.isOverdue) {
                        badge = `<span class="status-badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Overdue (${fineInfo.overdueDays}d)</span>`;
                    } else {
                        badge = '<span class="status-badge badge-warning"><i class="fa-solid fa-clock"></i> Issued</span>';
                    }

                    return `
                        <tr>
                            <td><span class="badge-code">${tx.id}</span></td>
                            <td>
                                <span class="fw-semibold text-dark">${this.escapeHTML(tx.studentName)}</span>
                                <small class="text-muted d-block">${tx.studentId}</small>
                            </td>
                            <td>
                                <span class="text-truncate d-inline-block" style="max-width: 220px;" title="${this.escapeHTML(tx.bookTitle)}">
                                    ${this.escapeHTML(tx.bookTitle)}
                                </span>
                            </td>
                            <td><small>${tx.issueDate}</small></td>
                            <td>${badge}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // 2. Recently Added Books Widget
        const booksListEl = document.getElementById('dash-recent-books-list');
        if (booksListEl) {
            const books = LMSStorage.getBooks().slice(0, 5);
            if (books.length === 0) {
                booksListEl.innerHTML = '<div class="text-muted small text-center py-3">No books added yet.</div>';
            } else {
                booksListEl.innerHTML = books.map(b => `
                    <div class="dash-book-item d-flex align-items-center justify-content-between py-2 border-bottom">
                        <div class="d-flex align-items-center">
                            <div class="book-icon-thumb me-3">
                                <i class="fa-solid fa-book text-primary"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 text-dark fw-semibold small text-truncate" style="max-width: 200px;" title="${this.escapeHTML(b.title)}">
                                    ${this.escapeHTML(b.title)}
                                </h6>
                                <small class="text-muted">${this.escapeHTML(b.author)}</small>
                            </div>
                        </div>
                        <span class="badge ${b.availableCopies > 0 ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${b.availableCopies > 0 ? 'text-success' : 'text-danger'} fw-bold px-2 py-1">
                            ${b.availableCopies} avail
                        </span>
                    </div>
                `).join('');
            }
        }

        // 3. Category Distribution breakdown widget
        const categoryListEl = document.getElementById('dash-category-distribution');
        if (categoryListEl) {
            const books = LMSStorage.getBooks();
            const counts = {};
            books.forEach(b => {
                const cat = b.category || 'General';
                counts[cat] = (counts[cat] || 0) + (parseInt(b.quantity, 10) || 1);
            });

            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            const sortedCats = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

            categoryListEl.innerHTML = sortedCats.map(([cat, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between small mb-1">
                            <span class="fw-semibold text-secondary">${this.escapeHTML(cat)}</span>
                            <span class="text-muted">${count} books (${pct}%)</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: ${pct}%" aria-valuenow="${pct}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    bindQuickActions() {
        const btnQuickAddBook = document.getElementById('quick-add-book-btn');
        if (btnQuickAddBook) {
            btnQuickAddBook.addEventListener('click', () => {
                window.location.hash = 'books';
                setTimeout(() => {
                    if (window.BooksModule) BooksModule.openAddModal();
                }, 100);
            });
        }

        const btnQuickAddStudent = document.getElementById('quick-add-student-btn');
        if (btnQuickAddStudent) {
            btnQuickAddStudent.addEventListener('click', () => {
                window.location.hash = 'students';
                setTimeout(() => {
                    if (window.StudentsModule) StudentsModule.openAddModal();
                }, 100);
            });
        }

        const btnQuickIssue = document.getElementById('quick-issue-btn');
        if (btnQuickIssue) {
            btnQuickIssue.addEventListener('click', () => {
                window.location.hash = 'issue';
            });
        }

        const btnQuickReturn = document.getElementById('quick-return-btn');
        if (btnQuickReturn) {
            btnQuickReturn.addEventListener('click', () => {
                window.location.hash = 'return';
            });
        }
    },

    bindGlobalSearch() {
        const searchInput = document.getElementById('global-search-input');
        const resultsBox = document.getElementById('global-search-results');

        if (!searchInput || !resultsBox) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                resultsBox.classList.remove('show');
                resultsBox.innerHTML = '';
                return;
            }

            const books = LMSStorage.getBooks().filter(b => 
                b.title.toLowerCase().includes(query) || 
                b.author.toLowerCase().includes(query) || 
                b.id.toLowerCase().includes(query)
            ).slice(0, 4);

            const students = LMSStorage.getStudents().filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.id.toLowerCase().includes(query) || 
                s.department.toLowerCase().includes(query)
            ).slice(0, 4);

            if (books.length === 0 && students.length === 0) {
                resultsBox.innerHTML = '<div class="p-3 text-muted text-center small">No matching books or students found.</div>';
                resultsBox.classList.add('show');
                return;
            }

            let html = '';

            if (books.length > 0) {
                html += '<div class="search-category-header"><i class="fa-solid fa-book"></i> Books</div>';
                books.forEach(b => {
                    html += `
                        <div class="search-result-item" onclick="DashboardModule.navigateFromSearch('books', '${b.id}')">
                            <div class="fw-semibold text-dark text-truncate">${this.escapeHTML(b.title)}</div>
                            <small class="text-muted">${b.id} &bull; ${this.escapeHTML(b.author)} &bull; ${b.availableCopies} available</small>
                        </div>
                    `;
                });
            }

            if (students.length > 0) {
                html += '<div class="search-category-header"><i class="fa-solid fa-user-graduate"></i> Students</div>';
                students.forEach(s => {
                    html += `
                        <div class="search-result-item" onclick="DashboardModule.navigateFromSearch('students', '${s.id}')">
                            <div class="fw-semibold text-dark">${this.escapeHTML(s.name)}</div>
                            <small class="text-muted">${s.id} &bull; ${this.escapeHTML(s.department)}</small>
                        </div>
                    `;
                });
            }

            resultsBox.innerHTML = html;
            resultsBox.classList.add('show');
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
                resultsBox.classList.remove('show');
            }
        });
    },

    navigateFromSearch(targetView, recordId) {
        const resultsBox = document.getElementById('global-search-results');
        const searchInput = document.getElementById('global-search-input');
        if (resultsBox) resultsBox.classList.remove('show');
        if (searchInput) searchInput.value = '';

        window.location.hash = targetView;

        setTimeout(() => {
            if (targetView === 'books' && window.BooksModule) {
                BooksModule.viewBookDetails(recordId);
            } else if (targetView === 'students' && window.StudentsModule) {
                StudentsModule.viewBorrowingHistory(recordId);
            }
        }, 150);
    },

    // ==========================================
    // REPORTS GENERATION
    // ==========================================
    bindReports() {
        const reportTypeSelect = document.getElementById('report-type-select');
        const generateBtn = document.getElementById('btn-generate-report');
        const printBtn = document.getElementById('btn-print-report');
        const exportCsvBtn = document.getElementById('btn-export-csv');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.renderReportsView();
            });
        }

        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', () => {
                this.renderReportsView();
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                this.exportReportToCSV();
            });
        }
    },

    renderReportsView() {
        const reportType = document.getElementById('report-type-select') ? document.getElementById('report-type-select').value : 'all-books';
        const reportContent = document.getElementById('report-data-container');
        const reportTitle = document.getElementById('report-dynamic-title');
        const reportCount = document.getElementById('report-total-count');

        if (!reportContent) return;

        const books = LMSStorage.getBooks();
        const students = LMSStorage.getStudents();
        const transactions = LMSStorage.getTransactions();

        if (reportType === 'all-books') {
            if (reportTitle) reportTitle.textContent = 'Complete Books Inventory Report';
            if (reportCount) reportCount.textContent = `${books.length} Unique Titles (${books.reduce((s, b) => s + b.quantity, 0)} Total Copies)`;

            reportContent.innerHTML = `
                <table class="table table-bordered table-striped align-middle">
                    <thead class="table-primary">
                        <tr>
                            <th>Book ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Category</th>
                            <th>Total Qty</th>
                            <th>Available</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${books.map(b => `
                            <tr>
                                <td><span class="badge-code">${b.id}</span></td>
                                <td class="fw-semibold">${this.escapeHTML(b.title)}</td>
                                <td>${this.escapeHTML(b.author)}</td>
                                <td>${this.escapeHTML(b.isbn)}</td>
                                <td>${this.escapeHTML(b.category)}</td>
                                <td class="text-center">${b.quantity}</td>
                                <td class="text-center font-monospace fw-bold ${b.availableCopies > 0 ? 'text-success' : 'text-danger'}">${b.availableCopies}</td>
                                <td>${b.availableCopies > 0 ? '<span class="status-badge badge-success">In Stock</span>' : '<span class="status-badge badge-danger">Out of Stock</span>'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (reportType === 'available-books') {
            const availBooks = books.filter(b => b.availableCopies > 0);
            if (reportTitle) reportTitle.textContent = 'Available Books on Shelf Report';
            if (reportCount) reportCount.textContent = `${availBooks.length} Available Titles`;

            reportContent.innerHTML = `
                <table class="table table-bordered table-striped align-middle">
                    <thead class="table-success">
                        <tr>
                            <th>Book ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Available Copies</th>
                            <th>Total Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${availBooks.map(b => `
                            <tr>
                                <td><span class="badge-code">${b.id}</span></td>
                                <td class="fw-semibold">${this.escapeHTML(b.title)}</td>
                                <td>${this.escapeHTML(b.author)}</td>
                                <td>${this.escapeHTML(b.category)}</td>
                                <td class="text-center fw-bold text-success">${b.availableCopies}</td>
                                <td class="text-center text-muted">${b.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (reportType === 'issued-books') {
            const activeTxs = transactions.filter(t => t.status === 'Issued');
            if (reportTitle) reportTitle.textContent = 'Active Issued Books Report';
            if (reportCount) reportCount.textContent = `${activeTxs.length} Currently Borrowed`;

            reportContent.innerHTML = `
                <table class="table table-bordered table-striped align-middle">
                    <thead class="table-warning">
                        <tr>
                            <th>Tx ID</th>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Book ID</th>
                            <th>Book Title</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Overdue Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeTxs.length === 0 ? '<tr><td colspan="8" class="text-center py-3 text-muted">No books are currently issued.</td></tr>' : activeTxs.map(t => {
                            const fine = LMSStorage.calculateFine(t.dueDate);
                            return `
                                <tr>
                                    <td><span class="badge-code">${t.id}</span></td>
                                    <td>${t.studentId}</td>
                                    <td class="fw-semibold">${this.escapeHTML(t.studentName)}</td>
                                    <td>${t.bookId}</td>
                                    <td>${this.escapeHTML(t.bookTitle)}</td>
                                    <td>${t.issueDate}</td>
                                    <td class="${fine.isOverdue ? 'text-danger fw-bold' : ''}">${t.dueDate}</td>
                                    <td>${fine.isOverdue ? `<span class="badge bg-danger">Overdue (${fine.overdueDays}d) - Fine: ₹${fine.fineAmount}</span>` : '<span class="badge bg-info">Active</span>'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else if (reportType === 'overdue-books') {
            const activeTxs = transactions.filter(t => t.status === 'Issued');
            const overdueTxs = activeTxs.filter(t => LMSStorage.calculateFine(t.dueDate).isOverdue);
            const totalFines = overdueTxs.reduce((sum, t) => sum + LMSStorage.calculateFine(t.dueDate).fineAmount, 0);

            if (reportTitle) reportTitle.textContent = 'Overdue Books & Penalty Report (Fine: ₹5/day)';
            if (reportCount) reportCount.textContent = `${overdueTxs.length} Overdue Loans (Total Pending Fine: ₹${totalFines})`;

            reportContent.innerHTML = `
                <table class="table table-bordered table-striped align-middle">
                    <thead class="table-danger">
                        <tr>
                            <th>Tx ID</th>
                            <th>Student</th>
                            <th>Book Title</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Days Overdue</th>
                            <th>Fine Rate</th>
                            <th>Total Fine</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${overdueTxs.length === 0 ? '<tr><td colspan="8" class="text-center py-4 text-success fw-bold">🎉 Outstanding! There are no overdue books at this time.</td></tr>' : overdueTxs.map(t => {
                            const fine = LMSStorage.calculateFine(t.dueDate);
                            return `
                                <tr>
                                    <td><span class="badge-code">${t.id}</span></td>
                                    <td>
                                        <strong>${this.escapeHTML(t.studentName)}</strong><br>
                                        <small class="text-muted">${t.studentId}</small>
                                    </td>
                                    <td class="fw-semibold">${this.escapeHTML(t.bookTitle)}</td>
                                    <td>${t.issueDate}</td>
                                    <td class="text-danger fw-bold">${t.dueDate}</td>
                                    <td class="text-center text-danger fw-bold fs-6">${fine.overdueDays} days</td>
                                    <td class="text-center">₹${fine.ratePerDay}/day</td>
                                    <td class="text-center text-danger fw-bold fs-5">₹${fine.fineAmount}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else if (reportType === 'student-history') {
            if (reportTitle) reportTitle.textContent = 'Student Borrowing Activity Summary';
            if (reportCount) reportCount.textContent = `${students.length} Registered Students`;

            reportContent.innerHTML = `
                <table class="table table-bordered table-striped align-middle">
                    <thead class="table-secondary">
                        <tr>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Active Books</th>
                            <th>Lifetime Loans</th>
                            <th>Total Fines Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => {
                            const studentTxs = transactions.filter(t => t.studentId.toLowerCase() === s.id.toLowerCase());
                            const activeCount = studentTxs.filter(t => t.status === 'Issued').length;
                            const finesPaid = studentTxs.reduce((sum, t) => sum + (t.fineAmount || 0), 0);

                            return `
                                <tr>
                                    <td><span class="badge-code">${s.id}</span></td>
                                    <td class="fw-semibold">${this.escapeHTML(s.name)}</td>
                                    <td>${this.escapeHTML(s.department)}</td>
                                    <td>${this.escapeHTML(s.year)}</td>
                                    <td class="text-center"><span class="badge ${activeCount > 0 ? 'bg-primary' : 'bg-secondary'}">${activeCount}</span></td>
                                    <td class="text-center font-monospace">${studentTxs.length}</td>
                                    <td class="text-center fw-bold ${finesPaid > 0 ? 'text-danger' : 'text-muted'}">₹${finesPaid}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    },

    exportReportToCSV() {
        const reportType = document.getElementById('report-type-select').value;
        let csvContent = 'data:text/csv;charset=utf-8,';
        let filename = `Library_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

        if (reportType === 'all-books') {
            csvContent += 'Book ID,Title,Author,ISBN,Category,Publisher,Total Quantity,Available Copies\n';
            LMSStorage.getBooks().forEach(b => {
                csvContent += `"${b.id}","${b.title}","${b.author}","${b.isbn}","${b.category}","${b.publisher || ''}",${b.quantity},${b.availableCopies}\n`;
            });
        } else if (reportType === 'available-books') {
            csvContent += 'Book ID,Title,Author,ISBN,Category,Available Copies,Total Quantity\n';
            LMSStorage.getBooks().filter(b => b.availableCopies > 0).forEach(b => {
                csvContent += `"${b.id}","${b.title}","${b.author}","${b.isbn}","${b.category}",${b.availableCopies},${b.quantity}\n`;
            });
        } else if (reportType === 'overdue-books') {
            csvContent += 'Transaction ID,Student ID,Student Name,Book Title,Issue Date,Due Date,Days Overdue,Fine Amount (INR)\n';
            LMSStorage.getActiveTransactions().forEach(t => {
                const fine = LMSStorage.calculateFine(t.dueDate);
                if (fine.isOverdue) {
                    csvContent += `"${t.id}","${t.studentId}","${t.studentName}","${t.bookTitle}","${t.issueDate}","${t.dueDate}",${fine.overdueDays},${fine.fineAmount}\n`;
                }
            });
        } else {
            csvContent += 'Transaction ID,Student ID,Student Name,Book ID,Book Title,Issue Date,Due Date,Return Date,Status,Fine Amount\n';
            LMSStorage.getTransactions().forEach(t => {
                csvContent += `"${t.id}","${t.studentId}","${t.studentName}","${t.bookId}","${t.bookTitle}","${t.issueDate}","${t.dueDate}","${t.returnDate || ''}","${t.status}",${t.fineAmount || 0}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Report CSV exported successfully!', 'success');
    },

    // ==========================================
    // SETTINGS & BACKUP / RESTORE
    // ==========================================
    bindSettings() {
        const settingsForm = document.getElementById('system-settings-form');
        const resetDataBtn = document.getElementById('btn-reset-sample-data');
        const exportBackupBtn = document.getElementById('btn-export-backup-json');
        const importFileInput = document.getElementById('backup-file-input');

        // Populate settings inputs
        const currentSettings = LMSStorage.getSettings();
        if (document.getElementById('setting-library-name')) {
            document.getElementById('setting-library-name').value = currentSettings.libraryName || '';
        }
        if (document.getElementById('setting-fine-rate')) {
            document.getElementById('setting-fine-rate').value = currentSettings.fineRatePerDay || 5;
        }
        if (document.getElementById('setting-loan-duration')) {
            document.getElementById('setting-loan-duration').value = currentSettings.loanDurationDays || 14;
        }
        if (document.getElementById('setting-max-books')) {
            document.getElementById('setting-max-books').value = currentSettings.maxBooksPerStudent || 3;
        }

        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const updated = {
                    libraryName: document.getElementById('setting-library-name').value.trim(),
                    fineRatePerDay: parseFloat(document.getElementById('setting-fine-rate').value) || 5,
                    loanDurationDays: parseInt(document.getElementById('setting-loan-duration').value, 10) || 14,
                    maxBooksPerStudent: parseInt(document.getElementById('setting-max-books').value, 10) || 3
                };

                LMSStorage.saveSettings(updated);
                showToast('System configuration settings saved successfully!', 'success');
                this.refreshAll();
            });
        }

        // Reset Sample Data
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                showConfirmDialog({
                    title: 'Reset to Factory Sample Data?',
                    message: 'This will reset all books, students, and transaction records to the default B.Tech CSE showcase dataset. All custom changes will be overwritten.<br><br>Do you want to proceed?',
                    confirmText: 'Reset Everything',
                    confirmButtonClass: 'btn-danger',
                    onConfirm: () => {
                        LMSStorage.resetAllData();
                        showToast('System data successfully reset to default sample dataset!', 'success');
                        setTimeout(() => window.location.reload(), 1000);
                    }
                });
            });
        }

        // Export JSON backup
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', () => {
                const jsonStr = LMSStorage.exportDataJSON();
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `LMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Database backup downloaded successfully!', 'success');
            });
        }

        // Import JSON backup
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const res = LMSStorage.importDataJSON(event.target.result);
                    if (res.success) {
                        showToast(res.message, 'success');
                        setTimeout(() => window.location.reload(), 1200);
                    } else {
                        showToast(res.message, 'error');
                    }
                };
                reader.readAsText(file);
            });
        }
    },

    // ==========================================
    // ADMIN PROFILE & PASSWORD MANAGEMENT
    // ==========================================
    bindAdminProfile() {
        const btnOpenProfile = document.getElementById('btn-open-profile-modal');
        const profileForm = document.getElementById('admin-profile-form');
        const passwordForm = document.getElementById('admin-password-form');

        if (btnOpenProfile) {
            btnOpenProfile.addEventListener('click', () => {
                const admin = LMSAuth.getAdminProfile();
                if (document.getElementById('profile-admin-name')) {
                    document.getElementById('profile-admin-name').value = admin.name || '';
                }
                if (document.getElementById('profile-admin-email')) {
                    document.getElementById('profile-admin-email').value = admin.email || '';
                }
                if (document.getElementById('profile-admin-designation')) {
                    document.getElementById('profile-admin-designation').value = admin.designation || '';
                }
                openModal('admin-profile-modal');
            });
        }

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('profile-admin-name').value.trim();
                const email = document.getElementById('profile-admin-email').value.trim();
                const designation = document.getElementById('profile-admin-designation').value.trim();

                const res = LMSAuth.updateProfile({ name, email, designation });
                if (res.success) {
                    showToast(res.message, 'success');
                    closeModal('admin-profile-modal');
                    this.setupAuth();
                } else {
                    showToast(res.message, 'error');
                }
            });
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentPass = document.getElementById('password-current').value;
                const newPass = document.getElementById('password-new').value;
                const confirmPass = document.getElementById('password-confirm').value;

                if (newPass !== confirmPass) {
                    showToast('New password and confirmation password do not match!', 'warning');
                    return;
                }

                const res = LMSAuth.changePassword(currentPass, newPass);
                if (res.success) {
                    showToast(res.message, 'success');
                    passwordForm.reset();
                    closeModal('admin-profile-modal');
                } else {
                    showToast(res.message, 'error');
                }
            });
        }
    },

    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// ==========================================
// MODAL & DIALOG ENGINE HELPERS
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('show');
    
    // Check if any other modal is open before removing modal-open class
    const anyOpen = document.querySelectorAll('.custom-modal.show').length > 0;
    if (!anyOpen) {
        document.body.classList.remove('modal-open');
    }
}

// Global hook to close modals via data-close-modal or clicking backdrop
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal]') || e.target.closest('[data-close-modal]')) {
        const trigger = e.target.matches('[data-close-modal]') ? e.target : e.target.closest('[data-close-modal]');
        const modalId = trigger.getAttribute('data-close-modal');
        if (modalId) {
            closeModal(modalId);
        } else {
            const modal = trigger.closest('.custom-modal');
            if (modal) modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    if (e.target.classList.contains('custom-modal') && e.target.classList.contains('show')) {
        e.target.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
});

// Toast Notification Engine
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <div class="toast-content d-flex align-items-center">
            <i class="fa-solid ${icon} toast-icon me-2"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button type="button" class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Custom Confirm Dialog
function showConfirmDialog({ title, message, confirmText = 'Confirm', confirmButtonClass = 'btn-primary', onConfirm }) {
    const modal = document.getElementById('generic-confirm-modal');
    if (!modal) {
        if (confirm(message)) {
            if (typeof onConfirm === 'function') onConfirm();
        }
        return;
    }

    document.getElementById('confirm-modal-title').innerHTML = `<i class="fa-solid fa-circle-question text-warning me-2"></i> ${title}`;
    document.getElementById('confirm-modal-message').innerHTML = message;

    const confirmBtn = document.getElementById('confirm-modal-action-btn');
    confirmBtn.className = `btn ${confirmButtonClass} px-4`;
    confirmBtn.textContent = confirmText;

    // Remove any previous click listeners
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
        closeModal('generic-confirm-modal');
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    openModal('generic-confirm-modal');
}

window.DashboardModule = DashboardModule;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize DashboardModule if we are on dashboard.html
    if (document.getElementById('view-dashboard')) {
        DashboardModule.init();
        if (window.BooksModule) BooksModule.init();
        if (window.StudentsModule) StudentsModule.init();
        if (window.IssueModule) IssueModule.init();
        if (window.ReturnModule) ReturnModule.init();
    }
});
