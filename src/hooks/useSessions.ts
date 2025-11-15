/**
 * useSessions Hook
 * Phase 128: WatermelonDB integration for sessions list
 *
 * Real-time session list with WatermelonDB observe()
 */

import { useState, useEffect } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database, RecordingSession } from '../database';
import type { SensorType } from '@app-types/sensor.types';
import {logger} from '../utils/logger';

export type UploadStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface SessionData {
  id: string;
  sessionId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  sensorCount: number;
  audioFile?: string;
  isSynced: boolean;
  isActive: boolean;
  enabledSensors: SensorType[];
  notes?: string;
  fileCount: number;
  totalSize: number; // in bytes
  uploadStatus: UploadStatus;
  uploadProgress?: number; // 0-100
}

export type SortOption = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc' | 'name-asc' | 'name-desc';

export interface UseSessionsOptions {
  includeActive?: boolean;
  syncedOnly?: boolean;
  limit?: number;
}

export interface UseSessionsReturn {
  sessions: SessionData[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

const convertToSessionData = (session: RecordingSession): SessionData => {
  const startTime = session.startTime;
  const endTime = session.endTime || Date.now();
  const duration = endTime - startTime;

  // Calculate file count (1 for session metadata + enabled sensors)
  const fileCount = 1 + (session.enabledSensors?.length || 0);

  // Estimate total size based on data count and sensors
  // Rough estimate: ~50 bytes per sensor data point
  const estimatedSize = (session.dataCount || 0) * 50;

  // Determine upload status
  let uploadStatus: UploadStatus = 'pending';
  if (session.isUploaded) {
    uploadStatus = 'completed';
  } else if (session.isActive) {
    uploadStatus = 'pending';
  }

  return {
    id: session.id,
    sessionId: session.sessionId,
    name: session.notes || `Session ${session.sessionId.slice(0, 8)}`,
    startTime,
    endTime: session.endTime,
    duration,
    sensorCount: session.dataCount || 0,
    audioFile: undefined, // TODO: Check if audio file exists
    isSynced: session.isUploaded || false,
    isActive: session.isActive,
    enabledSensors: session.enabledSensors,
    notes: session.notes,
    fileCount,
    totalSize: estimatedSize,
    uploadStatus,
    uploadProgress: session.isUploaded ? 100 : 0,
  };
};

export const useSessions = (options: UseSessionsOptions = {}): UseSessionsReturn => {
  const { includeActive = true, syncedOnly = false, limit } = options;

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const collection = database.get<RecordingSession>('recording_sessions');

      // Build query based on options
      const conditions: any[] = [];

      if (!includeActive) {
        conditions.push(Q.where('is_active', false));
      }

      if (syncedOnly) {
        conditions.push(Q.where('is_uploaded', true));
      }

      let query = collection.query(
        ...conditions,
        Q.sortBy('start_time', Q.desc)
      );

      if (limit) {
        query = query.extend(Q.take(limit));
      }

      const results = await query.fetch();
      const sessionData = results.map(convertToSessionData);
      setSessions(sessionData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Observe sessions for real-time updates
  useEffect(() => {
    const collection = database.get<RecordingSession>('recording_sessions');

    // Build query based on options
    const conditions: any[] = [];

    if (!includeActive) {
      conditions.push(Q.where('is_active', false));
    }

    if (syncedOnly) {
      conditions.push(Q.where('is_uploaded', true));
    }

    let query = collection.query(
      ...conditions,
      Q.sortBy('start_time', Q.desc)
    );

    if (limit) {
      query = query.extend(Q.take(limit));
    }

    // Subscribe to real-time updates
    const subscription = query.observe().subscribe({
      next: (results) => {
        const sessionData = results.map(convertToSessionData);
        setSessions(sessionData);
        setIsLoading(false);
      },
      error: (err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
        logger.error('Session observation error:', error);
      },
    });

    return () => subscription.unsubscribe();
  }, [includeActive, syncedOnly, limit]);

  const refresh = async () => {
    await loadSessions();
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const collection = database.get<RecordingSession>('recording_sessions');
      const session = await collection.find(sessionId);

      await database.write(async () => {
        await session.destroyPermanently();
      });

      // Also delete related sensor data and audio recordings
      // TODO: Implement cascade delete for sensor_data and audio_recordings
    } catch (err) {
      logger.error('Failed to delete session:', err);
      throw err;
    }
  };

  return {
    sessions,
    isLoading,
    error,
    refresh,
    deleteSession,
  };
};

/**
 * Sort sessions client-side
 */
export const sortSessions = (sessions: SessionData[], sortOption: SortOption): SessionData[] => {
  const sorted = [...sessions];

  sorted.sort((a, b) => {
    switch (sortOption) {
      case 'date-desc':
        return b.startTime - a.startTime;
      case 'date-asc':
        return a.startTime - b.startTime;
      case 'duration-desc':
        return b.duration - a.duration;
      case 'duration-asc':
        return a.duration - b.duration;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return sorted;
};

/**
 * Filter sessions client-side
 */
export const filterSessions = (
  sessions: SessionData[],
  searchQuery: string,
  syncFilter: 'all' | 'synced' | 'unsynced'
): SessionData[] => {
  let filtered = [...sessions];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((session) =>
      session.name.toLowerCase().includes(query) ||
      session.sessionId.toLowerCase().includes(query)
    );
  }

  // Sync status filter
  if (syncFilter === 'synced') {
    filtered = filtered.filter((session) => session.isSynced);
  } else if (syncFilter === 'unsynced') {
    filtered = filtered.filter((session) => !session.isSynced);
  }

  return filtered;
};

export default useSessions;
