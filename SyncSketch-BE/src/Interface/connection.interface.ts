import type { Request, Response } from "express";

export interface SendConnectionRequestBody {
  toUserId: string;
}