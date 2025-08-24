// src/services/authService.ts
import { OtpService } from "./otp.service.ts";
import { MailService } from "./mail.service.ts";
import { Types } from "mongoose";

export class AuthService {
    static async sendSignupOtp(email: string, userId: Types.ObjectId): Promise<void> {
        try {
            const otp = await OtpService.createOtp(userId, "signup");
            if (!otp) {
                throw new Error("Failed to generate OTP");
            }
            await MailService.sendOtpMail(email, otp);  // mail handles layout

        }
        catch (error) {
            console.error("Error sending signup OTP:", error);
            throw new Error("Unable to send OTP. Please try again later.");
        }
    }

    // static async sendPasswordResetOtp(email: string, userId: Types.ObjectId): Promise<void> {
    //     const otp = await OtpService.createOtp(userId, "resetPassword");
    //     await MailService.sendOtpMail(email, otp);
    // }

    // static async verifySignupOtp(userId: Types.ObjectId, code: string): Promise<boolean> {
    //     return await OtpService.verifyOtp(userId, code, "signup");
    // }

    // static async verifyResetOtp(userId: Types.ObjectId, code: string): Promise<boolean> {
    //     return await OtpService.verifyOtp(userId, code, "resetPassword");
    // }

}