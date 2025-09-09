import { Router } from "express";
import { sendConnectionRequestController } from "../Controllers/connection.controller";
import { AuthMiddleware } from "../MiddleWares/authMiddleware";
const ConnectionRoutes = Router();

// connection.routes
ConnectionRoutes.post("/request", AuthMiddleware, sendConnectionRequestController);

export default ConnectionRoutes;