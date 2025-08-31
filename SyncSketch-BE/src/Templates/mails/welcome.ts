export const welcomeEmailTemplate = (userName: string) => `
  <div style="background: #f6f8fa; border-radius: 16px; max-width: 420px; margin: 32px auto; box-shadow: 0 4px 24px rgba(44,62,80,0.10); font-family: Arial, sans-serif; color: #232f3e; padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 16px;">
      <span style="font-size: 32px; display: inline-block;">🎉</span>
    </div>
    <h2 style="color: #2b7a4b; font-size: 22px; margin-top: 0; margin-bottom: 12px; text-align:center; font-weight:700; letter-spacing:0.5px;">
      Welcome, ${userName}!
    </h2>
    <p style="font-size:16px; margin-bottom: 24px; text-align: center;">
      We're thrilled to have you on board. Get ready to explore and enjoy all the great features we have to offer.
    </p>
    <p style="font-size:16px; margin-bottom: 24px; text-align: center;">
      If you have any questions or need assistance, our support team is here to help.
    </p>
    <div style="margin-bottom: 20px; text-align:center;">
      <span style="font-size:15px; color:#245236;">Let's make something amazing together!</span>
    </div>
    <p style="font-size: 12px; color: #888; margin-top: 24px; text-align: center;">
      If you didn’t sign up for this, please ignore this email.
    </p>
  </div>
`;