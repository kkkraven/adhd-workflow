import * as dav from 'dav';
import ICAL from 'ical.js';
import ical from 'ical-generator';
import * as nodeIcal from 'node-ical';

export class CalDAVService {
    private client: dav.Client;
    private serverUrl: string;
    private username: string;
    private password: string;
    private principalUrl?: string;
    private calendars?: dav.Calendar[];

    constructor() {
        this.serverUrl = process.env.CALDAV_URL!;
        this.username = process.env.CALDAV_USERNAME!;
        this.password = process.env.CALDAV_PASSWORD!;
        this.client = new dav.Client();
    }

    /**
     * Discover principal URL and calendars for the user
     */
    async discover() {
        const xhr = new dav.transport.Basic(
            new dav.Credentials({
                username: this.username,
                password: this.password,
            })
        );
        // Discover principal
        const account = await dav.createAccount({
            server: this.serverUrl,
            xhr,
            loadCollections: true,
            loadObjects: false,
        });
        this.principalUrl = account.rootUrl;
        this.calendars = account.calendars;
        return { principalUrl: this.principalUrl, calendars: this.calendars };
    }

    /**
     * List all user calendars
     */
    async listCalendars() {
        if (!this.calendars) {
            await this.discover();
        }
        return this.calendars;
    }

    /**
     * Get events from a specific calendar
     */
    async getEvents(calendarUrl?: string) {
        try {
            if (!this.calendars) await this.discover();
            const calendar = this.calendars?.[0]; // TODO: allow selection by calendarUrl
            if (!calendar) throw new Error('No calendar found');
            const objects = await dav.syncCalendar(calendar, {
                xhr: new dav.transport.Basic(
                    new dav.Credentials({
                        username: this.username,
                        password: this.password,
                    })
                ),
            });
            return objects.objects;
        } catch (error: any) {
            throw new Error('Error fetching events: ' + (error?.message || error));
        }
    }

    /**
     * Create an event in a specific calendar
     */
    async createEvent(eventIcs: string, calendarUrl?: string) {
        try {
            if (!this.calendars) await this.discover();
            const calendar = this.calendars?.[0]; // TODO: allow selection by calendarUrl
            if (!calendar) throw new Error('No calendar found');
            const xhr = new dav.transport.Basic(
                new dav.Credentials({
                    username: this.username,
                    password: this.password,
                })
            );
            const event = await dav.createObject(calendar, {
                data: eventIcs,
                filename: `event-${Date.now()}.ics`,
                xhr,
            });
            return event;
        } catch (error: any) {
            throw new Error('Error creating event: ' + (error?.message || error));
        }
    }

    /**
     * Update an event in a specific calendar
     */
    async updateEvent(eventUrl: string, eventIcs: string) {
        try {
            const xhr = new dav.transport.Basic(
                new dav.Credentials({
                    username: this.username,
                    password: this.password,
                })
            );
            const updated = await dav.updateObject({
                url: eventUrl,
                data: eventIcs,
                xhr,
            });
            return updated;
        } catch (error: any) {
            throw new Error('Error updating event: ' + (error?.message || error));
        }
    }

    /**
     * Delete an event by URL
     */
    async deleteEvent(eventUrl: string) {
        try {
            const xhr = new dav.transport.Basic(
                new dav.Credentials({
                    username: this.username,
                    password: this.password,
                })
            );
            await dav.deleteObject({ url: eventUrl, xhr });
        } catch (error: any) {
            throw new Error('Error deleting event: ' + (error?.message || error));
        }
    }

    /**
     * Convert internal task object to ICS string using ical-generator
     */
    mapTaskToIcs(task: any): string {
        const cal = ical({ name: 'ADHD Workflow' });
        cal.createEvent({
            id: task.id || `adhd-${Date.now()}`,
            summary: task.title || '',
            description: task.description || '',
            start: new Date(task.start),
            end: new Date(task.end),
            status: task.status,
            // completed: task.completed_at ? new Date(task.completed_at) : undefined, // not supported by ical-generator
        });
        return cal.toString();
    }

    /**
     * Convert ICS string to internal task object using node-ical
     */
    mapIcsEventToTask(ics: string): any {
        const parsed = nodeIcal.parseICS(ics);
        const event = Object.values(parsed).find((e: any) => e.type === 'VEVENT') as any;
        if (!event) return null;
        return {
            id: event.uid,
            title: event.summary,
            description: event.description,
            start: event.start ? event.start.toISOString() : undefined,
            end: event.end ? event.end.toISOString() : undefined,
            completed_at: event.completed ? event.completed.toISOString() : undefined,
            status: event.status,
        };
    }

    // Mock implementation for scheduled pulls
    async scheduledPull() {
        try {
            const events = await this.getEvents();
            // Process events as needed
            console.log('Scheduled pull completed:', events);
        } catch (error: any) {
            console.error('Error during scheduled pull:', error?.message || error);
        }
    }
}