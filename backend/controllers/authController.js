const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateOTP, sendOtpEmail } = require('../utils/emailService');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_fsdpro_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, currency, monthlyIncome } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      currency: currency || 'INR',
      monthlyIncome: monthlyIncome || 0,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user details',
    });
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, currency, monthlyIncome } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (currency) user.currency = currency;
    if (monthlyIncome !== undefined) user.monthlyIncome = Number(monthlyIncome);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
};

// @desc    Send OTP for Password Reset
// @route   POST /api/auth/forgot-password-otp
// @access  Public
exports.forgotPasswordOtp = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be email or phone

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registered email or phone number',
      });
    }

    // Check if user exists by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email or phone number',
      });
    }

    // Invalidate previous unexpired OTPs for this user email
    await Otp.deleteMany({ email: user.email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Store OTP in database
    await Otp.create({
      email: user.email,
      phone: user.phone || identifier,
      otp,
      purpose: 'PASSWORD_RESET',
      expiresAt,
    });

    // Send email/log OTP
    await sendOtpEmail(user.email, otp, 'Password Reset');

    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email.replace(/(.{2})(.*)(?=@)/, '$1***')}`,
      email: user.email,
      phone: user.phone,
      // For development & easy college viva demo convenience:
      previewOtp: otp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating OTP',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP code',
      });
    }

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase().trim(),
      otp: otp.trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully! You can now reset your password.',
      verified: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying OTP',
    });
  }
};

// @desc    Reset password using verified OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, verified OTP, and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase().trim(),
      otp: otp.trim(),
      verified: true,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification required before resetting password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Delete OTP record after successful reset
    await Otp.deleteMany({ email: user.email });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password',
    });
  }
};
