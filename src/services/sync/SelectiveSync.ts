/**
 * Selective Sync
 * Phase 119: Selective synchronization
 */

import {SyncItem} from '../../api/sync';

export interface SyncFilter {
  sessionIds?: string[];
  types?: Array<'session' | 'sensor_data' | 'audio' | 'metadata'>;
  excludeAudio?: boolean;
  excludeSensorTypes?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}

export class SelectiveSync {
  private static instance: SelectiveSync;

  private constructor() {}

  public static getInstance(): SelectiveSync {
    if (!SelectiveSync.instance) {
      SelectiveSync.instance = new SelectiveSync();
    }
    return SelectiveSync.instance;
  }

  /**
   * Phase 119: Filter sync items based on criteria
   */
  public filterItems(items: SyncItem[], filter: SyncFilter): SyncItem[] {
    let filtered = [...items];

    // Filter by session IDs
    if (filter.sessionIds && filter.sessionIds.length > 0) {
      filtered = filtered.filter(item => 
        filter.sessionIds!.includes(item.localId)
      );
    }

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(item => 
        filter.types!.includes(item.type)
      );
    }

    // Exclude audio
    if (filter.excludeAudio) {
      filtered = filtered.filter(item => item.type !== 'audio');
    }

    // Exclude sensor types
    if (filter.excludeSensorTypes && filter.excludeSensorTypes.length > 0) {
      filtered = filtered.filter(item => {
        if (item.type === 'sensor_data' && item.data?.sensorType) {
          return !filter.excludeSensorTypes!.includes(item.data.sensorType);
        }
        return true;
      });
    }

    // Filter by date range
    if (filter.dateRange) {
      filtered = filtered.filter(item => 
        item.createdAt >= filter.dateRange!.start &&
        item.createdAt <= filter.dateRange!.end
      );
    }

    return filtered;
  }

  /**
   * Phase 119: Create filter for audio-only sync
   */
  public createAudioOnlyFilter(): SyncFilter {
    return {
      types: ['audio'],
    };
  }

  /**
   * Phase 119: Create filter for metadata-only sync
   */
  public createMetadataOnlyFilter(): SyncFilter {
    return {
      types: ['session', 'metadata'],
    };
  }

  /**
   * Phase 119: Create filter excluding audio (for mobile data)
   */
  public createNoAudioFilter(): SyncFilter {
    return {
      excludeAudio: true,
    };
  }
}

export const selectiveSync = SelectiveSync.getInstance();
export default selectiveSync;
