import { Router } from "express";
import { 
    sendConnectionRequestController,
    acceptConnectionRequestController,
    rejectConnectionRequestController,
    cancelConnectionRequestController,
    removeConnectionController,
    getConnectionsController,
    getPendingRequestsController,
    getSentRequestsController,
    getConnectionStatusController
} from "../Controllers/connection.controller";
import { AuthMiddleware } from "../MiddleWares/authMiddleware";
import {
    validateSendConnectionRequest,
    validateConnectionRequestId,
    validateConnectionId,
    validateUserId
} from "../MiddleWares/validation.middleware";

const ConnectionRoutes = Router();

// Connection management routes
ConnectionRoutes.post("/sendRequest", AuthMiddleware, validateSendConnectionRequest, sendConnectionRequestController);
ConnectionRoutes.post("/accept/:requestId", AuthMiddleware, validateConnectionRequestId, acceptConnectionRequestController);
ConnectionRoutes.post("/reject/:requestId", AuthMiddleware, validateConnectionRequestId, rejectConnectionRequestController);
ConnectionRoutes.delete("/cancel/:requestId", AuthMiddleware, validateConnectionRequestId, cancelConnectionRequestController);
ConnectionRoutes.delete("/remove/:connectionId", AuthMiddleware, validateConnectionId, removeConnectionController);

// Connection retrieval routes
ConnectionRoutes.get("/", AuthMiddleware, getConnectionsController);
ConnectionRoutes.get("/requests", AuthMiddleware, getPendingRequestsController);
ConnectionRoutes.get("/sent", AuthMiddleware, getSentRequestsController);
ConnectionRoutes.get("/status/:userId", AuthMiddleware, validateUserId, getConnectionStatusController);

export default ConnectionRoutes;