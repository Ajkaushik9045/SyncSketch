import { Router } from "express";
import { sendConnectionRequestController } from "../Controllers/connection.controller";
import { AuthMiddleware } from "../MiddleWares/authMiddleware";
const ConnectionRoutes = Router();

// connection.routes
ConnectionRoutes.post("/sendRequest", AuthMiddleware, sendConnectionRequestController);
// ConnectionRoutes.post("/accept/:requestId", AuthMiddleware, acceptConnectionRequestController);
// ConnectionRoutes.post("/reject/:requestId", AuthMiddleware, rejectConnectionRequestController);
// ConnectionRoutes.delete("/cancel/:requestId", AuthMiddleware, cancelConnectionRequestController);
// ConnectionRoutes.delete("/remove/:connectionId", AuthMiddleware, removeConnectionController);

// ConnectionRoutes.get("/", AuthMiddleware, getConnectionsController);
// ConnectionRoutes.get("/requests", AuthMiddleware, getPendingRequestsController);
// ConnectionRoutes.get("/sent", AuthMiddleware, getSentRequestsController);
// ConnectionRoutes.get("/status/:userId", AuthMiddleware, getConnectionStatusController);

export default ConnectionRoutes;