import { Connection } from "../Models/connection.model";
import { AppError } from "../Errors/index";
import { HTTP_STATUS, MESSAGES } from "../Constant/index";

export interface ConnectionStatus {
    exists: boolean;
    connection?: any;
    status?: 'pending' | 'accepted' | 'rejected';
    userRole?: 'sender' | 'receiver';
}

/**
 * Check connection status between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns ConnectionStatus object with connection details
 */
export const getConnectionStatus = async (userId1: string, userId2: string): Promise<ConnectionStatus> => {
    const connection = await Connection.findOne({
        $or: [
            { from: userId1, to: userId2 },
            { from: userId2, to: userId1 }
        ]
    });

    if (!connection) {
        return { exists: false };
    }

    const userRole = connection.from.toString() === userId1 ? 'sender' : 'receiver';

    return {
        exists: true,
        connection,
        status: connection.status,
        userRole
    };
};

/**
 * Validate if a connection request can be sent
 * @param fromUserId - Sender user ID
 * @param toUserId - Receiver user ID
 * @throws AppError if connection cannot be sent
 */
export const validateConnectionRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
    if (fromUserId === toUserId) {
        throw new AppError(MESSAGES.CONNECTION.CANNOT_CONNECT_SELF, HTTP_STATUS.BAD_REQUEST);
    }

    const connectionStatus = await getConnectionStatus(fromUserId, toUserId);

    if (connectionStatus.exists) {
        const { status, userRole } = connectionStatus;

        if (status === 'accepted') {
            throw new AppError(MESSAGES.CONNECTION.ALREADY_CONNECTED, HTTP_STATUS.BAD_REQUEST);
        } else if (status === 'pending') {
            if (userRole === 'sender') {
                throw new AppError(MESSAGES.CONNECTION.REQUEST_ALREADY_SENT, HTTP_STATUS.BAD_REQUEST);
            } else {
                throw new AppError('You already have a pending request from this user', HTTP_STATUS.BAD_REQUEST);
            }
        }
        // If status is 'rejected', allow sending new request (handled in controller)
    }
};

/**
 * Validate if user can accept/reject a connection request
 * @param userId - User ID trying to accept/reject
 * @param requestId - Connection request ID
 * @returns Connection document
 * @throws AppError if validation fails
 */
export const validateConnectionAction = async (userId: string, requestId: string, action: 'accept' | 'reject') => {
    const connectionRequest = await Connection.findById(requestId);
    
    if (!connectionRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if the user is the recipient of the request
    if (connectionRequest.to.toString() !== userId) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if request is still pending
    if (connectionRequest.status !== 'pending') {
        throw new AppError(`Connection request is no longer pending`, HTTP_STATUS.BAD_REQUEST);
    }

    return connectionRequest;
};

/**
 * Validate if user can cancel a connection request
 * @param userId - User ID trying to cancel
 * @param requestId - Connection request ID
 * @returns Connection document
 * @throws AppError if validation fails
 */
export const validateConnectionCancellation = async (userId: string, requestId: string) => {
    const connectionRequest = await Connection.findById(requestId);
    
    if (!connectionRequest) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if the user is the sender of the request
    if (connectionRequest.from.toString() !== userId) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if request is still pending
    if (connectionRequest.status !== 'pending') {
        throw new AppError(`Connection request is no longer pending`, HTTP_STATUS.BAD_REQUEST);
    }

    return connectionRequest;
};

/**
 * Validate if user can remove a connection
 * @param userId - User ID trying to remove connection
 * @param connectionId - Connection ID
 * @returns Connection document
 * @throws AppError if validation fails
 */
export const validateConnectionRemoval = async (userId: string, connectionId: string) => {
    const connection = await Connection.findById(connectionId);
    
    if (!connection) {
        throw new AppError(MESSAGES.CONNECTION.REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if the user is part of this connection
    if (connection.from.toString() !== userId && connection.to.toString() !== userId) {
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if connection is accepted
    if (connection.status !== 'accepted') {
        throw new AppError(`Can only remove accepted connections`, HTTP_STATUS.BAD_REQUEST);
    }

    return connection;
};
