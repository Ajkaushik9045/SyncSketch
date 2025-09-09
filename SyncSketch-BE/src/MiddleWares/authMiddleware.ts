import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User, type UserDocument } from "../Models/user.model.ts";
import { config } from "../Config/env.ts";
import { catchAsync } from "../Utils/catchAsync.util.ts"; // path to catchAsync

interface MyJwtPayload extends JwtPayload {
    userId: string;
}

export interface AuthRequest extends Request {
    user?: UserDocument;
}

export const AuthMiddleware = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization || req.cookies.token;
        if (!authHeader) {
            return res.status(401).json({ message: "No authentication token provided" });
        }

        const token = authHeader;

        const decoded = jwt.verify(token, config.jwt.secret);

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
    }
);
