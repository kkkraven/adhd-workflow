import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { token, user } = await this.authService.login(req.body);
            res.status(200).json({ token, user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    public async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { token } = await this.authService.refreshToken(req.body.token);
            res.status(200).json({ token });
        } catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
}