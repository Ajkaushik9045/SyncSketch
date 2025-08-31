import type { Request, Response } from "express";
export interface SignupStep1Request extends Request {
    body: {
        userName: string;
        email: string;
    };
}

export interface SignupStep2Request extends Request {
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

export interface SigninRequest extends Request {
    body: {
        userName?: string;
        email?: string;
        password?: string;
    };
}