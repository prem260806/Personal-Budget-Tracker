const Transaction = require('../models/Transaction');

// @desc    Get all transactions with filtering, search & pagination
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: req.user.id };

    // Filter by type (income/expense)
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    // Search in title and notes
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transactions',
    });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transaction',
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, notes } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category',
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      type,
      category,
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating transaction',
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { title, amount, type, category, paymentMethod, date, notes } = req.body;

    if (title) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (date) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating transaction',
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting transaction',
    });
  }
};

// @desc    Get transaction financial summary & KPIs
// @route   GET /api/transactions/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const monthlyData = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
      }

      // Group by YYYY-MM for trend charts
      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, month: monthKey };
      }
      if (tx.type === 'income') {
        monthlyData[monthKey].income += amt;
      } else {
        monthlyData[monthKey].expense += amt;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate: Number(savingsRate),
        transactionCount: transactions.length,
        categoryTotals,
        monthlyTrends: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error computing summary',
    });
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/transactions/export/csv
// @access  Private
exports.exportCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    let csvContent = 'Date,Title,Type,Category,Amount,Payment Method,Notes\n';

    transactions.forEach((tx) => {
      const dateStr = new Date(tx.date).toISOString().split('T')[0];
      const title = `"${(tx.title || '').replace(/"/g, '""')}"`;
      const type = tx.type;
      const category = `"${(tx.category || '').replace(/"/g, '""')}"`;
      const amount = tx.amount;
      const payment = `"${(tx.paymentMethod || '').replace(/"/g, '""')}"`;
      const notes = `"${(tx.notes || '').replace(/"/g, '""')}"`;

      csvContent += `${dateStr},${title},${type},${category},${amount},${payment},${notes}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=budget_tracker_transactions.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error exporting CSV',
    });
  }
};
