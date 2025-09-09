import { type SentMessageInfo } from "nodemailer";
import { mailTransporter } from "../Config/mail.ts";
import { otpEmailTemplate } from "../Templates/mails/otp.ts";
import { resetPasswordOtpEmailTemplate } from "../Templates/mails/resetPassword.ts";
import { welcomeEmailTemplate } from "../Templates/mails/welcome.ts";
import { config } from "../Config/env.ts";

export const MailService = {
    async sendMail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
        return mailTransporter.sendMail({
            from: `"${config.mail.senderName}" <${config.mail.user}>`,
            to,
            subject,
            html,
        });
    },

    async sendOtpMail(to: string, otp: string): Promise<SentMessageInfo> {
        const html = otpEmailTemplate(otp);
        return this.sendMail(to, "Your OTP Code", html);
    },

    async sendResetPasswordOtpMail(to: string, otp: string): Promise<SentMessageInfo> {
        const html = resetPasswordOtpEmailTemplate(otp);
        return this.sendMail(to, "Password Reset OTP", html);
    },

    async sendWelcomeMail(to: string): Promise<SentMessageInfo> {
        const html = welcomeEmailTemplate(to);
        return this.sendMail(to, "Welcome to SyncSketch!", html);
    },
};
