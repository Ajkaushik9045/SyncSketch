// src/services/authService.ts
import { OtpService } from "./otp.service.ts";
import { MailService } from "./mail.service.ts";
import { User } from "../Models/user.model.ts";
import { OtpModel } from "../Models/otp.model.ts";

export class AuthService {
    static async requestSignupOtp(email: string, userName: string): Promise<string> {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { userName }]
            });

            if (existingUser) {
                throw new Error("User with this email or username already exists");
            }

            // Generate OTP for signup
            const otp = await OtpService.createOtp({ email, userName }, "signup");

            if (!otp) {
                throw new Error("Failed to generate OTP");
            }
            return otp;

        } catch (error) {
            console.error("Error requesting signup OTP:", error);
            throw error;
        }
    }

    static async verifySignupOtpAndCreateUser(
        email: string,
        userName: string,
        otpCode: string,
        userData: {
            name: string;
            password: string;
            phoneNumber?: string | undefined;
            avatarUrl?: string | undefined;
        }
    ): Promise<{ user: any; token: string }> {
        try {
            // Verify OTP
            const verifiedOtp = await OtpService.verifyOtp(
                { email, userName },
                otpCode,
                "signup"
            );

            if (!verifiedOtp) {
                throw new Error("Invalid or expired OTP");
            }

            // Check again if user exists (race condition protection)
            const existingUser = await User.findOne({
                $or: [{ email }, { userName }]
            });

            if (existingUser) {
                throw new Error("User with this email or username already exists");
            }

            // Create new user
            const user = new User({
                userName,
                name: userData.name,
                email,
                passwordHashed: userData.password, // Will be hashed in model hook
                phoneNumber: userData.phoneNumber || '',
                avatarUrl: userData.avatarUrl || '',
                isVerified: true, // User is verified after OTP verification
                role: ['viewer'],
                permissions: {
                    canDraw: true,
                    canType: true,
                    canAudio: true,
                    canInvite: true,
                },
                isBlocked: false,
            });

            await user.save();

            // Clean up OTP
            await OtpService.deleteOtp({ email, userName }, "signup");

            // Generate JWT token
            const token = user.getJWT();

            return {
                user: {
                    id: user._id,
                    userName: user.userName,
                    email: user.email,
                    name: user.name,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                    isVerified: user.isVerified,
                },
                token
            };

        } catch (error) {
            console.error("Error verifying signup OTP and creating user:", error);
            throw error;
        }
    }

    static async sendPasswordResetOtp(email: string): Promise<string> {
        try {
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                // Don't reveal if user exists or not for security
                throw new Error("Failed to get user ");
            }

            const otp = await OtpService.createOtp({ userId: user._id }, "resetPassword");

            if (!otp) {
                throw new Error("Failed to generate OTP");
            }
            return otp;

            // await MailService.sendResetPasswordOtpMail(email, otp);

        } catch (error) {
            console.error("Error sending reset OTP:", error);
            throw new Error("Unable to send OTP. Please try again later.");
        }
    }

    static async verifyPasswordResetOtpAndUpdate(
        email: string,
        otpCode: string,
        newPassword: string
    ): Promise<void> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found");
            }
            console.log("here the userid", user._id);
            // Verify OTP
            const verifiedOtp = await OtpService.verifyOtp(
                { userId: user._id },
                otpCode,
                "resetPassword"
            );

            if (!verifiedOtp) {
                throw new Error("Invalid or expired OTP");
            }
            const isSamePassword = await user.validatePassword(newPassword);
            if (isSamePassword) {
                throw new Error("New password must be different from the previous password");
            }

            // Update password
            user.passwordHashed = newPassword;
            await user.save();
            // Now mark OTP as used explicitly AFTER successful password update
            await OtpModel.findByIdAndUpdate(verifiedOtp._id, { isUsed: true })
            // Clean up OTP
            await OtpService.deleteOtp({ userId: user._id }, "resetPassword");

        } catch (error) {
            console.error("Error verifying password reset OTP:", error);
            throw error;
        }
    }
}
