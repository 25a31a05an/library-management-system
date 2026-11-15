/**
 * Library Management System - Storage Service
 * Handles all LocalStorage interactions, seed data, and CRUD operations.
 */

const STORAGE_KEYS = {
    BOOKS: 'lms_books_data',
    STUDENTS: 'lms_students_data',
    TRANSACTIONS: 'lms_transactions_data',
    SETTINGS: 'lms_settings_data',
    AUTH_USER: 'lms_auth_user',
    THEME: 'lms_theme_preference'
};

const DEFAULT_SETTINGS = {
    libraryName: 'Central Library - Department of CSE',
    institution: 'B.Tech Computer Science & Engineering',
    fineRatePerDay: 5, // ₹5 per day as requested
    maxBooksPerStudent: 3,
    loanDurationDays: 14,
    currencySymbol: '₹',
    emailNotification: true
};

// Realistic B.Tech CSE Textbooks and Engineering References
const INITIAL_BOOKS = [
    {
        id: 'BK-101',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
        isbn: '978-0262033848',
        category: 'Computer Science',
        publisher: 'MIT Press',
        quantity: 8,
        availableCopies: 7
    },
    {
        id: 'BK-102',
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
        isbn: '978-0078022159',
        category: 'Database Systems',
        publisher: 'McGraw-Hill Education',
        quantity: 6,
        availableCopies: 5
    },
    {
        id: 'BK-103',
        title: 'Operating System Concepts (Dinosaur Book)',
        author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
        isbn: '978-1118063330',
        category: 'Operating Systems',
        publisher: 'John Wiley & Sons',
        quantity: 7,
        availableCopies: 7
    },
    {
        id: 'BK-104',
        title: 'Computer Networks: A Top-Down Approach',
        author: 'James F. Kurose, Keith W. Ross',
        isbn: '978-0136681557',
        category: 'Networking',
        publisher: 'Pearson',
        quantity: 5,
        availableCopies: 4
    },
    {
        id: 'BK-105',
        title: 'Software Engineering: A Practitioner\'s Approach',
        author: 'Roger S. Pressman, Bruce R. Maxim',
        isbn: '978-0078022128',
        category: 'Software Engineering',
        publisher: 'McGraw-Hill',
        quantity: 6,
        availableCopies: 6
    },
    {
        id: 'BK-106',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        isbn: '978-0136042594',
        category: 'Artificial Intelligence',
        publisher: 'Pearson Education',
        quantity: 4,
        availableCopies: 3
    },
    {
        id: 'BK-107',
        title: 'Java: The Complete Reference (Twelfth Edition)',
        author: 'Herbert Schildt',
        isbn: '978-1260440232',
        category: 'Programming',
        publisher: 'Oracle Press / McGraw-Hill',
        quantity: 10,
        availableCopies: 8
    },
    {
        id: 'BK-108',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin ("Uncle Bob")',
        isbn: '978-0132350884',
        category: 'Software Engineering',
        publisher: 'Prentice Hall',
        quantity: 5,
        availableCopies: 5
    },
    {
        id: 'BK-109',
        title: 'Computer Organization and Architecture',
        author: 'William Stallings',
        isbn: '978-0134101613',
        category: 'Computer Science',
        publisher: 'Pearson',
        quantity: 6,
        availableCopies: 5
    },
    {
        id: 'BK-110',
        title: 'Data Structures and Algorithm Analysis in Java',
        author: 'Mark Allen Weiss',
        isbn: '978-0132576277',
        category: 'Data Structures',
        publisher: 'Pearson',
        quantity: 7,
        availableCopies: 7
    },
    {
        id: 'BK-111',
        title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
        author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
        isbn: '978-0321486813',
        category: 'Compilers',
        publisher: 'Pearson',
        quantity: 3,
        availableCopies: 0 // Out of stock for testing availability checks!
    },
    {
        id: 'BK-112',
        title: 'Discrete Mathematics and Its Applications',
        author: 'Kenneth H. Rosen',
        isbn: '978-0073383095',
        category: 'Mathematics',
        publisher: 'McGraw-Hill',
        quantity: 8,
        availableCopies: 7
    }
];

