# Library Management System

**A Complete, Modern, and Responsive Library Management Web Application for B.Tech CSE Mini Project.**

Developed using **pure HTML5, CSS3, and Vanilla JavaScript (ES6+)** with complete client-side persistence via the **HTML5 LocalStorage API**. Zero external frontend frameworks (No React, Angular, or Vue) — built strictly adhering to university academic and mini project guidelines.

---

## 📌 Project Overview

The **Digital Library Management System** is designed for college and university libraries (specifically tailored for Computer Science and Engineering departments). It streamlines catalog administration, student records, book borrowing, returns, automated late-fee calculations, and reporting through a clean, intuitive, and modern user interface.

### Demo Credentials
- **Username:** `admin`
- **Password:** `admin123`
*(A 1-click **Auto Fill** button is provided on the login page for instant testing and demonstration)*

---

## 🚀 Key Features

### 1. Public Portal (`index.html`)
- **Live Search & Filter:** Students can browse department textbooks and check real-time availability without logging in.
- **Department Statistics:** Real-time counters showing total catalog titles, available shelf copies, registered students, and borrowing policies.
- **Academic Guidelines:** 14-day standard borrowing period, 3-book limit per student, and ₹5/day late return fine policy.

### 2. Administrator Authentication (`login.html`)
- Dedicated secure login screen with animated gradient aesthetics.
- **Password Show/Hide:** Interactive eye toggle icon for password visibility.
- **Demo Auto-fill:** Instant credential loading for professors and evaluators.
- **Session Persistence:** Remembers logged-in status via `sessionStorage` or `localStorage`.
- **Route Guard:** Unauthorized visitors attempting to access `dashboard.html` are automatically redirected to `login.html`.

### 3. Interactive Operations Dashboard (`dashboard.html#dashboard`)
- **Real-Time Statistic Cards:**
  - **Total Books:** Complete catalog volume.
  - **Available Books:** Number of physical copies currently on library shelves with percentage bar.
  - **Issued Books:** Number of copies currently checked out by students.
  - **Total Students:** Count of registered engineering students.
  - **Overdue Books Alert & Total Fines Collected counter.**
- **Quick Action Buttons:** Fast navigation to Issue Book, Add Book, Add Student, or View Reports.
- **Recent Transactions Feed:** Live snapshot of the latest 5 circulation activities.
- **Category Distribution Widget:** Visual percentage breakdown of computer science disciplines.
- **Recently Added Books:** Quick status of newest textbook additions.

### 4. Book Inventory Management (`#books`)
- **Full CRUD Support:**
  - **Add Book:** Auto-generates unique Book ID (`BK-101`, `BK-102`), validates ISBN, category, publisher, and quantity.
  - **Edit Book:** Modify titles, authors, category, and total stock.
  - **Delete Book:** Confirmation dialog with protection against deleting books currently checked out.
  - **View Details:** Inspect ISBN, shelf availability, total copies, and the exact names/roll numbers of students currently holding copies.
- **Multi-Filter System:** Real-time search by Title, Author, ISBN, or Book ID + Category filter + In-Stock/Out-of-Stock filter.
- **Stock Tracking:** Automatic decrements when issued; increments when returned.

### 5. Student Registry Management (`#students`)
- **Full CRUD Support:**
  - **Register Student:** ID format validation (`STU-202101`), email format validation, phone, department, and academic year.
  - **Edit Student:** Update contact details and year.
  - **Delete Student:** Confirmation dialog with protection against deleting students with outstanding unreturned books.
  - **Borrowing History Modal:** 1-click view of all past and active loans for any individual student.
- **Department & Year Filters:** Filter by branch (CSE, IT, ECE, EEE, MECH, etc.) and Year (1st to 4th Year).

### 6. Book Issuance Workflow (`#issue`)
- **Interactive Student & Book Selectors:** Searchable dropdowns with real-time eligibility tags.
- **Live Preview Cards:** Displays selected student's active quota (`0/3 allowed`) and selected book's shelf stock before issuing.
- **Business Rule Validations:**
  - Prevents issuing books with `0` available copies (Out of stock).
  - Prevents issuing more than 3 books per student.
  - Prevents issuing duplicate copies of the same book to the same student.
  - Automatically calculates standard 14-day due date from chosen issue date.

### 7. Book Return & Fine Calculation (`#return`)
- **Live Circulation Ledger:** Displays all active borrowed books with overdue badges and days remaining.
- **Automated Late Return Fine (₹5 per day):**
  $$\text{Fine} = (\text{Return Date} - \text{Due Date}) \times ₹5/\text{day}$$
- **Settlement Dialog:** Shows days overdue, total calculated penalty, fine collected counter, and condition remarks.
- **Automatic Restock:** Increases available book copies on return and marks transaction as `Returned`.

### 8. Reports & Academic Documentation (`#reports`)
- **5 Configurable Reports:**
  1. Complete Books Inventory Report
  2. Available Books on Shelf Report
  3. Active Issued Books Report
  4. Overdue Books & Penalty Report (₹5/day)
  5. Student Borrowing Activity Summary
