/**
 * Library Management System - Students Module
 * Handles Student Management CRUD operations, search, filters, borrowing history, and UI rendering.
 */

const StudentsModule = {
    searchQuery: '',
    departmentFilter: 'all',
    yearFilter: 'all',

    init() {
        this.bindEvents();
        this.renderDepartmentFilterOptions();
        this.renderStudents();
    },

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('students-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderStudents();
            });
        }

        // Department Filter
        const deptFilter = document.getElementById('students-dept-filter');
        if (deptFilter) {
            deptFilter.addEventListener('change', (e) => {
                this.departmentFilter = e.target.value;
                this.renderStudents();
            });
        }

        // Year Filter
        const yearFilter = document.getElementById('students-year-filter');
        if (yearFilter) {
            yearFilter.addEventListener('change', (e) => {
                this.yearFilter = e.target.value;
                this.renderStudents();
            });
        }

        // Add Student Button -> Open Modal
        const btnAdd = document.getElementById('btn-add-student');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openAddModal());
        }

        // Form Submit
        const studentForm = document.getElementById('student-form');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    },

    renderDepartmentFilterOptions() {
        const students = LMSStorage.getStudents();
        const depts = [...new Set(students.map(s => s.department).filter(Boolean))].sort();

        const filterSelect = document.getElementById('students-dept-filter');
        if (filterSelect) {
            let options = '<option value="all">All Departments</option>';
            depts.forEach(d => {
                options += `<option value="${d}">${d}</option>`;
            });
            filterSelect.innerHTML = options;
        }

        // Also ensure student form dropdown has engineering branches
        const modalDeptSelect = document.getElementById('student-department');
        if (modalDeptSelect) {
            const standardDepts = [
                'Computer Science & Engineering',
                'Information Technology',
                'Electronics & Communication',
                'Electrical & Electronics',
                'Mechanical Engineering',
                'Civil Engineering',
                'Data Science & AI'
            ];
            const allDepts = [...new Set([...depts, ...standardDepts])].sort();
            let modalOpts = '<option value="">Select Department</option>';
            allDepts.forEach(d => {
                modalOpts += `<option value="${d}">${d}</option>`;
            });
            modalDeptSelect.innerHTML = modalOpts;
        }
    },

    getFilteredStudents() {
        const students = LMSStorage.getStudents();
        return students.filter(student => {
            const matchesSearch = !this.searchQuery ||
                student.name.toLowerCase().includes(this.searchQuery) ||
                student.id.toLowerCase().includes(this.searchQuery) ||
                student.email.toLowerCase().includes(this.searchQuery) ||
                (student.phone && student.phone.includes(this.searchQuery)) ||
                (student.department && student.department.toLowerCase().includes(this.searchQuery));

            const matchesDept = this.departmentFilter === 'all' || 
                (student.department && student.department.toLowerCase() === this.departmentFilter.toLowerCase());

            const matchesYear = this.yearFilter === 'all' || 
                (student.year && student.year.toLowerCase() === this.yearFilter.toLowerCase());

            return matchesSearch && matchesDept && matchesYear;
        });
    },

    renderStudents() {
        const tableBody = document.getElementById('students-table-body');
        const emptyState = document.getElementById('students-empty-state');
        const countBadge = document.getElementById('students-count-badge');

        if (!tableBody) return;

        const filtered = this.getFilteredStudents();

        if (countBadge) {
            countBadge.textContent = `${filtered.length} Students`;
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        tableBody.innerHTML = filtered.map((student, idx) => {
            const issuedCount = LMSStorage.getStudentIssuedCount(student.id);
            const initials = this.getInitials(student.name);

            return `
                <tr>
                    <td class="text-muted fw-bold">${idx + 1}</td>
                    <td>
                        <span class="badge-code">${student.id}</span>
                    </td>
                    <td>
                        <div class="user-profile-cell">
                            <div class="user-avatar-initials">${initials}</div>
                            <div>
                                <span class="fw-semibold text-dark d-block">${this.escapeHTML(student.name)}</span>
                                <small class="text-muted"><i class="fa-solid fa-envelope"></i> ${this.escapeHTML(student.email)}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="text-dark"><i class="fa-solid fa-phone small text-muted"></i> ${this.escapeHTML(student.phone || 'N/A')}</span>
                    </td>
                    <td>
                        <span class="tag-department">${this.escapeHTML(student.department)}</span>
                    </td>
                    <td>
                        <span class="badge-year">${this.escapeHTML(student.year)}</span>
                    </td>
                    <td class="text-center">
                        <span class="status-badge ${issuedCount > 0 ? 'badge-primary' : 'badge-secondary'}">
                            <i class="fa-solid fa-book-bookmark"></i> ${issuedCount} Active
                        </span>
                    </td>
                    <td class="text-end">
                        <div class="table-actions">
                            <button type="button" class="btn-action btn-view" title="Borrowing History" onclick="StudentsModule.viewBorrowingHistory('${student.id}')">
                                <i class="fa-solid fa-clock-rotate-left"></i>
                            </button>
                            <button type="button" class="btn-action btn-edit" title="Edit Student" onclick="StudentsModule.openEditModal('${student.id}')">
                                <i class="fa-solid fa-user-pen"></i>
                            </button>
                            <button type="button" class="btn-action btn-delete" title="Delete Student" onclick="StudentsModule.confirmDeleteStudent('${student.id}')">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAddModal() {
        const form = document.getElementById('student-form');
        if (!form) return;
        form.reset();

        document.getElementById('student-form-mode').value = 'add';
        document.getElementById('student-modal-title').innerHTML = '<i class="fa-solid fa-user-plus text-primary"></i> Register New Student';

        const idInput = document.getElementById('student-id');
        idInput.value = LMSStorage.getNextStudentId();
        idInput.removeAttribute('readonly');

        openModal('student-modal');
    },

    openEditModal(studentId) {
        const student = LMSStorage.getStudentById(studentId);
        if (!student) {
            showToast('Student not found!', 'error');
            return;
        }

        const form = document.getElementById('student-form');
        if (!form) return;
        form.reset();

        document.getElementById('student-form-mode').value = 'edit';
        document.getElementById('student-modal-title').innerHTML = `<i class="fa-solid fa-user-pen text-primary"></i> Edit Student Record (${student.id})`;

        const idInput = document.getElementById('student-id');
        idInput.value = student.id;
        idInput.setAttribute('readonly', 'true');

        document.getElementById('student-name').value = student.name;
        document.getElementById('student-email').value = student.email;
        document.getElementById('student-phone').value = student.phone || '';
        document.getElementById('student-department').value = student.department;
        document.getElementById('student-year').value = student.year;

        openModal('student-modal');
    },

    handleFormSubmit() {
        const mode = document.getElementById('student-form-mode').value;
        const id = document.getElementById('student-id').value.trim();
        const name = document.getElementById('student-name').value.trim();
        const email = document.getElementById('student-email').value.trim();
        const phone = document.getElementById('student-phone').value.trim();
        const department = document.getElementById('student-department').value.trim();
        const year = document.getElementById('student-year').value.trim();

        if (!id || !name || !email || !department || !year) {
            showToast('Please fill in all mandatory fields.', 'warning');
            return;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showToast('Please enter a valid email address.', 'warning');
            return;
        }

        // Phone validation (if provided)
        if (phone && !/^\+?[\d\s-]{7,15}$/.test(phone)) {
            showToast('Please enter a valid phone number.', 'warning');
            return;
        }

        const studentData = {
            id,
            name,
            email,
            phone,
            department,
            year
        };

        if (mode === 'add') {
            const res = LMSStorage.saveStudent(studentData);
            if (res.success) {
                showToast(res.message, 'success');
                closeModal('student-modal');
                this.renderDepartmentFilterOptions();
                this.renderStudents();
                if (window.DashboardModule) DashboardModule.refreshAll();
            } else {
                showToast(res.message, 'error');
            }
        } else {
            const res = LMSStorage.updateStudent(studentData);
            if (res.success) {
                showToast(res.message, 'success');
                closeModal('student-modal');
                this.renderDepartmentFilterOptions();
                this.renderStudents();
                if (window.DashboardModule) DashboardModule.refreshAll();
            } else {
                showToast(res.message, 'error');
            }
        }
    },

    confirmDeleteStudent(studentId) {
        const student = LMSStorage.getStudentById(studentId);
        if (!student) return;

        showConfirmDialog({
            title: 'Delete Student Record',
            message: `Are you sure you want to remove <strong>"${this.escapeHTML(student.name)}"</strong> (${student.id}) from the system?<br><small class="text-danger mt-1 d-block"><i class="fa-solid fa-triangle-exclamation"></i> Only students with zero active borrowed books can be deleted.</small>`,
            confirmText: 'Delete Record',
            confirmButtonClass: 'btn-danger',
            onConfirm: () => {
                const res = LMSStorage.deleteStudent(studentId);
                if (res.success) {
                    showToast(res.message, 'success');
                    this.renderStudents();
                    if (window.DashboardModule) DashboardModule.refreshAll();
                } else {
                    showToast(res.message, 'error');
                }
            }
        });
    },

    viewBorrowingHistory(studentId) {
        const student = LMSStorage.getStudentById(studentId);
        if (!student) return;

        const modalBody = document.getElementById('view-student-history-body');
        if (!modalBody) return;

        const allTransactions = LMSStorage.getTransactions();
        const studentTransactions = allTransactions.filter(t => t.studentId.toLowerCase() === studentId.toLowerCase());

        modalBody.innerHTML = `
            <div class="student-history-header p-3 bg-light rounded-3 mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold mb-1 text-primary">${this.escapeHTML(student.name)}</h5>
                    <div class="text-muted small">
                        <span><i class="fa-solid fa-id-badge"></i> ${student.id}</span> &bull; 
                        <span><i class="fa-solid fa-graduation-cap"></i> ${this.escapeHTML(student.department)} (${student.year})</span>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge bg-primary fs-6">${studentTransactions.length} Total Loans</span>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-sm align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Tx ID</th>
                            <th>Book Title</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Return Date</th>
                            <th>Fine Paid</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentTransactions.length === 0 ? `
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">
                                    <i class="fa-solid fa-book-open fs-3 d-block mb-2 opacity-50"></i>
                                    No borrowing history records found for this student.
                                </td>
                            </tr>
                        ` : studentTransactions.map(tx => {
                            let badge = tx.status === 'Issued' 
                                ? '<span class="status-badge badge-warning">Issued (Active)</span>' 
                                : '<span class="status-badge badge-success">Returned</span>';

                            return `
                                <tr>
                                    <td><span class="badge-code">${tx.id}</span></td>
                                    <td class="fw-semibold">${this.escapeHTML(tx.bookTitle)}</td>
                                    <td><small>${tx.issueDate}</small></td>
                                    <td><small>${tx.dueDate}</small></td>
                                    <td><small>${tx.returnDate || '<span class="text-muted">--</span>'}</small></td>
                                    <td>${tx.fineAmount > 0 ? `<span class="text-danger fw-bold">₹${tx.fineAmount}</span>` : '<span class="text-muted">₹0</span>'}</td>
                                    <td>${badge}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        openModal('view-student-history-modal');
    },

    getInitials(name) {
        if (!name) return 'ST';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
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

window.StudentsModule = StudentsModule;
