import type { Request, Response } from "express";
import { User } from "../Models/user.model.ts";
import {
    validateProfileData,
    validateSignInData,
    validateSignUpStep1Data,
    validateSignUpStep2Data,
    validateOtpVerificationData,
} from "../Validators/authValidation.ts";
import { format, formatDistanceToNow } from "date-fns";
import type { AuthRequest } from "../MiddleWares/authMiddleware.ts";
import { AuthService } from "../Services/auth.Service.ts";
import { MailService } from "../Services/mail.service.ts";

interface SignupStep1Request extends Request {
    body: {
        userName: string;
        email: string;
    };
}

interface SignupStep2Request extends Request {
    body: {
        userName: string;
        email: string;
        otpCode: string;
        name: string;
        password: string;
        phoneNumber?: string | undefined;
        avatarUrl?: string | undefined;
    };
}

interface SigninRequest extends Request {
    body: {
        userName?: string;
        email?: string;
        password?: string;
    };
}

// Step 1: Request OTP for signup
export const requestSignupOtpController = async (
    req: SignupStep1Request,
    res: Response
) => {
    try {
        // Validate request body
        const { valid, errors } = validateSignUpStep1Data(req.body);
        if (!valid) {
            return res.status(400).json({ errors });
        }

        const { userName, email } = req.body;

        // Request OTP
        const otp = await AuthService.requestSignupOtp(email, userName);
        res.status(200).json({
            message: "OTP sent successfully to your email",
            data: {
                email,
                userName,
            },
        });
        // Send OTP mail
        await MailService.sendOtpMail(email, otp);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return res.status(409).json({ message: error.message });
            }
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

// Step 2: Verify OTP and complete signup
export const completeSignupController = async (
    req: SignupStep2Request,
    res: Response
) => {
    try {
        // Validate OTP verification data
        const { valid: otpValid, errors: otpErrors } = validateOtpVerificationData({
            email: req.body.email,
            userName: req.body.userName,
            otpCode: req.body.otpCode,
        });

        if (!otpValid) {
            return res.status(400).json({ errors: otpErrors });
        }

        // Validate user data
        const { valid: userValid, errors: userErrors } = validateSignUpStep2Data({
            name: req.body.name,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber || undefined,
            avatarUrl: req.body.avatarUrl || undefined,
        });

        if (!userValid) {
            return res.status(400).json({ errors: userErrors });
        }

        const { userName, email, otpCode, name, password, phoneNumber, avatarUrl } =
            req.body;

        // Verify OTP and create user
        const result = await AuthService.verifySignupOtpAndCreateUser(
            email,
            userName,
            otpCode,
            {
                name,
                password,
                phoneNumber,
                avatarUrl,
            }
        );

        // Set JWT cookie
        res.cookie("token", result.token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: result.user,
            token: result.token,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (
                error.message.includes("Invalid") ||
                error.message.includes("expired")
            ) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes("already exists")) {
                return res.status(409).json({ message: error.message });
            }
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

// Legacy signup controller (for backward compatibility)
export const signupController = async (
    req: SignupStep2Request,
    res: Response
) => {
    try {
        // This is now a wrapper around the two-step flow
        // For immediate signup without OTP verification
        const { userName, email, name, password, phoneNumber, avatarUrl } =
            req.body;

        // Check for existing user/email
        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "Username or email already exists." });
        }

        // Create new user; password hashing will happen in model hook
        const user = new User({
            userName,
            name,
            email,
            passwordHashed: password, // plain password, hashed in model
            phoneNumber: phoneNumber || "",
            avatarUrl: avatarUrl || "",
            isVerified: false, // Legacy users are not verified
            role: ["viewer"],
            permissions: {
                canDraw: true,
                canType: true,
                canAudio: true,
                canInvite: true,
            },
            isBlocked: false,
        });

        await user.save();

        const token = user.getJWT();

        // Set JWT cookie
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
                isVerified: user.isVerified,
            },
            token,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

export const signinController = async (req: SigninRequest, res: Response) => {
    // Pass request body to validator
    const { valid, errors } = validateSignInData(req.body);

    if (!valid) {
        return res.status(400).json({ errors });
    }

    try {
        const { userName, email, password } = req.body;

        // Your existing check can be simplified because validation covers this
        const user = await User.findOne(userName ? { userName } : { email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (password == undefined) {
            return res.status(400).json({ message: "Password is not valid" });
        }

        const passwordMatch = await user.validatePassword(password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = user.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        user.lastLogin = new Date();
        await user.save();

        const responseUser = {
            id: user._id,
            userName: user.userName,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            lastLoginFormatted: user.lastLogin
                ? format(user.lastLogin, "PPpp")
                : null,
            lastLoginRelative: user.lastLogin
                ? formatDistanceToNow(user.lastLogin, { addSuffix: true })
                : null,
        };

        return res.status(200).json({
            message: "User data retrieved successfully",
            token,
            user: responseUser,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

export const profileController = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" }); // Use 401 for auth errors
        }

        const lastLogin = user.lastLogin ?? null;

        return res.status(200).json({
            message: "User profile retrieved successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
                lastLoginFormatted: lastLogin ? format(lastLogin, "PPpp") : null,
                lastLoginRelative: lastLogin
                    ? formatDistanceToNow(lastLogin, { addSuffix: true })
                    : null,
            },
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

export const changePasswordController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: "Current Password and new password required" });
        }

        const validatePassword = await user.validatePassword(currentPassword);
        if (!validatePassword) {
            return res
                .status(401)
                .json({ message: "Current password is incorrect " });
        }
        user.passwordHashed = newPassword;
        await user.save();
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

export const logoutController = async (req: AuthRequest, res: Response) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

export const profileEditController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { valid, errors } = validateProfileData(req.body);

        if (!valid) {
            return res.status(400).json({ errors });
        }
        // Uniqueness checks
        if (req.body.userName) {
            const existingUserName = await User.findOne({
                userName: req.body.userName,
                _id: { $ne: user._id },
            });
            if (existingUserName) {
                return res.status(400).json({ message: "Username is already taken" });
            }
        }

        if (req.body.email) {
            const existingEmail = await User.findOne({
                email: req.body.email,
                _id: { $ne: user._id },
            });
            if (existingEmail) {
                return res.status(400).json({ message: "Email is already taken" });
            }
        }

        const updates = Object.keys(req.body);

        // Allowed fields to update
        const allowedUpdates = [
            "userName",
            "name",
            "email",
            "phoneNumber",
            "avatarUrl",
        ];
        const isValidOperation = updates.every((field) =>
            allowedUpdates.includes(field)
        );

        if (!isValidOperation) {
            return res.status(400).json({ message: "Invalid fields in update" });
        }

        // Apply updates
        for (const key of updates) {
            // @ts-ignore because we've validated keys
            user[key] = req.body[key];
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                userName: user.userName,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

// Password reset flow
export const requestPasswordResetController = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Send password reset OTP
        const otp = await AuthService.sendPasswordResetOtp(email);
        res.status(200).json({
            message:
                "Password reset OTP has been sent",
        });
        await MailService.sendResetPasswordOtpMail(email, otp);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { email, otpCode, newPassword } = req.body;

        if (!email || !otpCode || !newPassword) {
            return res
                .status(400)
                .json({ message: "Email, OTP code, and new password are required" });
        }

        // Verify OTP and update password
        await AuthService.verifyPasswordResetOtpAndUpdate(
            email,
            otpCode,
            newPassword
        );

        return res.status(200).json({
            message: "Password reset successfully",
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (
                error.message.includes("Invalid") ||
                error.message.includes("expired")
            ) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(error) });
    }
};
