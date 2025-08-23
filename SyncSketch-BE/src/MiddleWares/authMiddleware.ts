import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { User, type UserDocument } from "../Models/user.model.ts";
import { JWT_SECRET } from "../config.ts";

interface MyJwtPayload extends JwtPayload {
    userId: string;
}

export interface AuthRequest extends Request {
    user?: UserDocument;
}


export const AuthMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization || req.cookies.token;
        if (!authHeader) {
            return res.status(401).json({ message: "No authentication Token provided" });
        }
        const token = authHeader;

        if (!token) {
            return null;
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        // Type check and safe cast!
        if (
            typeof decoded === "object" &&
            decoded !== null &&
            "userId" in decoded &&
            typeof (decoded as any).userId === "string"
        ) {
            const userId = (decoded as MyJwtPayload).userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user;
            return next();
        } else {
            return res.status(401).json({ message: "Invalid token payload" });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(401).json({
                message: "Unauthorized: Invalid or expired token",
                error: error.message,
            });
        }
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
            error: String(error), // fallback
        });
    }
};