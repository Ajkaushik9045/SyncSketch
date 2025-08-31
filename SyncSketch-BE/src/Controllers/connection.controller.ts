import type { Request, Response } from "express";
import type { SendConnectionRequestBody, } from "../Interface/connection.interface.ts";
import type { AuthRequest } from "../MiddleWares/authMiddleware.ts";

type SendConnectionRequest = AuthRequest & Request<{}, {}, SendConnectionRequestBody>;

export const sendConnectionRequestController = async (req: SendConnectionRequest, res: Response) => {
    const { toUserId } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
        message: `Connection request sent from ${user.id} to ${toUserId}`,
    });
};