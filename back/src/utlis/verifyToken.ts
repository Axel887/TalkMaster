import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default function verifyToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err || !decoded) return reject(err);
            resolve(decoded as JwtPayload);
        });
    });
}