- **Print Functionality:** Formatted `@media print` layout with college header, date, and tables suitable for physical submission.
- **CSV Data Export:** 1-click download of report datasets in standard CSV format.

### 9. System Settings & Backup (`#settings`)
- Custom library & college branding name.
- Configurable fine rate per day (defaults to ₹5).
- Configurable loan period in days (defaults to 14).
- Configurable max books per student (defaults to 3).
- **JSON Backup & Restore:** Export complete library database to JSON or restore from file.
- **Factory Reset:** 1-click reset to pristine B.Tech CSE showcase dataset.

### 10. Additional UI/UX Features
- **Dark Mode / Light Mode:** Smooth theme transition with preference stored in LocalStorage.
- **Global Search Bar:** Header search with real-time dropdown finding books and students.
- **Mobile Responsive Drawer:** Off-canvas slide-out navigation for mobile and tablet screens.
- **Custom Toasts & Confirmations:** Non-blocking notifications for all CRUD operations.

---

## 📂 Project Directory Structure

```
Library-Management-System/
│
├── index.html            # Public digital library portal & book catalog
├── login.html            # Admin authentication page with demo auto-fill
├── dashboard.html        # Comprehensive administrative dashboard SPA
│
├── css/
│   ├── style.css         # Main application design, variables, dark mode & layout
│   ├── login.css         # Login card styling, animations & responsive layout
│   └── responsive.css    # Responsive breakpoints for tablets and smartphones
│
├── js/
│   ├── storage.js        # LocalStorage persistence, seed data & CRUD services
│   ├── auth.js           # Authentication, session manager & route guards
│   ├── books.js          # Book management module (CRUD, filters & modals)
│   ├── students.js       # Student registry module (CRUD, filters & history)
│   ├── issue.js          # Book issuance module & business rule validations
│   ├── return.js         # Book return module & ₹5/day fine calculator
│   └── dashboard.js      # App controller, SPA routing, reports, stats & settings
│
└── README.md             # Project documentation and viva preparation guide
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Structure** | HTML5 | Semantic tags (`<aside>`, `<header>`, `<main>`, `<section>`) |
| **Styling** | CSS3 | Flexbox, CSS Grid, Custom Properties (Variables), `@media print` |
| **Logic** | Vanilla JavaScript | ES6+ Classes, Objects, Array Methods, DOM Manipulation |
| **Data Storage** | HTML5 Web Storage | `localStorage` & `sessionStorage` for persistence across page refreshes |
| **Icons** | Font Awesome 6.5.1 | High-definition vector icons via CDN |
| **Typography** | Google Fonts | Plus Jakarta Sans & JetBrains Mono |

---

## 💻 How to Run the Project

1. **Option A: Direct Browser Execution (No server required)**
   - Simply double-click `index.html` or `login.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).
   
2. **Option B: VS Code Live Server (Recommended)**
   - Open the project folder in **Visual Studio Code**.
   - Right-click `index.html` or `login.html`.
   - Click **"Open with Live Server"**.

3. **Log in to Admin Dashboard:**
   - Go to `login.html`.
   - Click **"Auto Fill"** (or type `admin` / `admin123`).
   - Click **"Log In to Dashboard"**.

---

## 🎓 Viva Questions & Answers (Mini Project Defense)

**Q1: How is data persisted without a backend database like MySQL or MongoDB?**  
> *Answer:* The project uses the browser's native **HTML5 LocalStorage API**. All books, students, transactions, and settings are serialized as JSON strings and saved under dedicated keys (`lms_books_data`, `lms_students_data`, `lms_transactions_data`). When the application loads, `js/storage.js` checks if data exists; if empty, it automatically seeds standard realistic textbook and student records.

**Q2: How does the ₹5/day late fine calculation work?**  
> *Answer:* When processing a book return, the JavaScript engine parses the `dueDate` and `returnDate` into Date timestamps:  
> `differenceInDays = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24))`  
> If `differenceInDays > 0`, the system computes `fine = differenceInDays * fineRatePerDay` (defaulting to ₹5). If returned on or before the due date, fine is ₹0.

**Q3: How are duplicate IDs and out-of-stock issues prevented?**  
> *Answer:* `js/storage.js` performs validation checks before committing any change:  
> 1. Prevents duplicate Book IDs (`BK-101`) or Student IDs (`STU-202101`).  
> 2. Before issuing, it verifies `availableCopies > 0`. If `0`, issuance is blocked with an "Out of Stock" notification.  
> 3. It checks active student borrowings to enforce the 3-book limit.  
> 4. When deleting, it ensures no active transactions are linked to that book or student.

**Q4: How does Single Page Application (SPA) navigation work in `dashboard.html`?**  
> *Answer:* Navigation uses URL hash routing (`window.location.hash`). When a sidebar link like `#books` or `#students` is clicked, `DashboardModule.switchView()` listens to `hashchange`, hides other view sections, displays the requested section with a smooth CSS transition, updates the breadcrumb title, and triggers the corresponding render function.

---

## 📄 License & Academic Attribution
Developed as an open-source academic demonstration project for **B.Tech Computer Science & Engineering (CSE)**. Free to use, adapt, and build upon for academic presentations.
