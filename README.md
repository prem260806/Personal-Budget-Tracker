# SpendWise - Personal Budget & Expense Tracker App (MERN Stack)

A full-stack web application designed for comprehensive personal financial management, expense tracking, category budgeting, savings goal planning, visual analytics, and secure OTP-based password recovery.

---

## 🌟 Key Features

1. **User Authentication & OTP Password Recovery:**
   * JWT-based secure authentication with bcrypt password hashing.
   * **Forgot Password via OTP**: Enter registered email / phone number, receive a 6-digit verification code with 10-minute validity, and securely reset password.
   * Multi-currency support (₹ INR, $ USD, € EUR, £ GBP, etc.).

2. **Income & Expense Management:**
   * Complete CRUD operations (Add, Edit, Delete, View).
   * Categorization (Food, Rent, Salary, Freelance, Utilities, Shopping, etc.).
   * Payment method tracking (UPI, Cash, Credit Card, Debit Card, Net Banking).
   * Search by keyword, filter by date range, category, and payment method.
   * **Export to CSV**: Download transaction reports anytime.

3. **Smart Category Budgets & Alerts:**
   * Set monthly spending caps per category.
   * Real-time progress bars with color-coded alert badges (`Normal <80%`, `Warning 80-100%`, `Exceeded >100%`).

4. **Savings Goals & Milestone Tracker:**
   * Set future targets (e.g. Emergency Fund, New Laptop, Vacation).
   * Add contribution deposits towards goals.
   * **Celebration Confetti Effect** automatically triggers when a goal hits 100%!

5. **Visual Financial Analytics:**
   * Monthly Income vs. Expense cash flow trend charts (Recharts).
   * Category expense breakdown donut charts.
   * Payment method distribution.
   * Personalized Financial Health Score (0-100).

6. **College Demo Data Generator:**
   * 1-Click "Generate Demo Data" button to instantly populate realistic sample data for smooth college viva demonstrations.

---

## 🏗️ Technical Architecture

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, Canvas-Confetti
* **Backend:** Node.js, Express.js (REST API Architecture)
* **Database:** MongoDB + Mongoose ODM
* **Security & Auth:** JSON Web Tokens (JWT), Bcrypt.js, Nodemailer OTP service

---

## 🚀 How to Run the Project

### Option 1: Double-Click Launcher (Windows)
Double click `run-project.bat` in the root folder. It will open two terminal windows running Backend and Frontend.

### Option 2: Manual Terminal Startup

#### 1. Start Backend:
```bash
cd backend
npm install
npm start
```
> Backend runs at `http://localhost:5000`

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create user account
* `POST /api/auth/login` - User login & JWT issuance
* `GET /api/auth/me` - Get current user profile
* `PUT /api/auth/profile` - Update profile & currency
* `POST /api/auth/forgot-password-otp` - Request 6-digit OTP for password recovery
* `POST /api/auth/verify-otp` - Verify OTP code
* `POST /api/auth/reset-password` - Set new password with verified OTP

### Transactions (`/api/transactions`)
* `GET /api/transactions` - List transactions (with filters, pagination, search)
* `POST /api/transactions` - Create transaction
* `GET /api/transactions/summary` - Aggregate totals & monthly trends
* `GET /api/transactions/export/csv` - Export transactions as CSV file
* `PUT /api/transactions/:id` - Update transaction
* `DELETE /api/transactions/:id` - Delete transaction

### Budgets & Goals (`/api/budgets`, `/api/goals`)
* `GET /api/budgets` - Get category budgets with spent amounts
* `POST /api/budgets` - Create or update budget limit
* `GET /api/goals` - Get savings goals & percentage
* `POST /api/goals` - Create savings target
* `PATCH /api/goals/:id/deposit` - Add contribution towards a goal

### Analytics & Demo Data (`/api/analytics`, `/api/seed`)
* `GET /api/analytics` - Financial health score and charts dataset
* `POST /api/seed` - Generate sample demo transactions & budgets

---

## 🎓 College Viva & Review Preparation

### Common Viva Questions & Answers:

1. **Q: Why MERN stack for this project?**
   * *A:* MERN uses JavaScript throughout the stack (React on frontend, Node/Express on backend, JSON-like BSON documents in MongoDB). This provides unified schema validation, non-blocking asynchronous I/O, and reactive state management.

2. **Q: How does the OTP Password Recovery work securely?**
   * *A:* When a user requests a reset, the backend generates a random 6-digit numeric token with a 10-minute expiry and stores it in the `Otp` collection with a TTL index. Once verified, the password is reset using bcrypt hashing (salt rounds = 10), and the OTP is cleared.

3. **Q: How are budget warning percentages calculated?**
   * *A:* When querying budgets for a specific month/year, the backend aggregates all expense transactions for that category in that month range and computes `(spent / limitAmount) * 100`. If $\ge 80\%$, it marks it as `warning`; if $\ge 100\%$, it marks it as `exceeded`.
