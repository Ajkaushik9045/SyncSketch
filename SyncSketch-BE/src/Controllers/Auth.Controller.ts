import type { Request, Response } from 'express';
import { User } from '../Models/user.model.ts';
import { validateSignUpData } from '../Utils/validation.ts';
import jwt from 'jsonwebtoken';


if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}
const JWT_SECRET = process.env.JWT_SECRET;


interface SignupRequest extends Request {
    body: {
        userName: string;
        name: string;
        email: string;
        password: string;
        phoneNumber?: string;
        avatarUrl?: string;
    };
}

interface SigninRequest extends Request {
    body: {
        userName?: string,
        email?: string
        password?: string

    }
}

export const signupController = async (req: SignupRequest, res: Response) => {
    try {
        // Validate request body
        const { valid, errors } = validateSignUpData(req.body);
        if (!valid) {
            return res.status(400).json({ errors });
        }

        const { userName, name, email, password, phoneNumber, avatarUrl } = req.body;

        // Check for existing user/email
        const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }

        // Create new user; password hashing will happen in model hook
        const user = new User({
            userName,
            name,
            email,
            passwordHashed: password,  // plain password, hashed in model
            phoneNumber: phoneNumber || '',
            avatarUrl: avatarUrl || '',
            isVerified: false,
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

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const signinController = async (req: SigninRequest, res: Response) => {
    try {
        const { userName, email, password } = req.body;

        if ((!userName && !email || !password)) {
            return res.status(400).json({ message: "UserName or Email and password are required" });
        }

        const user = await User.findOne(userName ? { userName } : { email });

        if (!user) {
            return res.status(403).json({ message: "Invalid Credential" });
        }

        const passwordMatch = await user.validatePassword(password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credential" });
        }

        // Generate JWT token (expires in 1 day)
        const token = user.getJWT();


        user.lastLogin = new Date();
        await user.save();

        // Respond with token and user info
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
            }
        });
    } catch (err) {
        console.error("Signin error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}