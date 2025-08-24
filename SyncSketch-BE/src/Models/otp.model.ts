import mongoose, { Document, Schema, Types } from "mongoose";
import validator from "validator";

export interface OtpDocument extends Document {
    _id: Types.ObjectId;
    userName: string,
    name: string,
    email: string,
    phoneNumber: string;
    passwordHashed: string;
    avatarUrl?: string;
    otpCode: string;
    otpExpiry: Date,
    otpPurpose: "signup" | "resetPassword",
    createdAt: Date
};

const OtpSchema = new Schema<OtpDocument>({
    userName: {
        type: String,
        required: [true, "UserName is Required"],
        // unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, "UserName Must be at least 3 characters"],
        maxlength: [20, "UserName can not exceed 20 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed in username"],
    },
    name: {
        type: String,
        required: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [20, "Name can not exceed 20 characters"],
    },
    email: {
        type: String,
        required: true,
        // unique: true,
        trim: true,
        lowercase: true,
        validate: [
            {
                validator: (str: string) => validator.isEmail(str),
                message: 'Please provide a valid email',
            }
        ]
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: (v: string) => validator.isMobilePhone(v, 'any'),
            message: "Please provide a valid phone number",
        },
    },
    passwordHashed: {
        type: String,
        required: true,
    },
    otpCode: {
        type: String, required: true,
        minlength: [6, 'Verification token must be at least 6 character long'],
        maxlength: [6, 'Verification token cannot exceed 6 characters']
    },
    otpExpiry: {
        type: Date, required: true, validate: {
            validator: function (value) {
                if (!value) return true; // Optional field
                return value > new Date();
            },
            message: 'Verification token must have a future expiration date'
        }
    },
    otpPurpose: { type: String, enum: ["signup", "resetPassword"], required: true },
    createdAt: { type: Date, default: Date.now, expires: "10m" },
},
    {
        timestamps: true
    });

export const OtpModel = mongoose.model<OtpDocument>("Otp", OtpSchema);
