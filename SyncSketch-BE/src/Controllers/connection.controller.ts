import type { Request, Response } from "express";
import type { SendConnectionRequestBody, } from "../Interface/connection.interface";
import type { AuthRequest } from "../MiddleWares/authMiddleware";
import { catchAsync } from "../Utils/catchAsync.util";
import { HTTP_STATUS, MESSAGES } from "../Constant/index";
import { AppError } from "../Errors/index";
import { User } from "../Models/user.model";
import { Connections } from "../Models/connection.model";

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
    const existingRequest = await Connections.findOne({
        fromUser: user.id,
        toUser: toUserId,
        status: "pending",
    });


    return res.status(HTTP_STATUS.OK).json({
        message: `Connection request sent from ${user.id} to ${toUserId}`,
    });
});