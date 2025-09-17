import type { Request, Response } from "express";
import type {
    SendConnectionRequestBody,
    AcceptConnectionRequestParams,
    RejectConnectionRequestParams,
    CancelConnectionRequestParams,
    RemoveConnectionParams,
    GetConnectionStatusParams
} from "../Interface/connection.interface";
import type { AuthRequest } from "../MiddleWares/authMiddleware";
import { catchAsync } from "../Utils/catchAsync.util";
import {
    validateConnectionRequest,
    validateConnectionAction,
    validateConnectionCancellation,
    validateConnectionRemoval
} from "../Utils/connection.util";
import { HTTP_STATUS, MESSAGES } from "../Constant/index";
import { AppError } from "../Errors/index";
import { User } from "../Models/user.model";
import { Connection } from "../Models/connection.model";

type SendConnectionRequest = AuthRequest & Request<{}, {}, SendConnectionRequestBody>;
type AcceptConnectionRequest = AuthRequest & Request<AcceptConnectionRequestParams, {}, {}>;
type RejectConnectionRequest = AuthRequest & Request<RejectConnectionRequestParams, {}, {}>;
type CancelConnectionRequest = AuthRequest & Request<CancelConnectionRequestParams, {}, {}>;
type RemoveConnectionRequest = AuthRequest & Request<RemoveConnectionParams, {}, {}>;
// type GetConnectionStatusRequest = AuthRequest & Request<GetConnectionStatusParams, {}, {}>;

export const sendConnectionRequestController = catchAsync(async (req: SendConnectionRequest, res: Response) => {
    const { toUserId } = req.body;
    const user = req.user;

    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if target user exists
    const receiver = await User.findById(toUserId);
    if (!receiver) {
        throw new AppError(MESSAGES.CONNECTION.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Validate connection request using utility
    try {
        await validateConnectionRequest(user.id, toUserId);
    } catch (error) {
        // Check if it's a rejected connection that can be reused
        const existingConnection = await Connection.findOne({
            $or: [
                { from: user.id, to: toUserId },
                { from: toUserId, to: user.id }
            ],
            status: 'rejected'
        });

        if (existingConnection) {
            // Update the existing rejected connection to pending
            existingConnection.from = user.id;
            existingConnection.to = toUserId;
            existingConnection.status = 'pending';
            await existingConnection.save();

            return res.status(HTTP_STATUS.CREATED).json({
                message: MESSAGES.CONNECTION.REQUEST_SENT,
                request: existingConnection,
            });
        }

        throw error;
    }

    // Create new connection request
    const connection = await Connection.create({
        from: user.id,
        to: toUserId,
        status: "pending",
    });

    return res.status(HTTP_STATUS.CREATED).json({
        message: MESSAGES.CONNECTION.REQUEST_SENT,
        request: connection,
    });
});

export const acceptConnectionRequestController = catchAsync(async (req: AcceptConnectionRequest, res: Response) => {
    const { requestId } = req.params;

    if (!requestId) {
        throw new AppError(MESSAGES.GENERAL.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Validate connection action using utility
    const connectionRequest = await validateConnectionAction(user.id, requestId, 'accept');

    // Update the connection status to accepted
    connectionRequest.status = 'accepted';
    await connectionRequest.save();

    // Populate user details for response
    await connectionRequest.populate('from', 'name email profilePicture');

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.REQUEST_ACCEPTED,
        connection: connectionRequest,
    });
});

export const rejectConnectionRequestController = catchAsync(async (req: RejectConnectionRequest, res: Response) => {
    const { requestId } = req.params;

    if (!requestId) {
        throw new AppError(MESSAGES.GENERAL.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Validate connection action using utility
    const connectionRequest = await validateConnectionAction(user.id, requestId, 'reject');

    // Update the connection status to rejected
    connectionRequest.status = 'rejected';
    await connectionRequest.save();

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.REQUEST_REJECTED,
    });
});

export const cancelConnectionRequestController = catchAsync(async (req: CancelConnectionRequest, res: Response) => {
    const { requestId } = req.params;

    if (!requestId) {
        throw new AppError(MESSAGES.GENERAL.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Validate connection cancellation using utility
    await validateConnectionCancellation(user.id, requestId);

    // Delete the connection request
    await Connection.findByIdAndDelete(requestId);

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.REQUEST_CANCELLED,
    });
});

export const removeConnectionController = catchAsync(async (req: RemoveConnectionRequest, res: Response) => {
    const { connectionId } = req.params;

    if (!connectionId) {
        throw new AppError(MESSAGES.GENERAL.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    const user = req.user;
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Validate connection removal using utility
    await validateConnectionRemoval(user.id, connectionId);

    // Delete the connection
    await Connection.findByIdAndDelete(connectionId);

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.CONNECTION_REMOVED,
    });
});

export const getConnectionsController = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const connections = await Connection.find({
        $or: [
            { from: user.id },
            { to: user.id }
        ],
        status: 'accepted'
    })
        .populate('from', 'name email profilePicture')
        .populate('to', 'name email profilePicture')
        .sort({ createdAt: -1 });

    // Format connections to show the other user's details
    const formattedConnections = connections.map(connection => {
        const otherUser = connection.from._id.toString() === user.id ? connection.to : connection.from;
        return {
            _id: connection._id,
            user: otherUser,
            connectedAt: connection.createdAt
        };
    });

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.CONNECTIONS_FETCHED,
        connections: formattedConnections,
    });
});

export const getPendingRequestsController = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const pendingRequests = await Connection.find({
        to: user.id,
        status: 'pending'
    })
        .populate('from', 'name email profilePicture')
        .sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.PENDING_REQUESTS_FETCHED,
        requests: pendingRequests,
    });
});

export const getSentRequestsController = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const sentRequests = await Connection.find({
        from: user.id,
        status: 'pending'
    })
        .populate('to', 'name email profilePicture')
        .sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.SENT_REQUESTS_FETCHED,
        requests: sentRequests,
    });
});
