import { Router } from "express";
import { sendConnectionRequestController } from "../Controllers/connection.controller.ts";
import { AuthMiddleware } from "../MiddleWares/authMiddleware.ts";
const ConnectionRoutes = Router();

// connection.routes.ts
ConnectionRoutes.post("/request", AuthMiddleware, sendConnectionRequestController);

export default ConnectionRoutes;