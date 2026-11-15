/**
 * Library Management System - Books Module
 * Handles Book Management CRUD operations, search, filters, and UI rendering.
 */

const BooksModule = {
    currentFilter: 'all',
    currentCategory: 'all',
    searchQuery: '',

    init() {
        this.bindEvents();
        this.renderCategoryOptions();
        this.renderBooks();
    },

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('books-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderBooks();
            });
        }

        // Category Filter
        const categoryFilter = document.getElementById('books-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.renderBooks();
            });
        }

        // Stock Availability Filter
        const stockFilter = document.getElementById('books-stock-filter');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderBooks();
            });
        }

        // Add Book Button -> Open Modal
        const btnAddBook = document.getElementById('btn-add-book');
        if (btnAddBook) {
            btnAddBook.addEventListener('click', () => this.openAddModal());
        }

        // Book Form Submit (handles both Add and Edit)
        const bookForm = document.getElementById('book-form');
        if (bookForm) {
            bookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Quantity input auto-updates available copies for new books
        const qtyInput = document.getElementById('book-quantity');
        const availInput = document.getElementById('book-available');
        const formMode = document.getElementById('book-form-mode');
        if (qtyInput && availInput && formMode) {
            qtyInput.addEventListener('input', () => {
                if (formMode.value === 'add') {
                    availInput.value = qtyInput.value;
                }
            });
        }
    },

    renderCategoryOptions() {
        const books = LMSStorage.getBooks();
        const categories = [...new Set(books.map(b => b.category).filter(Boolean))].sort();

        const filterSelect = document.getElementById('books-category-filter');
        if (filterSelect) {
            let options = '<option value="all">All Categories</option>';
            categories.forEach(cat => {
                options += `<option value="${cat}">${cat}</option>`;
            });
            filterSelect.innerHTML = options;
        }

        // Also update the select inside Book Form Modal
        const modalCategorySelect = document.getElementById('book-category');
        if (modalCategorySelect) {
            let modalOpts = '<option value="">Select Category</option>';
            const defaultCats = [
                'Computer Science', 'Database Systems', 'Operating Systems', 
                'Networking', 'Software Engineering', 'Artificial Intelligence', 
                'Programming', 'Data Structures', 'Compilers', 'Mathematics', 'Electronics'
            ];
            const allCats = [...new Set([...categories, ...defaultCats])].sort();
            allCats.forEach(cat => {
                modalOpts += `<option value="${cat}">${cat}</option>`;
            });
            modalCategorySelect.innerHTML = modalOpts;
        }
    },

    getFilteredBooks() {
        const books = LMSStorage.getBooks();
        return books.filter(book => {
            // Search query matches title, author, isbn, id, or publisher
            const matchesSearch = !this.searchQuery || 
                book.title.toLowerCase().includes(this.searchQuery) ||
                book.author.toLowerCase().includes(this.searchQuery) ||
                book.isbn.toLowerCase().includes(this.searchQuery) ||
                book.id.toLowerCase().includes(this.searchQuery) ||
                (book.publisher && book.publisher.toLowerCase().includes(this.searchQuery));

            // Category filter
            const matchesCategory = this.currentCategory === 'all' || 
                (book.category && book.category.toLowerCase() === this.currentCategory.toLowerCase());

            // Availability filter
            let matchesStock = true;
            if (this.currentFilter === 'available') {
                matchesStock = book.availableCopies > 0;
            } else if (this.currentFilter === 'out-of-stock') {
                matchesStock = book.availableCopies <= 0;
            }

            return matchesSearch && matchesCategory && matchesStock;
        });
    },

    renderBooks() {
        const tableBody = document.getElementById('books-table-body');
        const emptyState = document.getElementById('books-empty-state');
        const countBadge = document.getElementById('books-count-badge');

        if (!tableBody) return;

        const filteredBooks = this.getFilteredBooks();

        if (countBadge) {
            countBadge.textContent = `${filteredBooks.length} Books`;
        }

        if (filteredBooks.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('d-none');
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');

        tableBody.innerHTML = filteredBooks.map((book, idx) => {
            const avail = parseInt(book.availableCopies, 10);
            const total = parseInt(book.quantity, 10);
            const issued = Math.max(0, total - avail);

            let statusBadge = '';
            if (avail === 0) {
                statusBadge = '<span class="status-badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>';
            } else if (avail <= 2) {
                statusBadge = '<span class="status-badge badge-warning"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
            } else {
                statusBadge = '<span class="status-badge badge-success"><i class="fa-solid fa-circle-check"></i> Available</span>';
            }

            return `
                <tr>
                    <td class="text-muted fw-bold">${idx + 1}</td>
                    <td>
                        <span class="badge-code">${book.id}</span>
                    </td>
                    <td>
                        <div class="book-title-cell">
                            <span class="book-title-text fw-semibold">${this.escapeHTML(book.title)}</span>
                            <span class="book-isbn text-muted"><i class="fa-solid fa-barcode"></i> ${this.escapeHTML(book.isbn)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="author-cell">
                            <i class="fa-solid fa-pen-nib text-primary"></i> ${this.escapeHTML(book.author)}
                        </div>
                    </td>
                    <td>
                        <span class="tag-category">${this.escapeHTML(book.category || 'General')}</span>
                    </td>
                    <td class="text-center">
                        <span class="copies-badge">${avail} <small class="text-muted">/ ${total}</small></span>
                    </td>
                    <td>${statusBadge}</td>
                    <td class="text-end">
                        <div class="table-actions">
                            <button type="button" class="btn-action btn-view" title="View Details" onclick="BooksModule.viewBookDetails('${book.id}')">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button type="button" class="btn-action btn-edit" title="Edit Book" onclick="BooksModule.openEditModal('${book.id}')">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="btn-action btn-delete" title="Delete Book" onclick="BooksModule.confirmDeleteBook('${book.id}')">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAddModal() {
        const form = document.getElementById('book-form');
        if (!form) return;
        form.reset();

        document.getElementById('book-form-mode').value = 'add';
        document.getElementById('book-modal-title').innerHTML = '<i class="fa-solid fa-book-medical text-primary"></i> Add New Book';
        
        // Auto-generate next Book ID
        const nextId = LMSStorage.getNextBookId();
        const idInput = document.getElementById('book-id');
        idInput.value = nextId;
        idInput.removeAttribute('readonly');

        // Set default quantity
        document.getElementById('book-quantity').value = 5;
        document.getElementById('book-available').value = 5;

        // Open modal
        openModal('book-modal');
    },

    openEditModal(bookId) {
        const book = LMSStorage.getBookById(bookId);
        if (!book) {
            showToast('Book not found!', 'error');
            return;
        }

        const form = document.getElementById('book-form');
        if (!form) return;
        form.reset();

        document.getElementById('book-form-mode').value = 'edit';
        document.getElementById('book-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square text-primary"></i> Edit Book Details (${book.id})`;

        const idInput = document.getElementById('book-id');
        idInput.value = book.id;
        idInput.setAttribute('readonly', 'true');

        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-category').value = book.category;
        document.getElementById('book-publisher').value = book.publisher || '';
        document.getElementById('book-quantity').value = book.quantity;
        document.getElementById('book-available').value = book.availableCopies;

        openModal('book-modal');
    },

    handleFormSubmit() {
        const mode = document.getElementById('book-form-mode').value;
        const id = document.getElementById('book-id').value.trim();
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const isbn = document.getElementById('book-isbn').value.trim();
        const category = document.getElementById('book-category').value.trim();
        const publisher = document.getElementById('book-publisher').value.trim();
        const quantity = parseInt(document.getElementById('book-quantity').value, 10);
        const availableCopies = parseInt(document.getElementById('book-available').value, 10);

        if (!id || !title || !author || !isbn || !category || isNaN(quantity)) {
            showToast('Please fill in all required fields accurately.', 'warning');
            return;
        }

        if (quantity < 1) {
            showToast('Total quantity must be at least 1.', 'warning');
            return;
        }

        if (availableCopies > quantity) {
            showToast('Available copies cannot exceed total quantity.', 'warning');
            return;
        }

        const bookData = {
            id,
            title,
            author,
            isbn,
            category,
            publisher,
            quantity,
            availableCopies
        };

        if (mode === 'add') {
            const result = LMSStorage.saveBook(bookData);
            if (result.success) {
                showToast(result.message, 'success');
                closeModal('book-modal');
                this.renderCategoryOptions();
                this.renderBooks();
                if (window.DashboardModule) DashboardModule.refreshAll();
            } else {
                showToast(result.message, 'error');
            }
        } else {
            const result = LMSStorage.updateBook(bookData);
            if (result.success) {
                showToast(result.message, 'success');
                closeModal('book-modal');
                this.renderCategoryOptions();
                this.renderBooks();
                if (window.DashboardModule) DashboardModule.refreshAll();
            } else {
                showToast(result.message, 'error');
            }
        }
    },

    confirmDeleteBook(bookId) {
        const book = LMSStorage.getBookById(bookId);
        if (!book) return;

        showConfirmDialog({
            title: 'Delete Book Record',
            message: `Are you sure you want to permanently delete <strong>"${this.escapeHTML(book.title)}"</strong> (${book.id})?<br><small class="text-danger mt-1 d-block"><i class="fa-solid fa-triangle-exclamation"></i> This operation cannot be undone.</small>`,
            confirmText: 'Delete Book',
            confirmButtonClass: 'btn-danger',
            onConfirm: () => {
                const res = LMSStorage.deleteBook(bookId);
                if (res.success) {
                    showToast(res.message, 'success');
                    this.renderBooks();
                    if (window.DashboardModule) DashboardModule.refreshAll();
                } else {
                    showToast(res.message, 'error');
                }
            }
        });
    },

    viewBookDetails(bookId) {
        const book = LMSStorage.getBookById(bookId);
        if (!book) return;

        const modalBody = document.getElementById('view-book-details-body');
        if (!modalBody) return;

        const issuedCount = Math.max(0, book.quantity - book.availableCopies);
        const activeTxs = LMSStorage.getActiveTransactions().filter(t => t.bookId.toLowerCase() === book.id.toLowerCase());

        modalBody.innerHTML = `
            <div class="details-card">
                <div class="details-header mb-3 pb-3 border-bottom d-flex align-items-center justify-content-between">
                    <div>
                        <span class="badge-code fs-6 mb-1">${book.id}</span>
                        <h4 class="fw-bold mb-0 text-primary">${this.escapeHTML(book.title)}</h4>
                    </div>
                    <span class="status-badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'} fs-6">
                        ${book.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="info-group">
                            <label class="text-muted small">Author(s)</label>
                            <p class="fw-semibold mb-0">${this.escapeHTML(book.author)}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-group">
                            <label class="text-muted small">ISBN Code</label>
                            <p class="fw-semibold mb-0">${this.escapeHTML(book.isbn)}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-group">
                            <label class="text-muted small">Category</label>
                            <p class="fw-semibold mb-0"><span class="tag-category">${this.escapeHTML(book.category)}</span></p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-group">
                            <label class="text-muted small">Publisher</label>
                            <p class="fw-semibold mb-0">${this.escapeHTML(book.publisher || 'Not specified')}</p>
                        </div>
                    </div>
                </div>

                <div class="inventory-status-box mt-4 p-3 bg-light rounded-3">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-warehouse text-primary"></i> Inventory Breakdown</h6>
                    <div class="d-flex justify-content-around text-center">
                        <div>
                            <span class="d-block text-muted small">Total Stock</span>
                            <span class="fs-4 fw-bold text-dark">${book.quantity}</span>
                        </div>
                        <div>
                            <span class="d-block text-muted small">Available Copies</span>
                            <span class="fs-4 fw-bold text-success">${book.availableCopies}</span>
                        </div>
                        <div>
                            <span class="d-block text-muted small">Currently Issued</span>
                            <span class="fs-4 fw-bold text-warning">${issuedCount}</span>
                        </div>
                    </div>
                </div>

                <div class="active-borrowers-list mt-4">
                    <h6 class="fw-bold mb-2"><i class="fa-solid fa-users text-primary"></i> Currently Borrowed By (${activeTxs.length})</h6>
                    ${activeTxs.length === 0 ? '<p class="text-muted small mb-0">No students are currently holding this book.</p>' : `
                        <ul class="list-group list-group-flush small">
                            ${activeTxs.map(tx => `
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <div>
                                        <strong>${this.escapeHTML(tx.studentName)}</strong> (${tx.studentId})
                                        <div class="text-muted">Due: ${tx.dueDate}</div>
                                    </div>
                                    <span class="badge bg-primary text-white">${tx.id}</span>
                                </li>
                            `).join('')}
                        </ul>
                    `}
                </div>
            </div>
        `;

        openModal('view-book-modal');
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

window.BooksModule = BooksModule;
