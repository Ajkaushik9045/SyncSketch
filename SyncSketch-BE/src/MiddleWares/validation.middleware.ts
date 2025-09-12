import { body, param, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, MESSAGES } from '../Constant/index';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: MESSAGES.GENERAL.VALIDATION_ERROR,
            errors: errors.array()
        });
    }
    next();
};

// Validation rules for connection requests
export const validateSendConnectionRequest = [
    body('toUserId')
        .notEmpty()
        .withMessage('Target user ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    handleValidationErrors
];

export const validateConnectionRequestId = [
    param('requestId')
        .notEmpty()
        .withMessage('Request ID is required')
        .isMongoId()
        .withMessage('Invalid request ID format'),
    handleValidationErrors
];

export const validateConnectionId = [
    param('connectionId')
        .notEmpty()
        .withMessage('Connection ID is required')
        .isMongoId()
        .withMessage('Invalid connection ID format'),
    handleValidationErrors
];

export const validateUserId = [
    param('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    handleValidationErrors
];
