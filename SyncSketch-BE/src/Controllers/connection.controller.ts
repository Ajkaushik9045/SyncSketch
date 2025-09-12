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
import { HTTP_STATUS, MESSAGES } from "../Constant/index";
import { AppError } from "../Errors/index";
import { User } from "../Models/user.model";
import { Connection } from "../Models/connection.model";

type SendConnectionRequest = AuthRequest & Request<{}, {}, SendConnectionRequestBody>;
type AcceptConnectionRequest = AuthRequest & Request<AcceptConnectionRequestParams, {}, {}>;
type RejectConnectionRequest = AuthRequest & Request<RejectConnectionRequestParams, {}, {}>;
type CancelConnectionRequest = AuthRequest & Request<CancelConnectionRequestParams, {}, {}>;
type RemoveConnectionRequest = AuthRequest & Request<RemoveConnectionParams, {}, {}>;
type GetConnectionStatusRequest = AuthRequest & Request<GetConnectionStatusParams, {}, {}>;

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
        from: user.id,
        to: toUserId,
        status: "pending",
    });
    if (existingRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_ALREADY_SENT, HTTP_STATUS.BAD_REQUEST);
    }

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
    
    const connectionRequest = await Connection.findById(requestId);
    if (!connectionRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if the user is the recipient of the request
    if (connectionRequest.to.toString() !== user.id) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if request is still pending
    if (connectionRequest.status !== 'pending') {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    
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
    
    const connectionRequest = await Connection.findById(requestId);
    if (!connectionRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if the user is the recipient of the request
    if (connectionRequest.to.toString() !== user.id) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if request is still pending
    if (connectionRequest.status !== 'pending') {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    
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
    
    const connectionRequest = await Connection.findById(requestId);
    if (!connectionRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if the user is the sender of the request
    if (connectionRequest.from.toString() !== user.id) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if request is still pending
    if (connectionRequest.status !== 'pending') {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    
    // Delete the connection request
    await Connection.findByIdAndDelete(requestId);
    
    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.CONNECTION.REQUEST_REJECTED,
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
    
    const connection = await Connection.findById(connectionId);
    if (!connection) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if the user is part of this connection
    if (connection.from.toString() !== user.id && connection.to.toString() !== user.id) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if connection is accepted
    if (connection.status !== 'accepted') {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    
    // Delete the connection
    await Connection.findByIdAndDelete(connectionId);
    
    return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.GENERAL.SUCCESS,
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

export const getConnectionStatusController = catchAsync(async (req: GetConnectionStatusRequest, res: Response) => {
    const { userId } = req.params;
    
    if (!userId) {
        throw new AppError(MESSAGES.GENERAL.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }
    const user = req.user;
    
    if (!user) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    if (user.id === userId) {
        return res.status(HTTP_STATUS.OK).json({
            status: 'self',
            message: 'This is your own profile'
        });
    }
    
    // Check if there's any connection between users
    const connection = await Connection.findOne({
        $or: [
            { from: user.id, to: userId },
            { from: userId, to: user.id }
        ]
    });
    
    if (!connection) {
        return res.status(HTTP_STATUS.OK).json({
            status: 'none',
            message: 'No connection exists'
        });
    }
    
    let status = connection.status;
    let message = '';
    
    if (connection.status === 'accepted') {
        status = 'connected';
        message = 'You are connected with this user';
    } else if (connection.status === 'pending') {
        if (connection.from.toString() === user.id) {
            status = 'sent';
            message = 'Connection request sent';
        } else {
            status = 'received';
            message = 'Connection request received';
        }
    } else if (connection.status === 'rejected') {
        status = 'rejected';
        message = 'Connection request was rejected';
    }
    
    return res.status(HTTP_STATUS.OK).json({
        status,
        message,
        connectionId: connection._id
    });
});