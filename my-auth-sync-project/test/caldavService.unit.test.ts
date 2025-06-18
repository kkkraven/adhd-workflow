import { describe, it, expect } from 'vitest';
import { CalDAVService } from '../src/services/caldavService';

describe('CalDAVService ICS mapping', () => {
  const service = new CalDAVService();
  const task = {
    id: 'test-uid',
    title: 'Test Task',
    description: 'Test Description',
    start: '2025-06-18T10:00:00Z',
    end: '2025-06-18T11:00:00Z',
    completed_at: '2025-06-18T12:00:00Z',
    status: 'COMPLETED',
  };

  it('should convert task to ICS and back', () => {
    const ics = service.mapTaskToIcs(task);
    expect(typeof ics).toBe('string');
    const parsed = service.mapIcsEventToTask(ics);
    expect(parsed.id).toBe(task.id);
    expect(parsed.title).toBe(task.title);
    expect(parsed.description).toBe(task.description);
    expect(new Date(parsed.start).toISOString()).toBe(new Date(task.start).toISOString());
    expect(new Date(parsed.end).toISOString()).toBe(new Date(task.end).toISOString());
    expect(parsed.status).toBe(task.status);
  });
});
