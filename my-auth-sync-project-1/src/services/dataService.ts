import { DataModel } from '../models/dataModel';

export class DataService {
    private data: DataModel[];

    constructor() {
        this.data = [];
    }

    createData(data: DataModel): DataModel {
        this.data.push(data);
        return data;
    }

    readData(id: string): DataModel | undefined {
        return this.data.find(item => item.id === id);
    }

    updateData(id: string, updatedData: Partial<DataModel>): DataModel | undefined {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updatedData };
            return this.data[index];
        }
        return undefined;
    }

    deleteData(id: string): boolean {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            return true;
        }
        return false;
    }

    syncData(externalData: DataModel[]): void {
        externalData.forEach(externalItem => {
            const existingItem = this.readData(externalItem.id);
            if (existingItem) {
                if (new Date(externalItem.updated_at) > new Date(existingItem.updated_at)) {
                    this.updateData(externalItem.id, externalItem);
                }
            } else {
                this.createData(externalItem);
            }
        });
    }
}