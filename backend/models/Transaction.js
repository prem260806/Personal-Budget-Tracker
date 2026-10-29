const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type must be either income or expense'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Other'],
      default: 'UPI',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
