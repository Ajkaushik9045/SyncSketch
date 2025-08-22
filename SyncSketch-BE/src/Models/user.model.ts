import { Document, model, Schema } from 'mongoose';
import validator from 'validator';

export interface IUser extends Document {
    userName: string;
    name: string;
    email: string;
    phoneNumber: string;  // Changed to string for phone validation with validator
    passwordHashed: string;
    avatarUrl?: string;
    isVerified: boolean;
    role: string[];
    permissions: {
        canDraw: boolean;
        canType: boolean;
        canAudio: boolean;
        canInvite: boolean;
    };
    isBlocked: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    userName: {
        type: String,
        required: [true, "UserName is Required"],
        unique: true,
        trim: true,
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
        unique: true,
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
    avatarUrl: {
        type: String,
        trim: true,
        validate: {
            validator: (v: string) => !v || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true }),
            message: "Please provide a valid URL for avatar",
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: [String],
        default: ['viewer'],
    },
    permissions: {
        canDraw: { type: Boolean, default: true },
        canType: { type: Boolean, default: true },
        canAudio: { type: Boolean, default: true },
        canInvite: { type: Boolean, default: true },
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    lastLogin: { type: Date },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export const User = model<IUser>('User', UserSchema);
