export class DataModel {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string, title: string, description: string) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    update(title: string, description: string) {
        this.title = title;
        this.description = description;
        this.updatedAt = new Date();
    }
}