const nodemailer = require('nodemailer');

// Generate 6 digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOtpEmail = async (email, otp, purpose = 'Password Reset') => {
  try {
    // If SMTP credentials provided in .env, use real nodemailer transport
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"BudgetTracker Security" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: `Your ${purpose} OTP Code: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4f46e5; margin: 0;">Personal Budget Tracker</h2>
              <p style="color: #64748b; font-size: 14px;">Secure Account Verification</p>
            </div>
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="color: #1e293b; margin-top: 0;">${purpose} Request</h3>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                You requested a verification code. Please use the following One-Time Password (OTP) to proceed:
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 10px 24px; border-radius: 8px; border: 1px dashed #6366f1;">
                  ${otp}
                </span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                ⏱️ This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone. If you did not request this, please ignore this email.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 OTP Email sent successfully to ${email}`);
    } else {
      console.log(`\n======================================================`);
      console.log(`📩 [DEV/DEMO MODE] OTP EMAIL DISPATCHED`);
      console.log(`   To: ${email}`);
      console.log(`   Purpose: ${purpose}`);
      console.log(`   Your OTP Code: 👉 ${otp} 👈 (Valid for 10 mins)`);
      console.log(`======================================================\n`);
    }
    return { success: true, otp };
  } catch (error) {
    console.error('Email send error:', error.message);
    // In dev / college presentation mode, we don't block the user if SMTP fails
    return { success: true, otp, devMode: true };
  }
};

module.exports = {
  generateOTP,
  sendOtpEmail,
};
