import type { Request, Response } from "express";
import type { SendConnectionRequestBody, } from "../Interface/connection.interface.ts";
import type { AuthRequest } from "../MiddleWares/authMiddleware.ts";
import { catchAsync } from "../Utils/catchAsync.util.ts";
import { HTTP_STATUS, MESSAGES } from "../Constant/index.ts";
import { AppError } from "../Errors/index.ts";

type SendConnectionRequest = AuthRequest & Request<{}, {}, SendConnectionRequestBody>;

export const sendConnectionRequestController = catchAsync(async (req: SendConnectionRequest, res: Response) => {
    const { toUserId } = req.body;
    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    return res.status(HTTP_STATUS.OK).json({
        message: `Connection request sent from ${user.id} to ${toUserId}`,
    });
});