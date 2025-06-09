
import { PomodoroSettings } from './types';

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export const APP_TITLE = "ADHD Workflow";

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

// IMPORTANT: Replace with your own Google Cloud Project credentials
// You can get these from https://console.cloud.google.com/
export const GOOGLE_CLIENT_ID = '425351570592-6ecpcjvjgl0iqaq8vlnoqqanu5opomdt.apps.googleusercontent.com';

// IMPORTANT: This is your API Key. Ensure it's correctly configured in Google Cloud Console
// and has permissions for Google Calendar API.
export const GOOGLE_API_KEY = 'AIzaSyBPlHxliX1u0Mm72KoskeQgaVkZVFAGYOg';

// Scopes for Google Calendar API (read-only access to events)
export const GOOGLE_CALENDAR_SCOPES = 'https://www.googleapis.com/auth/calendar.events.readonly';

// Discovery document for Google Calendar API
export const GOOGLE_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];