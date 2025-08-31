import { Router } from "express";
import { sendConnectionRequestController } from "../Controllers/connection.controller.ts";
import { AuthMiddleware } from "../MiddleWares/authMiddleware.ts";
const ConnectionRoutes= Router();

ConnectionRoutes.post("/connection/request",AuthMiddleware ,sendConnectionRequestController);

export default ConnectionRoutes;