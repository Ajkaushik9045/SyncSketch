import type { Request, Response } from "express";
import type { SendConnectionRequestBody, } from "../Interface/connection.interface";
import type { AuthRequest } from "../MiddleWares/authMiddleware";
import { catchAsync } from "../Utils/catchAsync.util";
import { HTTP_STATUS, MESSAGES } from "../Constant/index";
import { AppError } from "../Errors/index";
import { User } from "../Models/user.model";
import { Connection } from "../Models/connection.model";

type SendConnectionRequest = AuthRequest & Request<{}, {}, SendConnectionRequestBody>;

export const sendConnectionRequestController = catchAsync(async (req: SendConnectionRequest, res: Response) => {
    const { toUserId } = req.body;
    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    };
    if (user.id === toUserId) {
        throw new AppError(MESSAGES.CONNECTION.CANNOT_CONNECT_SELF, HTTP_STATUS.BAD_REQUEST);
    };
    const receiver = await User.findById(toUserId);
    if (!receiver) {
        throw new AppError(MESSAGES.CONNECTION.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const existingRequest = await Connection.findOne({
        fromUser: user.id,
        toUser: toUserId,
        status: "pending",
    });
    if (existingRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_ALREADY_SENT, HTTP_STATUS.BAD_REQUEST);
    }

    const connection = await Connection.create({
        fromUser: user.id,
        toUser: toUserId,
        status: "pending",
    });


    return res.status(HTTP_STATUS.CREATED).json({
        message: MESSAGES.CONNECTION.REQUEST_SENT,
        request: connection,
    });
});