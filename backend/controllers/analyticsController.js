const Transaction = require('../models/Transaction');

// @desc    Get detailed analytics and breakdown
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: 1 });

    const categoryExpense = {};
    const categoryIncome = {};
    const paymentMethods = {};
    const monthlySummary = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      const d = new Date(tx.date);
      const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthlySummary[monthYear]) {
        monthlySummary[monthYear] = { month: monthYear, income: 0, expense: 0, net: 0 };
      }

      if (tx.type === 'income') {
        totalIncome += amt;
        categoryIncome[tx.category] = (categoryIncome[tx.category] || 0) + amt;
        monthlySummary[monthYear].income += amt;
      } else {
        totalExpense += amt;
        categoryExpense[tx.category] = (categoryExpense[tx.category] || 0) + amt;
        monthlySummary[monthYear].expense += amt;
      }

      // Payment method tracking
      paymentMethods[tx.paymentMethod] = (paymentMethods[tx.paymentMethod] || 0) + amt;
      monthlySummary[monthYear].net = monthlySummary[monthYear].income - monthlySummary[monthYear].expense;
    });

    // Format category data for Pie & Donut Charts
    const expenseByCategory = Object.entries(categoryExpense).map(([name, value]) => ({
      name,
      value,
      percentage: totalExpense > 0 ? Number(((value / totalExpense) * 100).toFixed(1)) : 0,
    }));

    const incomeByCategory = Object.entries(categoryIncome).map(([name, value]) => ({
      name,
      value,
      percentage: totalIncome > 0 ? Number(((value / totalIncome) * 100).toFixed(1)) : 0,
    }));

    const spendingByPayment = Object.entries(paymentMethods).map(([name, value]) => ({
      name,
      value,
    }));

    // Financial Health Score (0 - 100)
    let healthScore = 50;
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
    if (savingsRatio >= 0.3) healthScore = 95;
    else if (savingsRatio >= 0.2) healthScore = 85;
    else if (savingsRatio >= 0.1) healthScore = 70;
    else if (savingsRatio >= 0) healthScore = 55;
    else healthScore = 30;

    res.status(200).json({
      success: true,
      analytics: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        healthScore,
        expenseByCategory,
        incomeByCategory,
        spendingByPayment,
        monthlyTrends: Object.values(monthlySummary),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating analytics',
    });
  }
};
