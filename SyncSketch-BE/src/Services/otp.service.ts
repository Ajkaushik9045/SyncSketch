// src/services/otpService.ts
import { OtpModel } from "../Models/otp.model.ts";
import { generateSecureOtp, getOtpExpiry, isOtpExpired } from "../Utils/otp.utils.ts";
import { Types } from "mongoose";

type OtpPurpose = "signup" | "resetPassword";

export const OtpService = {
    async createOtp(
        data: { userId?: Types.ObjectId; email?: string; userName?: string },
        purpose: OtpPurpose
    ): Promise<string> {
        try {
            const otpCode = generateSecureOtp();
            const otpExpiry = getOtpExpiry(10); // 10 minutes expiry

            // Build the unique query to find existing OTP for this user/email and purpose
            const query: any = { otpPurpose: purpose, isUsed: false };

            if (purpose === "signup" && data.email && data.userName) {
                query.email = data.email;
                query.userName = data.userName;
            } else if (purpose === "resetPassword" && data.userId) {
                query.user = data.userId;
            }

            // Find existing OTP document
            const existingOtp = await OtpModel.findOne(query);

            if (existingOtp) {
                // Update existing OTP with new code and expiry
                existingOtp.otpCode = otpCode;
                existingOtp.otpExpiry = otpExpiry;
                existingOtp.isUsed = false;
                await existingOtp.save();
            } else {
                // Create new OTP document
                await OtpModel.create({
                    user: data.userId || null,
                    email: data.email || null,
                    userName: data.userName || null,
                    otpCode,
                    otpExpiry,
                    otpPurpose: purpose,
                    isUsed: false,
                });
            }

            return otpCode;
        } catch (error) {
            console.error("Error creating/updating OTP:", error);
            throw new Error("Could not generate OTP. Please try again later.");
        }
    },

    async verifyOtp(
        identifier: { userId?: Types.ObjectId; email?: string; userName?: string },
        otpCode: string,
        purpose: OtpPurpose
    ) {
        try {
            const query: any = {
                otpCode,
                otpPurpose: purpose,
                isUsed: false
            };

            if (purpose === "resetPassword") {
                if (identifier.userId) {
                    query.user = identifier.userId;
                } else if (identifier.email) {
                    query.email = identifier.email;
                }
            }
            else if (purpose === "signup" && identifier.email && identifier.userName) {
                query.email = identifier.email;
                query.userName = identifier.userName;
            }

            const otpDoc = await OtpModel.findOne(query);
            console.log(otpDoc);
            console.log("OTP verification query:", query);

            if (!otpDoc) {
                throw new Error("Invalid OTP");
            }

            if (isOtpExpired(otpDoc.otpExpiry)) {
                // Delete expired OTP
                await OtpModel.findByIdAndDelete(otpDoc._id);
                throw new Error("OTP has expired");
            }

            // Mark OTP as used
            // await OtpModel.findByIdAndUpdate(otpDoc._id, { isUsed: true });

            return otpDoc;
        } catch (error) {
            console.error("Error verifying OTP:", error);
            throw error;
        }
    },

    async deleteOtp(identifier: { userId?: Types.ObjectId; email?: string; userName?: string }, purpose: OtpPurpose) {
        try {
            const query: any = { otpPurpose: purpose };

            if (purpose === "resetPassword" && identifier.userId) {
                query.user = identifier.userId;
            } else if (purpose === "signup" && identifier.email && identifier.userName) {
                query.email = identifier.email;
                query.userName = identifier.userName;
            }

            await OtpModel.deleteMany(query);
        } catch (error) {
            console.error("Error deleting OTP:", error);
        }
    },

    async cleanupExpiredOtps() {
        try {
            const result = await OtpModel.deleteMany({
                otpExpiry: { $lt: new Date() }
            });
            console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
        } catch (error) {
            console.error("Error cleaning up expired OTPs:", error);
        }
    }
};