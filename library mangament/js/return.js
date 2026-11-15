/**
 * Library Management System - Return Books Module
 * Handles displaying currently issued books, real-time fine calculation
 * (₹5 per day overdue), returning books, and inventory restock.
 */

const ReturnModule = {
    searchQuery: '',
    filterType: 'all', // 'all', 'overdue', 'due-soon'

    init() {
        this.bindEvents();
        this.renderIssuedTable();
    },

    bindEvents() {
        // Search
        const searchInput = document.getElementById('return-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderIssuedTable();
            });
        }

        // Filter: All vs Overdue vs Normal
        const filterSelect = document.getElementById('return-status-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterType = e.target.value;
                this.renderIssuedTable();
            });
        }

        // Return Modal Form Submit
        const returnForm = document.getElementById('return-process-form');
        if (returnForm) {
            returnForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleConfirmReturn();
            });
        }

        // Return Date input inside modal recalculates fine on change
        const returnDateInput = document.getElementById('modal-return-date');
        if (returnDateInput) {
            returnDateInput.addEventListener('change', () => {
                this.recalculateModalFine();
            });
        }
    },

    getFilteredTransactions() {
        const activeTxs = LMSStorage.getActiveTransactions();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return activeTxs.filter(tx => {
            // Search match
            const matchesSearch = !this.searchQuery ||
                tx.id.toLowerCase().includes(this.searchQuery) ||
                tx.studentName.toLowerCase().includes(this.searchQuery) ||
                tx.studentId.toLowerCase().includes(this.searchQuery) ||
                tx.bookTitle.toLowerCase().includes(this.searchQuery) ||
                tx.bookId.toLowerCase().includes(this.searchQuery);

            if (!matchesSearch) return false;

            // Status filter
            const dueDate = new Date(tx.dueDate + 'T00:00:00');
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (this.filterType === 'overdue') {
                return diffDays < 0;
            } else if (this.filterType === 'due-soon') {
                return diffDays >= 0 && diffDays <= 3; // due in next 3 days
            }

            return true;
        });
    },

    renderIssuedTable() {
        const tableBody = document.getElementById('return-table-body');
        const emptyState = document.getElementById('return-empty-state');
        const countBadge = document.getElementById('return-count-badge');

        if (!tableBody) return;

        const filtered = this.getFilteredTransactions();

        if (countBadge) {
            countBadge.textContent = `${filtered.length} Active Loans`;
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        tableBody.innerHTML = filtered.map((tx, idx) => {
            const fineInfo = LMSStorage.calculateFine(tx.dueDate);

            let statusPill = '';
            let fineDisplay = '';

            if (fineInfo.isOverdue) {
                statusPill = `<span class="status-badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Overdue (${fineInfo.overdueDays}d)</span>`;
                fineDisplay = `<span class="text-danger fw-bold fs-6">₹${fineInfo.fineAmount}</span><small class="d-block text-muted">@ ₹5/day</small>`;
            } else {
                statusPill = `<span class="status-badge badge-info"><i class="fa-solid fa-clock"></i> On Schedule</span>`;
                fineDisplay = '<span class="text-success fw-semibold">₹0</span>';
            }

            return `
                <tr>
                    <td class="text-muted fw-bold">${idx + 1}</td>
                    <td><span class="badge-code">${tx.id}</span></td>
                    <td>
                        <div class="user-profile-cell">
                            <div>
                                <span class="fw-semibold text-dark d-block">${this.escapeHTML(tx.studentName)}</span>
                                <small class="text-muted"><i class="fa-solid fa-id-card"></i> ${tx.studentId}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="book-title-cell">
                            <span class="book-title-text fw-semibold">${this.escapeHTML(tx.bookTitle)}</span>
                            <small class="text-muted"><i class="fa-solid fa-barcode"></i> ${tx.bookId}</small>
                        </div>
                    </td>
                    <td><small>${tx.issueDate}</small></td>
                    <td>
                        <small class="fw-bold ${fineInfo.isOverdue ? 'text-danger' : 'text-dark'}">
                            ${tx.dueDate}
                        </small>
                    </td>
                    <td>${statusPill}</td>
                    <td>${fineDisplay}</td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-primary px-3 shadow-sm" onclick="ReturnModule.openReturnModal('${tx.id}')">
                            <i class="fa-solid fa-arrow-rotate-left me-1"></i> Return Book
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openReturnModal(transactionId) {
        const tx = LMSStorage.getTransactionById(transactionId);
        if (!tx) {
            showToast('Transaction not found!', 'error');
            return;
        }

        const form = document.getElementById('return-process-form');
        if (form) form.reset();

        document.getElementById('modal-return-tx-id').value = tx.id;
        document.getElementById('modal-return-tx-display').textContent = tx.id;
        document.getElementById('modal-return-student').textContent = `${tx.studentName} (${tx.studentId})`;
        document.getElementById('modal-return-book').textContent = `${tx.bookTitle} (${tx.bookId})`;
        document.getElementById('modal-return-issue-date').textContent = tx.issueDate;
        document.getElementById('modal-return-due-date').textContent = tx.dueDate;

        // Default return date to today
        const todayStr = new Date().toISOString().split('T')[0];
        const returnDateInput = document.getElementById('modal-return-date');
        returnDateInput.value = todayStr;

        // Calculate fine
        this.recalculateModalFine();

        openModal('return-process-modal');
    },

    recalculateModalFine() {
        const txId = document.getElementById('modal-return-tx-id').value;
        const tx = LMSStorage.getTransactionById(txId);
        if (!tx) return;

        const returnDate = document.getElementById('modal-return-date').value;
        const fineInfo = LMSStorage.calculateFine(tx.dueDate, returnDate);

        const fineDisplay = document.getElementById('modal-return-fine-amount');
        const fineNote = document.getElementById('modal-return-fine-note');
        const fineCollectedInput = document.getElementById('modal-return-fine-collected');

        if (fineInfo.isOverdue) {
            fineDisplay.textContent = `₹${fineInfo.fineAmount}`;
            fineDisplay.className = 'fs-3 fw-bold text-danger';
            fineNote.textContent = `⚠️ Overdue by ${fineInfo.overdueDays} day(s) × ₹${fineInfo.ratePerDay}/day = ₹${fineInfo.fineAmount}`;
            if (fineCollectedInput) fineCollectedInput.value = fineInfo.fineAmount;
        } else {
            fineDisplay.textContent = '₹0';
            fineDisplay.className = 'fs-3 fw-bold text-success';
            fineNote.textContent = '✅ Book returned on or before the due date. No late fine applied.';
            if (fineCollectedInput) fineCollectedInput.value = 0;
        }
    },

    handleConfirmReturn() {
        const txId = document.getElementById('modal-return-tx-id').value;
        const returnDate = document.getElementById('modal-return-date').value;
        const fineCollected = document.getElementById('modal-return-fine-collected').value;
        const remarks = document.getElementById('modal-return-remarks').value;

        if (!txId) {
            showToast('Invalid transaction selected.', 'error');
            return;
        }

        const result = LMSStorage.returnBook({
            transactionId: txId,
            returnDate: returnDate,
            fineCollected: fineCollected,
            remarks: remarks
        });

        if (result.success) {
            showToast(result.message, 'success');
            closeModal('return-process-modal');

            this.renderIssuedTable();

            // Refresh other modules
            if (window.BooksModule) BooksModule.renderBooks();
            if (window.StudentsModule) StudentsModule.renderStudents();
            if (window.IssueModule) {
                IssueModule.populateDropdowns();
                IssueModule.renderRecentIssuesTable();
            }
            if (window.DashboardModule) DashboardModule.refreshAll();
        } else {
            showToast(result.message, 'error');
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

window.ReturnModule = ReturnModule;
