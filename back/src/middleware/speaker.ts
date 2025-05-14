import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const speakerMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    if (req.role !== 'speaker') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    next();
};