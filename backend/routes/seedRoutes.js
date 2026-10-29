const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Seed sample realistic data for the logged-in user
// @route   POST /api/seed
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Clear existing data for a clean seed or keep
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });

    // 2. Sample Transactions over the past 3 months
    const sampleTransactions = [
      // Income
      {
        user: userId,
        title: 'Monthly Salary (Software Engineer)',
        amount: 65000,
        type: 'income',
        category: 'Salary',
        paymentMethod: 'Net Banking',
        date: new Date(currentYear, currentMonth - 1, 1),
        notes: 'Monthly tech salary credit',
      },
      {
        user: userId,
        title: 'Freelance Web Design Project',
        amount: 15000,
        type: 'income',
        category: 'Freelance',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 5),
        notes: 'Client landing page design',
      },
      {
        user: userId,
        title: 'Mutual Fund Dividend & Returns',
        amount: 4200,
        type: 'income',
        category: 'Investments',
        paymentMethod: 'Net Banking',
        date: new Date(currentYear, currentMonth - 1, 12),
        notes: 'Quarterly dividend payout',
      },

      // Expenses - Current Month
      {
        user: userId,
        title: 'Apartment Rent',
        amount: 14000,
        type: 'expense',
        category: 'Rent & Housing',
        paymentMethod: 'Net Banking',
        date: new Date(currentYear, currentMonth - 1, 2),
        notes: 'Monthly room rent paid',
      },
      {
        user: userId,
        title: 'Supermarket Grocery & Veggies',
        amount: 4250,
        type: 'expense',
        category: 'Food & Dining',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 4),
        notes: 'Weekly organic groceries',
      },
      {
        user: userId,
        title: 'High-Speed Fiber Internet & Electricity',
        amount: 2100,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 6),
        notes: 'Utility bill payments',
      },
      {
        user: userId,
        title: 'Dinner at Barbeque Nation with Friends',
        amount: 3200,
        type: 'expense',
        category: 'Food & Dining',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth - 1, 9),
        notes: 'Weekend team dinner',
      },
      {
        user: userId,
        title: 'Nike Running Shoes',
        amount: 4800,
        type: 'expense',
        category: 'Shopping',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth - 1, 11),
        notes: 'Sports gear upgrade',
      },
      {
        user: userId,
        title: 'Fuel / Petrol Refill & Uber rides',
        amount: 2400,
        type: 'expense',
        category: 'Travel',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 14),
        notes: 'City commute expenses',
      },
      {
        user: userId,
        title: 'Netflix & Spotify Premium Subscription',
        amount: 950,
        type: 'expense',
        category: 'Entertainment',
        paymentMethod: 'Debit Card',
        date: new Date(currentYear, currentMonth - 1, 16),
        notes: 'Monthly digital entertainment',
      },
      {
        user: userId,
        title: 'Full Body Health Checkup & Vitamins',
        amount: 1850,
        type: 'expense',
        category: 'Health',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 19),
        notes: 'Annual health routine',
      },
      {
        user: userId,
        title: 'Udemy Full Stack Mastery Course',
        amount: 699,
        type: 'expense',
        category: 'Education',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 21),
        notes: 'Skill development and certification',
      },
    ];

    await Transaction.insertMany(sampleTransactions);

    // 3. Sample Category Budgets
    const sampleBudgets = [
      { user: userId, category: 'Food & Dining', limitAmount: 9000, month: currentMonth, year: currentYear },
      { user: userId, category: 'Rent & Housing', limitAmount: 15000, month: currentMonth, year: currentYear },
      { user: userId, category: 'Shopping', limitAmount: 6000, month: currentMonth, year: currentYear },
      { user: userId, category: 'Entertainment', limitAmount: 3000, month: currentMonth, year: currentYear },
      { user: userId, category: 'Travel', limitAmount: 4000, month: currentMonth, year: currentYear },
      { user: userId, category: 'Utilities', limitAmount: 3500, month: currentMonth, year: currentYear },
    ];

    await Budget.insertMany(sampleBudgets);

    // 4. Sample Savings Goals
    const sampleGoals = [
      {
        user: userId,
        title: 'Emergency Safety Fund',
        targetAmount: 100000,
        savedAmount: 65000,
        category: 'Emergency',
        targetDate: new Date(currentYear, currentMonth + 5, 30),
        isCompleted: false,
      },
      {
        user: userId,
        title: 'MacBook Pro M3 Pro',
        targetAmount: 180000,
        savedAmount: 120000,
        category: 'Electronics',
        targetDate: new Date(currentYear, currentMonth + 3, 15),
        isCompleted: false,
      },
      {
        user: userId,
        title: 'Goa Weekend Trip with College Friends',
        targetAmount: 25000,
        savedAmount: 25000,
        category: 'Travel',
        targetDate: new Date(currentYear, currentMonth, 10),
        isCompleted: true,
      },
    ];

    await Goal.insertMany(sampleGoals);

    res.status(201).json({
      success: true,
      message: 'Demo sample data generated successfully! 🚀',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding sample data',
    });
  }
});

module.exports = router;
