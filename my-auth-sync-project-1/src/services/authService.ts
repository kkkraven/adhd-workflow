import { UserModel } from '../models/userModel';
import { sign, verify } from '../utils/jwt';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
    private users: UserModel[] = [];

    register(username: string, password: string) {
        const user = new UserModel(username, password);
        this.users.push(user);
        return user;
    }

    login(username: string, password: string) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const token = this.generateToken(user);
        return { user, token };
    }

    generateToken(user: UserModel) {
        const payload = { id: user.id, username: user.username };
        return sign(payload);
    }

    validateToken(token: string) {
        try {
            const decoded = verify(token);
            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}