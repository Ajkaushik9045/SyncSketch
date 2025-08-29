export const resetPasswordOtpEmailTemplate = (otp: string) => `
  <div style="background: #f6f8fa; border-radius: 16px; max-width: 420px; margin: 32px auto; box-shadow: 0 4px 24px rgba(44,62,80,0.10); font-family: Arial, sans-serif; color: #232f3e; padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 16px;">
      <span style="font-size: 32px; display: inline-block;">🔒</span>
    </div>
    <h2 style="color: #b93e3e; font-size: 22px; margin-top: 0; margin-bottom: 12px; text-align:center; font-weight:700; letter-spacing:0.5px;">
      Password Reset Code
    </h2>
    <p style="font-size:16px; margin-bottom: 24px; text-align: center;">
      Use the following OTP code to reset your password:
    </p>
    <h1 style="background: #ffffff; color: #232f3e; padding: 20px 0; border-radius: 8px; border:1.5px dashed #b93e3e; box-shadow: 0 2px 6px rgba(44,62,80,0.08); text-align:center; font-size:34px; font-family:'Courier New',monospace; letter-spacing:6px; margin:0 0 24px 0;">
      ${otp}
    </h1>
    <div style="margin-bottom: 20px; text-align:center;">
      <span style="font-size:15px; color:#a74343;">This code will expire in <strong>10 minutes</strong>.</span>
    </div>
    <p style="font-size: 12px; color: #888; margin-top: 24px; text-align: center;">
      If you didn’t request a password reset, please ignore this email.
    </p>
  </div>
`;
