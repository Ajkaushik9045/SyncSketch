import nodemailer, { type Transporter, type SentMessageInfo } from "nodemailer";
import { otpEmailTemplate } from '../Templates/mails/otp.ts'
import { resetPasswordOtpEmailTemplate } from "../Templates/mails/resetPassword.ts";
import { welcomeEmailTemplate } from "../Templates/mails/welcome.ts";

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const MailService = {
    async sendMail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
        return transporter.sendMail({
            from: `"SyncSketch Team" <${process.env.SMTP_USER}>`,
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
        return this.sendMail(to, "Your OTP Code", html);
    },
    async sendWelcomeMail(to: string): Promise<SentMessageInfo> {
        const html = welcomeEmailTemplate(to);
        return this.sendMail(to, "Welcome", html);
    }
}