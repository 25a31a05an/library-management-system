/**
 * Library Management System - Issue Book Module
 * Handles issuing books to registered students with real-time validations,
 * stock checking, and transaction creation.
 */

const IssueModule = {
    init() {
        this.bindEvents();
        this.populateDropdowns();
        this.setDefaultDates();
        this.renderRecentIssuesTable();
    },

    bindEvents() {
        const issueForm = document.getElementById('issue-book-form');
        if (issueForm) {
            issueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleIssueSubmit();
            });
        }

        // Student selection change -> update student preview card
        const studentSelect = document.getElementById('issue-student-select');
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                this.updateStudentPreview(e.target.value);
            });
        }

        // Book selection change -> update book preview card
        const bookSelect = document.getElementById('issue-book-select');
        if (bookSelect) {
            bookSelect.addEventListener('change', (e) => {
                this.updateBookPreview(e.target.value);
            });
        }

        // Issue date change -> auto calculate default due date (+14 days)
        const issueDateInput = document.getElementById('issue-date');
        if (issueDateInput) {
            issueDateInput.addEventListener('change', (e) => {
                this.calculateDefaultDueDate(e.target.value);
            });
        }

        // Quick search filters for issue selection
        const studentSearch = document.getElementById('issue-student-search');
        if (studentSearch) {
            studentSearch.addEventListener('input', (e) => {
                this.filterStudentDropdown(e.target.value);
            });
        }

        const bookSearch = document.getElementById('issue-book-search');
        if (bookSearch) {
            bookSearch.addEventListener('input', (e) => {
                this.filterBookDropdown(e.target.value);
            });
        }
    },

    setDefaultDates() {
        const issueDateInput = document.getElementById('issue-date');
        const dueDateInput = document.getElementById('issue-due-date');

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (issueDateInput) {
            issueDateInput.value = todayStr;
        }

        this.calculateDefaultDueDate(todayStr);
    },

    calculateDefaultDueDate(issueDateStr) {
        const dueDateInput = document.getElementById('issue-due-date');
        if (!dueDateInput || !issueDateStr) return;

        const settings = LMSStorage.getSettings();
        const duration = parseInt(settings.loanDurationDays, 10) || 14;

        const date = new Date(issueDateStr + 'T00:00:00');
        date.setDate(date.getDate() + duration);
        dueDateInput.value = date.toISOString().split('T')[0];
    },

    populateDropdowns() {
        this.populateStudentDropdown();
        this.populateBookDropdown();
    },

    populateStudentDropdown(filterTerm = '') {
        const studentSelect = document.getElementById('issue-student-select');
        if (!studentSelect) return;

        const students = LMSStorage.getStudents();
        const term = filterTerm.trim().toLowerCase();

        let html = '<option value="">-- Choose Registered Student --</option>';

        const filtered = students.filter(s => {
            if (!term) return true;
            return s.name.toLowerCase().includes(term) || 
                   s.id.toLowerCase().includes(term) ||
                   s.department.toLowerCase().includes(term);
        });

        filtered.forEach(s => {
            const activeCount = LMSStorage.getStudentIssuedCount(s.id);
            const settings = LMSStorage.getSettings();
            const isMax = activeCount >= settings.maxBooksPerStudent;
            const quotaText = isMax ? ' [LIMIT REACHED]' : ` (${activeCount}/${settings.maxBooksPerStudent} books)`;

            html += `<option value="${s.id}" ${isMax ? 'disabled' : ''}>${s.id} - ${s.name} (${s.department})${quotaText}</option>`;
        });

        studentSelect.innerHTML = html;
    },

    populateBookDropdown(filterTerm = '') {
        const bookSelect = document.getElementById('issue-book-select');
        if (!bookSelect) return;

        const books = LMSStorage.getBooks();
        const term = filterTerm.trim().toLowerCase();

        let html = '<option value="">-- Choose Available Book --</option>';

        const filtered = books.filter(b => {
            if (!term) return true;
            return b.title.toLowerCase().includes(term) || 
                   b.author.toLowerCase().includes(term) ||
                   b.isbn.toLowerCase().includes(term) ||
                   b.id.toLowerCase().includes(term);
        });

        filtered.forEach(b => {
            const avail = parseInt(b.availableCopies, 10);
            const isOutOfStock = avail <= 0;
            const stockLabel = isOutOfStock ? ' [OUT OF STOCK]' : ` [Available: ${avail}/${b.quantity}]`;

            html += `<option value="${b.id}" ${isOutOfStock ? 'disabled' : ''}>${b.id} - ${b.title}${stockLabel}</option>`;
        });

        bookSelect.innerHTML = html;
    },

    filterStudentDropdown(term) {
        this.populateStudentDropdown(term);
    },

    filterBookDropdown(term) {
        this.populateBookDropdown(term);
    },

    updateStudentPreview(studentId) {
        const previewCard = document.getElementById('issue-student-preview');
        if (!previewCard) return;

        if (!studentId) {
            previewCard.innerHTML = `
                <div class="empty-preview-card text-center text-muted p-4 border rounded-3 bg-light">
                    <i class="fa-solid fa-id-card fs-1 mb-2 opacity-50"></i>
                    <p class="mb-0">Select a student above to inspect their profile and active borrowing quota.</p>
                </div>
            `;
            return;
        }

        const student = LMSStorage.getStudentById(studentId);
        if (!student) return;

        const activeCount = LMSStorage.getStudentIssuedCount(student.id);
        const settings = LMSStorage.getSettings();
        const isMax = activeCount >= settings.maxBooksPerStudent;

        previewCard.innerHTML = `
            <div class="card p-3 border-primary border-opacity-25 bg-primary bg-opacity-10 rounded-3">
                <div class="d-flex align-items-center mb-2">
                    <div class="user-avatar-initials me-3">${StudentsModule.getInitials(student.name)}</div>
                    <div>
                        <h6 class="fw-bold mb-0 text-primary">${this.escapeHTML(student.name)}</h6>
                        <span class="badge-code small">${student.id}</span>
                    </div>
                </div>
                <div class="small text-muted mt-2">
                    <div><i class="fa-solid fa-graduation-cap"></i> ${this.escapeHTML(student.department)} (${student.year})</div>
                    <div><i class="fa-solid fa-envelope"></i> ${this.escapeHTML(student.email)}</div>
                    <div><i class="fa-solid fa-phone"></i> ${this.escapeHTML(student.phone || 'N/A')}</div>
                </div>
                <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="small fw-semibold">Active Loans:</span>
                    <span class="badge ${isMax ? 'bg-danger' : 'bg-primary'}">${activeCount} / ${settings.maxBooksPerStudent} allowed</span>
                </div>
            </div>
        `;
    },

    updateBookPreview(bookId) {
        const previewCard = document.getElementById('issue-book-preview');
        if (!previewCard) return;

        if (!bookId) {
            previewCard.innerHTML = `
                <div class="empty-preview-card text-center text-muted p-4 border rounded-3 bg-light">
                    <i class="fa-solid fa-book fs-1 mb-2 opacity-50"></i>
                    <p class="mb-0">Select a book above to inspect availability, shelf details, and ISBN.</p>
                </div>
            `;
            return;
        }

        const book = LMSStorage.getBookById(bookId);
        if (!book) return;

        const avail = parseInt(book.availableCopies, 10);
        const isOutOfStock = avail <= 0;

        previewCard.innerHTML = `
            <div class="card p-3 border-success border-opacity-25 bg-success bg-opacity-10 rounded-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <span class="badge-code small mb-1">${book.id}</span>
                        <h6 class="fw-bold mb-0 text-dark">${this.escapeHTML(book.title)}</h6>
                    </div>
                    <span class="status-badge ${isOutOfStock ? 'badge-danger' : 'badge-success'}">
                        ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>
                </div>
                <div class="small text-muted mt-1">
                    <div><i class="fa-solid fa-pen-nib"></i> ${this.escapeHTML(book.author)}</div>
                    <div><i class="fa-solid fa-barcode"></i> ISBN: ${this.escapeHTML(book.isbn)}</div>
                    <div><i class="fa-solid fa-layer-group"></i> Category: ${this.escapeHTML(book.category)}</div>
                </div>
                <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="small fw-semibold">Available on Shelf:</span>
                    <span class="fs-6 fw-bold ${avail > 0 ? 'text-success' : 'text-danger'}">${avail} of ${book.quantity} copies</span>
                </div>
            </div>
        `;
    },

    handleIssueSubmit() {
        const studentId = document.getElementById('issue-student-select').value;
        const bookId = document.getElementById('issue-book-select').value;
        const issueDate = document.getElementById('issue-date').value;
        const dueDate = document.getElementById('issue-due-date').value;
        const notes = document.getElementById('issue-notes') ? document.getElementById('issue-notes').value.trim() : '';

        if (!studentId) {
            showToast('Please select a student.', 'warning');
            return;
        }
        if (!bookId) {
            showToast('Please select a book to issue.', 'warning');
            return;
        }
        if (!issueDate || !dueDate) {
            showToast('Please specify valid issue and due dates.', 'warning');
            return;
        }

        if (new Date(dueDate) <= new Date(issueDate)) {
            showToast('Due date must be after the issue date.', 'warning');
            return;
        }

        // Call Storage Service to execute the transaction
        const result = LMSStorage.issueBook({
            studentId,
            bookId,
            issueDate,
            dueDate,
            notes
        });

        if (result.success) {
            showToast(result.message, 'success');
            
            // Reset form fields
            document.getElementById('issue-student-select').value = '';
            document.getElementById('issue-book-select').value = '';
            if (document.getElementById('issue-notes')) {
                document.getElementById('issue-notes').value = '';
            }
            if (document.getElementById('issue-student-search')) {
                document.getElementById('issue-student-search').value = '';
            }
            if (document.getElementById('issue-book-search')) {
                document.getElementById('issue-book-search').value = '';
            }

            this.updateStudentPreview('');
            this.updateBookPreview('');
            this.populateDropdowns();
            this.renderRecentIssuesTable();

            // Refresh other modules if active
            if (window.BooksModule) BooksModule.renderBooks();
            if (window.StudentsModule) StudentsModule.renderStudents();
            if (window.ReturnModule) ReturnModule.renderIssuedTable();
            if (window.DashboardModule) DashboardModule.refreshAll();
        } else {
            showToast(result.message, 'error');
        }
    },

    renderRecentIssuesTable() {
        const tableBody = document.getElementById('recent-issues-table-body');
        if (!tableBody) return;

        const transactions = LMSStorage.getTransactions();
        // Get latest 5 transactions
        const latest = transactions.slice(0, 6);

        if (latest.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-3 text-muted">No transactions recorded yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = latest.map((tx, idx) => {
            const isReturned = tx.status === 'Returned';
            return `
                <tr>
                    <td><span class="badge-code">${tx.id}</span></td>
                    <td class="fw-semibold">${this.escapeHTML(tx.studentName)} <small class="text-muted d-block">${tx.studentId}</small></td>
                    <td>${this.escapeHTML(tx.bookTitle)} <small class="text-muted d-block">${tx.bookId}</small></td>
                    <td><small>${tx.issueDate}</small></td>
                    <td><small class="fw-bold ${!isReturned && new Date(tx.dueDate) < new Date() ? 'text-danger' : 'text-dark'}">${tx.dueDate}</small></td>
                    <td>
                        <span class="status-badge ${isReturned ? 'badge-success' : 'badge-warning'}">
                            ${tx.status}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
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

window.IssueModule = IssueModule;
