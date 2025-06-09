
import { GoogleCalendarEvent } from '../types';

declare global {
  interface Window {
    gapi: any;
  }
}

// This function assumes that gapi.client and gapi.client.calendar are loaded by useGoogleAuth.
// It primarily focuses on setting the token and making the call.
export const listUpcomingEvents = async (accessToken: string | null, maxResults = 100): Promise<GoogleCalendarEvent[]> => {
  if (!accessToken) {
    console.warn('No access token provided for listUpcomingEvents.');
    // throw new Error('Access token is required to fetch Google Calendar events.');
    return []; // Or throw error
  }

  if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
    console.error('Google Calendar API client (gapi.client.calendar) is not loaded. This should be handled by useGoogleAuth.');
    throw new Error('Google Calendar API client not ready.');
  }
  
  try {
    window.gapi.client.setToken({ access_token: accessToken });
    console.log("Fetching Google Calendar events with GAPI client...");
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: maxResults,
      orderBy: 'startTime',
    });

    const events = response.result.items.map((event: any) => ({
      id: event.id,
      summary: event.summary || 'Без названия',
      start: event.start,
      end: event.end,
      htmlLink: event.htmlLink,
      isGoogleEvent: true,
    }));
    console.log("Fetched events:", events.length);
    return events;
  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error);
    let detailedMessage = 'Failed to fetch Google Calendar events.';
    if (error.result && error.result.error && error.result.error.message) {
        detailedMessage = `Google API Error: ${error.result.error.message}`;
    } else if (error.message) {
        detailedMessage = error.message;
    }
    // Potentially check for 401/403 to indicate token issues
    if (error.code === 401 || (error.result && error.result.error && error.result.error.code === 401)) {
        detailedMessage = "Ошибка авторизации при получении событий календаря. Попробуйте войти снова.";
        // Optionally, trigger a re-auth or token refresh if possible, or notify user.
    }
    throw new Error(detailedMessage);
  }
};

export const doesEventOccurOnDate = (event: GoogleCalendarEvent, dateString: string): boolean => {
  const targetDate = new Date(dateString + 'T00:00:00'); // Ensure local timezone midnight

  const eventStartStr = event.start?.date || event.start?.dateTime;
  const eventEndStr = event.end?.date || event.end?.dateTime;

  if (!eventStartStr || !eventEndStr) return false;

  const eventStartDate = new Date(eventStartStr);
  // For all-day events, Google Calendar's end date is exclusive.
  // e.g., an event on 2023-10-10 will have end.date = 2023-10-11.
  // For timed events, end.dateTime is inclusive.
  const eventEndDate = new Date(eventEndStr);
  
  // Normalize to date parts only for comparison
  eventStartDate.setHours(0,0,0,0);
  
  if(event.start?.date) { // All-day event
    // For all-day events, the actual end day is one day before the 'date' field in event.end
    const exclusiveEndDate = new Date(eventEndStr);
    exclusiveEndDate.setDate(exclusiveEndDate.getDate() -1);
    exclusiveEndDate.setHours(0,0,0,0);
    return targetDate >= eventStartDate && targetDate <= exclusiveEndDate;
  } else { // Timed event
     eventEndDate.setHours(0,0,0,0); // Consider timed events spanning multiple midnights
     return targetDate >= eventStartDate && targetDate <= eventEndDate;
  }
};
