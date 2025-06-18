import { Request, Response } from 'express';
import DataService from '../services/dataService';

class DataController {
    private dataService: DataService;

    constructor() {
        this.dataService = new DataService();
    }

    public async createData(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.dataService.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async updateData(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.dataService.update(req.params.id, req.body);
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(404).json({ message: 'Data not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async deleteData(req: Request, res: Response): Promise<void> {
        try {
            const success = await this.dataService.delete(req.params.id);
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Data not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async getData(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.dataService.get(req.params.id);
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(404).json({ message: 'Data not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async getAllData(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.dataService.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default DataController;