// Realistic B.Tech Engineering Students
const INITIAL_STUDENTS = [
    {
        id: 'STU-202101',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        phone: '9876543210',
        department: 'Computer Science & Engineering',
        year: '4th Year'
    },
    {
        id: 'STU-202102',
        name: 'Priya Patel',
        email: 'priya.patel@college.edu',
        phone: '9876543211',
        department: 'Computer Science & Engineering',
        year: '3rd Year'
    },
    {
        id: 'STU-202103',
        name: 'Rahul Verma',
        email: 'rahul.verma@college.edu',
        phone: '9876543212',
        department: 'Information Technology',
        year: '3rd Year'
    },
    {
        id: 'STU-202104',
        name: 'Ananya Reddy',
        email: 'ananya.reddy@college.edu',
        phone: '9876543213',
        department: 'Computer Science & Engineering',
        year: '2nd Year'
    },
    {
        id: 'STU-202105',
        name: 'Vikram Malhotra',
        email: 'vikram.m@college.edu',
        phone: '9876543214',
        department: 'Electronics & Communication',
        year: '4th Year'
    },
    {
        id: 'STU-202106',
        name: 'Sneha Nair',
        email: 'sneha.nair@college.edu',
        phone: '9876543215',
        department: 'Computer Science & Engineering',
        year: '1st Year'
    },
    {
        id: 'STU-202107',
        name: 'Karthik Iyer',
        email: 'karthik.iyer@college.edu',
        phone: '9876543216',
        department: 'Data Science & AI',
        year: '3rd Year'
    },
    {
        id: 'STU-202108',
        name: 'Divya Rao',
        email: 'divya.rao@college.edu',
        phone: '9876543217',
        department: 'Computer Science & Engineering',
        year: '2nd Year'
    }
];

