// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    role?: string;
}

function verifyToken(token: string, secret: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err || !decoded) return reject(err);
            resolve(decoded as JwtPayload);
        });
    });
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

    const decoded = await verifyToken(token, JWT_SECRET).catch((err) => {
        console.log('[authMiddleware] Invalid token:', err?.message);
        return
    });
    if (!decoded) {
        res.status(403).json({ error: 'Invalid or expired token' })
        return
    };

    req.userId = decoded.id;
    req.role = decoded.role;
    next();
};
//     const { token } = req.cookies;
  
//     if (!token) {
//       res.status(401).json({ error: 'No token provided' });
//       return;
//     }
  
//     try {
//       const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as any;
//       req.userId = payload.id;
//       req.role = payload.role;
//       next();
//     } catch (error) {
//       res.status(401).json({ error: 'Invalid token' });
//       return;
//     }
//   };