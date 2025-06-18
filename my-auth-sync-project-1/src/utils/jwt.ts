import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const EXPIRATION_TIME = '1h';

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRATION_TIME });
};

export const verifyToken = (token: string): object | string => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export const decodeToken = (token: string): object | null => {
    return jwt.decode(token);
};