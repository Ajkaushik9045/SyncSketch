import type { Request, Response } from "express";
import { User } from "../Models/user.model";
import {
    validateProfileData,
    validateSignInData,
    validateSignUpStep1Data,
    validateSignUpStep2Data,
    validateOtpVerificationData,
} from "../Validators/authValidation";
import { format, formatDistanceToNow } from "date-fns";
import type { AuthRequest } from "../MiddleWares/authMiddleware";
import { AuthService } from "../Services/auth.Service";
import { MailService } from "../Services/mail.service";
import type { SigninRequest, SignupStep1Request, SignupStep2Request } from "../Interface/auth.interface";
import { catchAsync } from "../Utils/catchAsync.util";
import { HTTP_STATUS, MESSAGES } from "../Constant/index";
import { AppError } from "../Errors/index";


// Step 1: Request OTP for signup
export const requestSignupOtpController = catchAsync(async (
    req: SignupStep1Request,
    res: Response
) => {
    // Validate request body
    const { valid, errors } = validateSignUpStep1Data(req.body);
    if (!valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors });
    }

    const { userName, email } = req.body;

    // Request OTP
    const otp = await AuthService.requestSignupOtp(email, userName);
    // Send OTP mail
    await MailService.sendOtpMail(email, otp).then(() => {
        console.log("OTP SNt");
    }).catch((error) => { console.log(error) }
    );
    res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.OTP_SENT,
        data: {
            email,
            userName,
        },
    });
});

// Step 2: Verify OTP and complete signup
export const completeSignupController = catchAsync(async (
    req: SignupStep2Request,
    res: Response
) => {
    // Validate OTP verification data
    const { valid: otpValid, errors: otpErrors } = validateOtpVerificationData({
        email: req.body.email,
        userName: req.body.userName,
        otpCode: req.body.otpCode,
    });

    if (!otpValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: otpErrors });
    }

    // Validate user data
    const { valid: userValid, errors: userErrors } = validateSignUpStep2Data({
        name: req.body.name,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber || undefined,
        avatarUrl: req.body.avatarUrl || undefined,
    });

    if (!userValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: userErrors });
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

    res.status(HTTP_STATUS.CREATED).json({
        message: MESSAGES.AUTH.SIGNUP_SUCCESS,
        user: result.user,
        token: result.token,
    });
    await MailService.sendWelcomeMail(email);
});

export const signinController = catchAsync(async (req: SigninRequest, res: Response) => {
    // Pass request body to validator
    const { valid, errors } = validateSignInData(req.body);

    if (!valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors });
    }

    const { userName, email, password } = req.body;

    // Your existing check can be simplified because validation covers this
    const user = await User.findOne(userName ? { userName } : { email });

    if (!user) {
        throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }
    if (password == undefined) {
        throw new AppError(MESSAGES.AUTH.PASSWORD_NOT_VALID, HTTP_STATUS.BAD_REQUEST);
    }

    const passwordMatch = await user.validatePassword(password);
    if (!passwordMatch) {
        throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
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

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.USER_DATA_FETCHED,
        token,
        user: responseUser,
    });
});

export const profileController = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const lastLogin = user.lastLogin ?? null;

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.PROFILE_FETCHED,
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
});

export const changePasswordController = catchAsync(async (
    req: AuthRequest,
    res: Response
) => {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!currentPassword || !newPassword) {
        throw new AppError("Current Password and new password required", HTTP_STATUS.BAD_REQUEST);
    }

    const validatePassword = await user.validatePassword(currentPassword);
    if (!validatePassword) {
        throw new AppError("Current password is incorrect", HTTP_STATUS.UNAUTHORIZED);
    }
    user.passwordHashed = newPassword;
    await user.save();
    return res.status(HTTP_STATUS.OK).json({ message: MESSAGES.AUTH.PASSWORD_UPDATED });
});

export const logoutController = catchAsync(async (req: AuthRequest, res: Response) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully" });
});

export const profileEditController = catchAsync(async (
    req: AuthRequest,
    res: Response
) => {
    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const { valid, errors } = validateProfileData(req.body);

    if (!valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors });
    }
    // Uniqueness checks
    if (req.body.userName) {
        const existingUserName = await User.findOne({
            userName: req.body.userName,
            _id: { $ne: user._id },
        });
        if (existingUserName) {
            throw new AppError(MESSAGES.AUTH.USERNAME_EXISTS, HTTP_STATUS.BAD_REQUEST);
        }
    }

    if (req.body.email) {
        const existingEmail = await User.findOne({
            email: req.body.email,
            _id: { $ne: user._id },
        });
        if (existingEmail) {
            throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HTTP_STATUS.BAD_REQUEST);
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
        throw new AppError("Invalid fields in update", HTTP_STATUS.BAD_REQUEST);
    }

    // Apply updates
    for (const key of updates) {
        // @ts-ignore because we've validated keys
        user[key] = req.body[key];
    }

    await user.save();

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.PROFILE_UPDATED,
        user: {
            id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
        },
    });
});

export const requestPasswordResetController = catchAsync(async (
    req: Request,
    res: Response
) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError(MESSAGES.AUTH.EMAIL_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    // Send password reset OTP
    const otp = await AuthService.sendPasswordResetOtp(email);
    res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.RESET_OTP_SENT,
    });
    await MailService.sendResetPasswordOtpMail(email, otp);
});

export const resetPasswordController = catchAsync(async (req: Request, res: Response) => {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
        throw new AppError(MESSAGES.AUTH.RESET_FIELDS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }

    // Verify OTP and update password
    await AuthService.verifyPasswordResetOtpAndUpdate(
        email,
        otpCode,
        newPassword
    );

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    });
});
