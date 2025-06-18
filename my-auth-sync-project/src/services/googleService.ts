import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleService {
    private oauth2Client: OAuth2Client;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }

    generateAuthUrl(): string {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/tasks'
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
        });
    }

    async getAccessToken(code: string): Promise<any> {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return tokens;
    }

    async listCalendars(): Promise<any> {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const res = await calendar.calendarList.list();
        return res.data.items;
    }

    async createEvent(event: any): Promise<any> {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return res.data;
    }

    async updateEvent(eventId: string, event: any): Promise<any> {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        const res = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            requestBody: event,
        });
        return res.data;
    }

    async deleteEvent(eventId: string): Promise<any> {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
    }

    async listTasks(): Promise<any> {
        const tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
        const res = await tasks.tasks.list({
            tasklist: '@default',
        });
        return res.data.items;
    }

    async createTask(task: any): Promise<any> {
        const tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
        const res = await tasks.tasks.insert({
            tasklist: '@default',
            requestBody: task,
        });
        return res.data;
    }

    async updateTask(taskId: string, task: any): Promise<any> {
        const tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
        const res = await tasks.tasks.update({
            tasklist: '@default',
            task: taskId,
            requestBody: task,
        });
        return res.data;
    }

    async deleteTask(taskId: string): Promise<any> {
        const tasks = google.tasks({ version: 'v1', auth: this.oauth2Client });
        await tasks.tasks.delete({
            tasklist: '@default',
            task: taskId,
        });
    }
}

export default GoogleService;