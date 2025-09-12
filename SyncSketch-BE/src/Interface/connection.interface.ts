import type { Request, Response } from "express";

export interface SendConnectionRequestBody {
  toUserId: string;
}

export interface AcceptConnectionRequestParams {
  requestId?: string;
}

export interface RejectConnectionRequestParams {
  requestId?: string;
}

export interface CancelConnectionRequestParams {
  requestId?: string;
}

export interface RemoveConnectionParams {
  connectionId?: string;
}

export interface GetConnectionStatusParams {
  userId?: string;
}