import { fetchUserCalendars, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../../services/backendApi';
import ICAL from 'ical.js';
import ical from 'ical-generator';
import * as nodeIcal from 'node-ical';

export class CalDAVService {
    private serverUrl: string;
    private username: string;
    private password: string;
    private principalUrl?: string;
    private calendars?: dav.Calendar[];

    constructor() {
        this.serverUrl = process.env.CALDAV_URL!;
        this.username = process.env.CALDAV_USERNAME!;
        this.password = process.env.CALDAV_PASSWORD!;
    }

    /**
     * Discover principal URL and calendars for the user
     */
    async discover() {
        // Implementation for discovering calendars from backend API if needed
    }

    /**
     * List all user calendars
     */
    async listCalendars() {
        try {
            const calendars = await fetchUserCalendars();
            return calendars;
        } catch (error: any) {
            throw new Error('Error fetching calendars: ' + (error?.message || error));
        }
    }

    /**
     * Get events from a specific calendar
     */
    async getEvents(calendarId: string) {
        try {
            const events = await fetchUserCalendars(calendarId); // Assuming backend API supports fetching events by calendar ID
            return events;
        } catch (error: any) {
            throw new Error('Error fetching events: ' + (error?.message || error));
        }
    }

    /**
     * Create an event in a specific calendar
     */
    async createEvent(eventData: any, calendarId: string) {
        try {
            const event = await createCalendarEvent(eventData, calendarId);
            return event;
        } catch (error: any) {
            throw new Error('Error creating event: ' + (error?.message || error));
        }
    }

    /**
     * Update an event in a specific calendar
     */
    async updateEvent(eventId: string, eventData: any) {
        try {
            const updatedEvent = await updateCalendarEvent(eventId, eventData);
            return updatedEvent;
        } catch (error: any) {
            throw new Error('Error updating event: ' + (error?.message || error));
        }
    }

    /**
     * Delete an event by URL
     */
    async deleteEvent(eventId: string) {
        try {
            await deleteCalendarEvent(eventId);
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
            const calendarId = 'default'; // Replace with actual logic to determine calendar ID
            const events = await this.getEvents(calendarId);
            // Process events as needed
            console.log('Scheduled pull completed:', events);
        } catch (error: any) {
            console.error('Error during scheduled pull:', error?.message || error);
        }
    }
}