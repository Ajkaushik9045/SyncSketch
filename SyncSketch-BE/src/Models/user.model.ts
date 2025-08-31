import { Document, model, Schema, Types } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
    _id: Types.ObjectId;
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
    blockedUsers: Types.ObjectId[];
    isBlocked: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    // Add method typing here
    validatePassword(passwordInput: string): Promise<boolean>;
    getJWT(): string;
}

const UserSchema: Schema<UserDocument> = new Schema<UserDocument>({
    userName: {
        type: String,
        required: [true, "UserName is Required"],
        unique: true,
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
        enum: ['admin', 'editor', 'viewer'],
        default: ['viewer'],
    },
    permissions: {
        canDraw: { type: Boolean, default: true },
        canType: { type: Boolean, default: true },
        canAudio: { type: Boolean, default: true },
        canInvite: { type: Boolean, default: true },
    },
    blockedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    lastLogin: { type: Date },
}, { timestamps: true });

// Pre-save hook to hash password only if it has been modified or is new
UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('passwordHashed')) {
        return next();
    }
    try {
        this.passwordHashed = await bcrypt.hash(this.passwordHashed, 12);
        next();
    } catch (err: unknown) {
        if (err instanceof Error) {
            next(err);
        } else {
            next(new Error('Unknown error during password hashing'));
        }
    }
});

UserSchema.methods.validatePassword = async function (passwordInputByUser: string): Promise<boolean> {
    return await bcrypt.compare(passwordInputByUser, this.passwordHashed);
};

UserSchema.methods.getJWT = function (): string {
    const user = this as IUser;
    // Use your JWT_SECRET from config, not hardcoded!
    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'SyncSketch',
        { expiresIn: '1h' }
    );
    return token;
};

export type UserDocument = IUser & Document;
export const User = model<UserDocument>('User', UserSchema);
