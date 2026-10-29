const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['PASSWORD_RESET', 'ACCOUNT_VERIFY'],
      default: 'PASSWORD_RESET',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '15m' }, // Automatically deleted after 15 mins by MongoDB
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Otp', otpSchema);
