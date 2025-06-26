export type ActiveView = 'calendar' | 'tasks' | 'assistant' | 'pomodoro' | 'checklist' | 'help';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorScheme = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

export type InterfaceSettings = {
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
  reducedMotion: boolean;
};

export type ThemeSettings = {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  interface: InterfaceSettings;
};

// Тип задачи для Google Tasks API
export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // ISO строка даты
  completed?: string; // ISO строка даты
  updated?: string; // ISO строка даты
}

// Обновляю Task для совместимости с Google Tasks (добавляю updated)
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date | string;
  updated?: string; // Для синхронизации с Google Tasks
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
} 