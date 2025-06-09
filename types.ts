export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number; // Timestamp when the task was completed
  dueDate?: string; // YYYY-MM-DD format
  dueTime?: string; // HH:MM format
  priority?: PriorityLevel; 
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export enum PomodoroPhase {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // number of work sessions before a long break
}

// Google Calendar Event (simplified)
export interface GoogleCalendarEvent {
  id: string;
  summary: string; // Title of the event
  start: {
    dateTime?: string; // For timed events
    date?: string;     // For all-day events
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink: string; // Link to the event in Google Calendar
  isGoogleEvent?: boolean; // Flag to differentiate from local tasks
}

export interface GoogleAuthState {
  isSignedIn: boolean;
  user: any | null; // Can be replaced with a more specific user profile type
  error: Error | null;
  isLoading: boolean;
}

export type ActiveView = 'calendar' | 'tasks' | 'assistant' | 'pomodoro' | 'checklist' | 'help';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  proposedTasks?: ProposedTask[]; // Optional: AI might propose tasks
  tasksApproved?: boolean; // Optional: To indicate if tasks from this message were approved
}

export interface ProposedTask {
  id: string; // Temporary ID for UI
  text: string;
  suggestedDueDate?: string; // YYYY-MM-DD
  suggestedDueTime?: string; // HH:MM
  // suggestedPriority?: PriorityLevel; // Potential future enhancement
}

// Expected structure from Gemini for task breakdown
export interface GeminiTaskBreakdownResponse {
  conversationResponse: string;
  potentialTasks: Array<{
    taskDescription: string;
    suggestedDate?: string; // "YYYY-MM-DD" or "сегодня", "завтра"
    suggestedTime?: string; // "HH:MM" or "утро", "день", "вечер"
    // suggestedPriority?: PriorityLevel // Potential future enhancement
  }>;
}

export interface WeeklyRewardState {
  weekId: string; // e.g., "2023-W34"
  claimed: boolean;
}