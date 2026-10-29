const Goal = require('../models/Goal');

// @desc    Get all savings goals
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });

    const enrichedGoals = goals.map((g) => {
      const progress = Math.min(100, Number(((g.savedAmount / g.targetAmount) * 100).toFixed(1)));
      const remaining = Math.max(0, g.targetAmount - g.savedAmount);
      return {
        ...g.toObject(),
        progress,
        remaining,
      };
    });

    res.status(200).json({
      success: true,
      goals: enrichedGoals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching goals',
    });
  }
};

// @desc    Create savings goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, category, targetDate } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, target amount, and target date',
      });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount) || 0,
      category: category || 'General Savings',
      targetDate: new Date(targetDate),
      isCompleted: Number(savedAmount) >= Number(targetAmount),
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating goal',
    });
  }
};

// @desc    Add deposit towards goal
// @route   PATCH /api/goals/:id/deposit
// @access  Private
exports.addDeposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid deposit amount',
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.savedAmount += Number(amount);
    if (goal.savedAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: `Successfully contributed ${amount} towards "${goal.title}"`,
      goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error contributing to goal',
    });
  }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { title, targetAmount, savedAmount, category, targetDate, isCompleted } = req.body;

    if (title) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (savedAmount !== undefined) goal.savedAmount = Number(savedAmount);
    if (category) goal.category = category;
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (isCompleted !== undefined) goal.isCompleted = isCompleted;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating goal',
    });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Goal removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting goal',
    });
  }
};
