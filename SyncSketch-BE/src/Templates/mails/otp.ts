
export const otpEmailTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #4CAF50;">🔑 Your OTP Code</h2>
    <p>Use the following OTP code to continue:</p>
    <h1 style="background:#f4f4f4; padding:10px; text-align:center;">${otp}</h1>
    <p>This code will expire in <strong>10 minutes</strong>.</p>
    <br/>
    <p style="font-size: 12px; color: #999;">If you didn’t request this, please ignore this email.</p>
  </div>
`;