// Helper to get formatted date string (YYYY-MM-DD) with offset days
function getDateStringWithOffset(daysOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

// Initial Sample Transactions: Includes Active, Overdue, and Returned records
const INITIAL_TRANSACTIONS = [
    {
        id: 'TRX-9001',
        studentId: 'STU-202101',
        studentName: 'Aarav Sharma',
        bookId: 'BK-101',
        bookTitle: 'Introduction to Algorithms (CLRS)',
        issueDate: getDateStringWithOffset(-25),
        dueDate: getDateStringWithOffset(-11), // 11 days overdue!
        returnDate: null,
        status: 'Issued',
        fineAmount: 0,
        fineStatus: 'Unpaid',
        notes: 'Algorithm course semester project'
    },
    {
        id: 'TRX-9002',
        studentId: 'STU-202102',
        studentName: 'Priya Patel',
        bookId: 'BK-102',
        bookTitle: 'Database System Concepts',
        issueDate: getDateStringWithOffset(-5),
        dueDate: getDateStringWithOffset(9), // due in 9 days
        returnDate: null,
        status: 'Issued',
        fineAmount: 0,
        fineStatus: 'None',
        notes: 'DBMS lab reference'
    },
    {
        id: 'TRX-9003',
        studentId: 'STU-202103',
        studentName: 'Rahul Verma',
        bookId: 'BK-104',
        bookTitle: 'Computer Networks: A Top-Down Approach',
        issueDate: getDateStringWithOffset(-30),
        dueDate: getDateStringWithOffset(-16),
        returnDate: getDateStringWithOffset(-13), // returned 3 days late
        status: 'Returned',
        fineAmount: 15, // 3 * ₹5
        fineStatus: 'Paid',
        notes: 'Late return fine paid at counter'
    },
    {
        id: 'TRX-9004',
        studentId: 'STU-202104',
        studentName: 'Ananya Reddy',
        bookId: 'BK-106',
        bookTitle: 'Artificial Intelligence: A Modern Approach',
        issueDate: getDateStringWithOffset(-3),
        dueDate: getDateStringWithOffset(11), // Active
        returnDate: null,
        status: 'Issued',
        fineAmount: 0,
        fineStatus: 'None',
        notes: 'AI elective research'
    },
    {
        id: 'TRX-9005',
        studentId: 'STU-202105',
        studentName: 'Vikram Malhotra',
        bookId: 'BK-111',
        bookTitle: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
        issueDate: getDateStringWithOffset(-20),
        dueDate: getDateStringWithOffset(-6), // 6 days overdue!
        returnDate: null,
        status: 'Issued',
        fineAmount: 0,
        fineStatus: 'Unpaid',
        notes: 'Compiler construction assignment'
    },
    {
        id: 'TRX-9006',
        studentId: 'STU-202107',
        studentName: 'Karthik Iyer',
        bookId: 'BK-107',
        bookTitle: 'Java: The Complete Reference (Twelfth Edition)',
        issueDate: getDateStringWithOffset(-4),
        dueDate: getDateStringWithOffset(10), // Active
        returnDate: null,
        status: 'Issued',
        fineAmount: 0,
        fineStatus: 'None',
        notes: 'OOPs Java practice'
    },
    {
        id: 'TRX-9007',
        studentId: 'STU-202108',
        studentName: 'Divya Rao',
        bookId: 'BK-109',
        bookTitle: 'Computer Organization and Architecture',
        issueDate: getDateStringWithOffset(-18),
        dueDate: getDateStringWithOffset(-4), // 4 days overdue!
        returnDate: null,
        status: 'Issued',
        fineAmount: 0,
        fineStatus: 'Unpaid',
        notes: 'COA midterm preparation'
    }
];

class StorageService {
    constructor() {
        this.init();
    }

    // Initialize LocalStorage with default seeds if empty
    init() {
        try {
            if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
                this.save(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
            }
            if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
                this.save(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
            }
            if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
                this.save(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
            }
            if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                this.save(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
            }
        } catch (e) {
            console.error('LocalStorage initialization error:', e);
        }
    }

    // Generic Get and Save
    get(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
            return defaultValue;
        }
    }

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
            return false;
        }
    }

    // ==========================================
    // BOOKS CRUD
    // ==========================================
    getBooks() {
        return this.get(STORAGE_KEYS.BOOKS, []);
    }

    getBookById(id) {
        const books = this.getBooks();
        return books.find(b => b.id.toLowerCase() === id.toLowerCase()) || null;
    }

    saveBook(book) {
        const books = this.getBooks();
        // Check for duplicate ID
        const exists = books.some(b => b.id.toLowerCase() === book.id.toLowerCase());
        if (exists) {
            return { success: false, message: `Book ID "${book.id}" already exists!` };
        }
        // Quantity & Available calculation
        const qty = parseInt(book.quantity, 10) || 1;
        const available = book.availableCopies !== undefined ? parseInt(book.availableCopies, 10) : qty;

        const newBook = {
            ...book,
            quantity: qty,
            availableCopies: available
        };

        books.unshift(newBook);
        this.save(STORAGE_KEYS.BOOKS, books);
        return { success: true, message: 'Book added successfully!', book: newBook };
    }

    updateBook(book) {
        const books = this.getBooks();
        const index = books.findIndex(b => b.id.toLowerCase() === book.id.toLowerCase());
        if (index === -1) {
            return { success: false, message: `Book with ID "${book.id}" not found!` };
        }

        const oldBook = books[index];
        const qty = parseInt(book.quantity, 10);
        let available = parseInt(book.availableCopies, 10);

        // If quantity decreased below currently issued books, ensure logic holds
        const issuedCopies = oldBook.quantity - oldBook.availableCopies;
        if (qty < issuedCopies) {
            return { 
                success: false, 
                message: `Cannot decrease total quantity to ${qty}. There are currently ${issuedCopies} copies issued to students.` 
            };
        }

        // Adjust available copies if total quantity was modified
        if (book.availableCopies === undefined) {
            available = qty - issuedCopies;
        }

        books[index] = {
            ...oldBook,
            ...book,
            quantity: qty,
            availableCopies: Math.max(0, available)
        };

        this.save(STORAGE_KEYS.BOOKS, books);
        return { success: true, message: 'Book updated successfully!', book: books[index] };
    }

    deleteBook(id) {
        const books = this.getBooks();
        const book = books.find(b => b.id.toLowerCase() === id.toLowerCase());
        if (!book) {
            return { success: false, message: 'Book not found!' };
        }

        // Check if there are active transactions for this book
        const activeTransactions = this.getActiveTransactions().filter(t => t.bookId.toLowerCase() === id.toLowerCase());
        if (activeTransactions.length > 0) {
            return {
                success: false,
                message: `Cannot delete book! There are ${activeTransactions.length} active issue records for this book. Please return all copies first.`
            };
        }

        const filtered = books.filter(b => b.id.toLowerCase() !== id.toLowerCase());
        this.save(STORAGE_KEYS.BOOKS, filtered);
        return { success: true, message: 'Book deleted successfully!' };
    }

    getNextBookId() {
        const books = this.getBooks();
        const maxNum = books.reduce((max, b) => {
            const match = b.id.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : 0;
            return num > max ? num : max;
        }, 100);
        return `BK-${maxNum + 1}`;
    }

    // ==========================================
    // STUDENTS CRUD
    // ==========================================
    getStudents() {
        return this.get(STORAGE_KEYS.STUDENTS, []);
    }

    getStudentById(id) {
        const students = this.getStudents();
        return students.find(s => s.id.toLowerCase() === id.toLowerCase()) || null;
    }

    saveStudent(student) {
        const students = this.getStudents();
        const exists = students.some(s => s.id.toLowerCase() === student.id.toLowerCase());
        if (exists) {
            return { success: false, message: `Student ID "${student.id}" already exists!` };
        }

        const newStudent = { ...student };
        students.unshift(newStudent);
        this.save(STORAGE_KEYS.STUDENTS, students);
        return { success: true, message: 'Student registered successfully!', student: newStudent };
    }

    updateStudent(student) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id.toLowerCase() === student.id.toLowerCase());
        if (index === -1) {
            return { success: false, message: `Student with ID "${student.id}" not found!` };
        }

        students[index] = { ...students[index], ...student };
        this.save(STORAGE_KEYS.STUDENTS, students);
        return { success: true, message: 'Student updated successfully!', student: students[index] };
    }

    deleteStudent(id) {
        const students = this.getStudents();
        const student = students.find(s => s.id.toLowerCase() === id.toLowerCase());
        if (!student) {
            return { success: false, message: 'Student not found!' };
        }

        // Check if student has active unreturned books
        const activeTransactions = this.getActiveTransactions().filter(t => t.studentId.toLowerCase() === id.toLowerCase());
        if (activeTransactions.length > 0) {
            return {
                success: false,
                message: `Cannot delete student! Student has ${activeTransactions.length} unreturned book(s). Please return them before deleting.`
            };
        }

        const filtered = students.filter(s => s.id.toLowerCase() !== id.toLowerCase());
        this.save(STORAGE_KEYS.STUDENTS, filtered);
        return { success: true, message: 'Student record deleted successfully!' };
    }

    getNextStudentId() {
        const students = this.getStudents();
        const maxNum = students.reduce((max, s) => {
            const match = s.id.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : 0;
            return num > max ? num : max;
        }, 202100);
        return `STU-${maxNum + 1}`;
    }

    getStudentIssuedCount(studentId) {
        const transactions = this.getActiveTransactions();
        return transactions.filter(t => t.studentId.toLowerCase() === studentId.toLowerCase()).length;
    }

    // ==========================================
    // TRANSACTIONS & ISSUE / RETURN
    // ==========================================
    getTransactions() {
        return this.get(STORAGE_KEYS.TRANSACTIONS, []);
    }

    getActiveTransactions() {
        return this.getTransactions().filter(t => t.status === 'Issued');
    }

    getTransactionById(id) {
        const transactions = this.getTransactions();
        return transactions.find(t => t.id.toLowerCase() === id.toLowerCase()) || null;
    }

    getNextTransactionId() {
        const transactions = this.getTransactions();
        const maxNum = transactions.reduce((max, t) => {
            const match = t.id.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : 0;
            return num > max ? num : max;
        }, 9000);
        return `TRX-${maxNum + 1}`;
    }

    issueBook({ studentId, bookId, issueDate, dueDate, notes }) {
        const student = this.getStudentById(studentId);
        if (!student) {
            return { success: false, message: 'Selected student does not exist!' };
        }

        const book = this.getBookById(bookId);
        if (!book) {
            return { success: false, message: 'Selected book does not exist!' };
        }

        // Check if book has available copies
        if (book.availableCopies <= 0) {
            return { 
                success: false, 
                message: `"${book.title}" is currently OUT OF STOCK. No available copies left to issue.` 
            };
        }

        // Check student borrowing limit
        const settings = this.getSettings();
        const activeCount = this.getStudentIssuedCount(studentId);
        if (activeCount >= settings.maxBooksPerStudent) {
            return {
                success: false,
                message: `Borrowing limit reached! Student already has ${activeCount} books issued (Maximum allowed: ${settings.maxBooksPerStudent}).`
            };
        }

        // Check if student already has an active copy of this exact book
        const hasSameBook = this.getActiveTransactions().some(
            t => t.studentId.toLowerCase() === studentId.toLowerCase() && t.bookId.toLowerCase() === bookId.toLowerCase()
        );
        if (hasSameBook) {
            return {
                success: false,
                message: `Student "${student.name}" already has an active borrowed copy of "${book.title}".`
            };
        }

        // Decrement book availableCopies
        book.availableCopies -= 1;
        this.updateBook(book);

        // Create new transaction
        const newTx = {
            id: this.getNextTransactionId(),
            studentId: student.id,
            studentName: student.name,
            bookId: book.id,
            bookTitle: book.title,
            issueDate: issueDate || getDateStringWithOffset(0),
            dueDate: dueDate || getDateStringWithOffset(settings.loanDurationDays),
            returnDate: null,
            status: 'Issued',
            fineAmount: 0,
            fineStatus: 'None',
            notes: notes || 'Issued via Admin Portal'
        };

        const transactions = this.getTransactions();
        transactions.unshift(newTx);
        this.save(STORAGE_KEYS.TRANSACTIONS, transactions);

        return {
            success: true,
            message: `Book "${book.title}" successfully issued to ${student.name}!`,
            transaction: newTx
        };
    }

    returnBook({ transactionId, returnDate, fineCollected, remarks }) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(t => t.id.toLowerCase() === transactionId.toLowerCase());

        if (index === -1) {
            return { success: false, message: 'Transaction record not found!' };
        }

        const tx = transactions[index];
        if (tx.status === 'Returned') {
            return { success: false, message: 'This book has already been returned!' };
        }

        const actualReturnDate = returnDate || getDateStringWithOffset(0);
        const settings = this.getSettings();
        const fineCalculation = this.calculateFine(tx.dueDate, actualReturnDate, settings.fineRatePerDay);

        // Increase available copies of book
        const book = this.getBookById(tx.bookId);
        if (book) {
            book.availableCopies = Math.min(book.quantity, book.availableCopies + 1);
            this.updateBook(book);
        }

        // Update transaction
        tx.returnDate = actualReturnDate;
        tx.status = 'Returned';
        tx.fineAmount = fineCollected !== undefined ? parseFloat(fineCollected) : fineCalculation.fineAmount;
        tx.fineStatus = tx.fineAmount > 0 ? 'Paid' : 'None';
        if (remarks) {
            tx.notes = (tx.notes ? tx.notes + ' | ' : '') + `Return Note: ${remarks}`;
        }

        transactions[index] = tx;
        this.save(STORAGE_KEYS.TRANSACTIONS, transactions);

        return {
            success: true,
            message: `Book "${tx.bookTitle}" returned successfully! Fine collected: ₹${tx.fineAmount}`,
            transaction: tx
        };
    }

    // ==========================================
    // FINE CALCULATION (₹5 per day after due date)
    // ==========================================
    calculateFine(dueDateStr, returnDateStr = null, customRate = null) {
        const settings = this.getSettings();
        const rate = customRate !== null ? customRate : settings.fineRatePerDay;

        const due = new Date(dueDateStr + 'T00:00:00');
        const ret = returnDateStr ? new Date(returnDateStr + 'T00:00:00') : new Date();
        ret.setHours(0, 0, 0, 0);

        const diffTime = ret.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            const fine = diffDays * rate;
            return {
                isOverdue: true,
                overdueDays: diffDays,
                ratePerDay: rate,
                fineAmount: fine
            };
        }

        return {
            isOverdue: false,
            overdueDays: 0,
            ratePerDay: rate,
            fineAmount: 0
        };
    }

    // ==========================================
    // DASHBOARD & STATS SUMMARY
    // ==========================================
    getDashboardStats() {
        const books = this.getBooks();
        const students = this.getStudents();
        const transactions = this.getTransactions();
        const activeTxs = transactions.filter(t => t.status === 'Issued');

        const totalBooks = books.reduce((sum, b) => sum + (parseInt(b.quantity, 10) || 0), 0);
        const availableBooks = books.reduce((sum, b) => sum + (parseInt(b.availableCopies, 10) || 0), 0);
        const issuedBooks = totalBooks - availableBooks;
        const totalStudents = students.length;

        // Check overdue transactions
        let overdueCount = 0;
        let totalFinesPending = 0;
        let totalFinesCollected = 0;

        activeTxs.forEach(t => {
            const fineInfo = this.calculateFine(t.dueDate);
            if (fineInfo.isOverdue) {
                overdueCount++;
                totalFinesPending += fineInfo.fineAmount;
            }
        });

        transactions.forEach(t => {
            if (t.status === 'Returned' && t.fineAmount > 0) {
                totalFinesCollected += Number(t.fineAmount);
            }
        });

        return {
            totalBooks,
            availableBooks,
            issuedBooks: Math.max(0, issuedBooks),
            totalStudents,
            overdueCount,
            totalFinesPending,
            totalFinesCollected,
            uniqueTitles: books.length
        };
    }

    // ==========================================
    // SETTINGS & SYSTEM UTILITIES
    // ==========================================
    getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    saveSettings(newSettings) {
        const merged = { ...this.getSettings(), ...newSettings };
        this.save(STORAGE_KEYS.SETTINGS, merged);
        return merged;
    }

    resetAllData() {
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return true;
    }

    exportDataJSON() {
        const data = {
            libraryManagementSystem: 'B.Tech CSE Project Data Backup',
            exportedAt: new Date().toISOString(),
            settings: this.getSettings(),
            books: this.getBooks(),
            students: this.getStudents(),
            transactions: this.getTransactions()
        };
        return JSON.stringify(data, null, 2);
    }

    importDataJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.books || !data.students || !data.transactions) {
                return { success: false, message: 'Invalid backup file structure!' };
            }
            this.save(STORAGE_KEYS.BOOKS, data.books);
            this.save(STORAGE_KEYS.STUDENTS, data.students);
            this.save(STORAGE_KEYS.TRANSACTIONS, data.transactions);
            if (data.settings) {
                this.save(STORAGE_KEYS.SETTINGS, data.settings);
            }
            return { success: true, message: 'System database restored successfully!' };
        } catch (e) {
            return { success: false, message: 'Failed to parse JSON file: ' + e.message };
        }
    }
}

// Global Storage instance
window.LMSStorage = new StorageService();
