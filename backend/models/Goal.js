const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please specify target amount'],
      min: [1, 'Target amount must be at least 1'],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: 'General Savings',
    },
    targetDate: {
      type: Date,
      required: [true, 'Please set a target date'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);
