const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for a given month & year with spent amounts
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const currentDate = new Date();
    const month = req.query.month ? Number(req.query.month) : currentDate.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    });

    // Calculate actual spending in this month for each category
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseTransactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categorySpent = {};
    expenseTransactions.forEach((tx) => {
      categorySpent[tx.category] = (categorySpent[tx.category] || 0) + tx.amount;
    });

    const enrichedBudgets = budgets.map((b) => {
      const spent = categorySpent[b.category] || 0;
      const remaining = Math.max(0, b.limitAmount - spent);
      const percentage = Number(((spent / b.limitAmount) * 100).toFixed(1));
      let status = 'normal';
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        _id: b._id,
        category: b.category,
        limitAmount: b.limitAmount,
        spent,
        remaining,
        percentage,
        status,
        month: b.month,
        year: b.year,
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      budgets: enrichedBudgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching budgets',
    });
  }
};

// @desc    Create or update budget limit for a category
// @route   POST /api/budgets
// @access  Private
exports.upsertBudget = async (req, res) => {
  try {
    const { category, limitAmount, month, year } = req.body;

    if (!category || !limitAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and limit amount',
      });
    }

    const currentDate = new Date();
    const budgetMonth = month ? Number(month) : currentDate.getMonth() + 1;
    const budgetYear = year ? Number(year) : currentDate.getFullYear();

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        category,
        month: budgetMonth,
        year: budgetYear,
      },
      {
        limitAmount: Number(limitAmount),
      },
      {
        new: true,
        upsert: true, // create if not exists
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving budget',
    });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting budget',
    });
  }
};
