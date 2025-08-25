import mongoose, { Document, Schema, Types } from "mongoose";

export interface OtpDocument extends Document {
    _id: Types.ObjectId;
    email: string;
    userName: string;
    otpCode: string;
    otpExpiry: Date;
    otpPurpose: "signup" | "resetPassword";
    isUsed: boolean;
    createdAt: Date;
}

const OtpSchema = new Schema<OtpDocument>({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    otpCode: {
        type: String,
        required: true,
        minlength: [6, 'OTP must be exactly 6 characters'],
        maxlength: [6, 'OTP must be exactly 6 characters']
    },
    otpExpiry: {
        type: Date,
        required: true,
        validate: {
            validator: function (value: Date) {
                return value > new Date();
            },
            message: 'OTP expiry must be in the future'
        }
    },
    otpPurpose: {
        type: String,
        enum: ["signup", "resetPassword"],
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "15m" // Auto-delete after 15 minutes
    }
}, {
    timestamps: true
});

// Index for efficient queries
OtpSchema.index({ email: 1, userName: 1, otpPurpose: 1 });
OtpSchema.index({ otpCode: 1, email: 1, otpPurpose: 1 });

export const OtpModel = mongoose.model<OtpDocument>("Otp", OtpSchema);
