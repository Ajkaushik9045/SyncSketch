// src/services/otpService.ts
import { OtpModel } from "../Models/otp.model.ts";
import { generateOtp, getOtpExpiry } from "../Utils/otp.utils.ts";
import { Types } from "mongoose";

export const OtpService = {
    async createOtp(
        userId: Types.ObjectId,
        purpose: "signup" | "resetPassword"
    ): Promise<string> {
        try {
            const otpCode = generateOtp();
            const otpExpiry = getOtpExpiry();

            const otpDoc = await OtpModel.create({
                user: userId,
                otpCode,
                otpExpiry,
                otpPurpose: purpose,
            });

            if (!otpDoc) {
                throw new Error("Failed to create OTP in database");
            }

            return otpCode; // Return OTP for sending via email
        } catch (error) {
            console.error("Error creating OTP:", error);
            throw new Error("Could not generate OTP. Please try again later.");
        }
    },

    async verifyOtp(userId: Types.ObjectId, otpCode: string, purpose: "signup" | "resetPassword") {
        const otpDoc = await OtpModel.findOne({ user: userId, otpCode, otpPurpose: purpose });
        if (!otpDoc) throw new Error("Invalid OTP");
        if (otpDoc.otpExpiry < new Date()) throw new Error("OTP expired");

        await OtpModel.deleteMany({ user: userId, otpPurpose: purpose }); // clear after verify
        return true;
    }
};
