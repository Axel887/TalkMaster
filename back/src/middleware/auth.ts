import { Request, Response, NextFunction } from 'express';
import verifyToken from '../utlis/verifyToken';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    role?: string;
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const {token} = req.cookies;

    if (!token) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    };

    const decoded = await verifyToken(token);

    if (!decoded) {
        res.status(403).json({ error: 'Invalid or expired token' })
        return
    };

    req.userId = decoded.id;
    req.role = decoded.role;
    next();
};