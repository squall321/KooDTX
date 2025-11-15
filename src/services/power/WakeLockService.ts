/**
 * Wake Lock Service
 * Phase 97: Keep screen on during recording
 *
 * Features:
 * - Keep screen awake during recording
 * - Minimize battery impact
 * - Optional wake lock (user settings)
 * - Background mode support
 * - Auto release on stop
 */

import {activateKeepAwake, deactivateKeepAwake} from 'react-native-keep-awake';

/**
 * Wake lock state
 */
export enum WakeLockState {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  ACTIVE = 'active',
  ERROR = 'error',
}

/**
 * Wake lock options
 */
export interface WakeLockOptions {
  enabled?: boolean; // Enable wake lock (default: true)
  tag?: string; // Wake lock tag for identification
}

/**
 * Wake lock statistics
 */
export interface WakeLockStats {
  isActive: boolean;
  tag: string | null;
  activatedAt: number | null;
  duration: number; // milliseconds
}

/**
 * Wake Lock Service
 * Manages screen wake lock during recording
 */
export class WakeLockService {
  private static instance: WakeLockService;

  // State
  private state: WakeLockState = WakeLockState.DISABLED;
  private tag: string | null = null;
  private activatedAt: number | null = null;

  // Configuration
  private enabled: boolean = true;

  /**
   * Private constructor (Singleton)
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): WakeLockService {
    if (!WakeLockService.instance) {
      WakeLockService.instance = new WakeLockService();
    }
    return WakeLockService.instance;
  }

  /**
   * Configure wake lock service
   * Phase 97: User settings
   *
   * @param options Wake lock options
   */
  public configure(options: WakeLockOptions): void {
    this.enabled = options.enabled ?? true;
    console.log(`WakeLockService configured: enabled=${this.enabled}`);
  }

  /**
   * Activate wake lock
   * Phase 97: Keep screen on
   *
   * @param tag Wake lock tag (e.g., session ID)
   */
  public async activate(tag?: string): Promise<void> {
    if (!this.enabled) {
      console.log('WakeLockService: Wake lock disabled by configuration');
      this.state = WakeLockState.DISABLED;
      return;
    }

    if (this.state === WakeLockState.ACTIVE) {
      console.warn('WakeLockService: Wake lock already active');
      return;
    }

    try {
      this.tag = tag || `wake-lock-${Date.now()}`;

      // Activate keep awake
      activateKeepAwake(this.tag);

      this.state = WakeLockState.ACTIVE;
      this.activatedAt = Date.now();

      console.log(`WakeLockService: Wake lock activated (tag: ${this.tag})`);

    } catch (error) {
      this.state = WakeLockState.ERROR;
      console.error('WakeLockService: Failed to activate wake lock:', error);
      throw error;
    }
  }

  /**
   * Deactivate wake lock
   * Phase 97: Release wake lock
   *
   * @param tag Wake lock tag (optional, must match activated tag)
   */
  public async deactivate(tag?: string): Promise<void> {
    if (this.state !== WakeLockState.ACTIVE) {
      console.warn('WakeLockService: Wake lock not active');
      return;
    }

    // Check tag match if provided
    if (tag && tag !== this.tag) {
      console.warn(`WakeLockService: Tag mismatch (expected: ${this.tag}, got: ${tag})`);
      return;
    }

    try {
      // Deactivate keep awake
      if (this.tag) {
        deactivateKeepAwake(this.tag);
      }

      const duration = this.activatedAt ? Date.now() - this.activatedAt : 0;
      console.log(`WakeLockService: Wake lock deactivated (duration: ${duration}ms)`);

      this.state = this.enabled ? WakeLockState.ENABLED : WakeLockState.DISABLED;
      this.tag = null;
      this.activatedAt = null;

    } catch (error) {
      this.state = WakeLockState.ERROR;
      console.error('WakeLockService: Failed to deactivate wake lock:', error);
      throw error;
    }
  }

  /**
   * Get current state
   */
  public getState(): WakeLockState {
    return this.state;
  }

  /**
   * Check if wake lock is active
   */
  public isActive(): boolean {
    return this.state === WakeLockState.ACTIVE;
  }

  /**
   * Check if wake lock is enabled in configuration
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current tag
   */
  public getTag(): string | null {
    return this.tag;
  }

  /**
   * Get statistics
   * Phase 97: Battery impact monitoring
   */
  public getStats(): WakeLockStats {
    const duration = this.activatedAt ? Date.now() - this.activatedAt : 0;

    return {
      isActive: this.isActive(),
      tag: this.tag,
      activatedAt: this.activatedAt,
      duration,
    };
  }

  /**
   * Force release wake lock (emergency cleanup)
   * Phase 97: Error handling
   */
  public async forceRelease(): Promise<void> {
    if (this.tag) {
      try {
        deactivateKeepAwake(this.tag);
        console.log('WakeLockService: Force released wake lock');
      } catch (error) {
        console.error('WakeLockService: Failed to force release:', error);
      }
    }

    this.state = this.enabled ? WakeLockState.ENABLED : WakeLockState.DISABLED;
    this.tag = null;
    this.activatedAt = null;
  }
}

/**
 * Export singleton instance
 */
export const wakeLockService = WakeLockService.getInstance();

/**
 * Export default
 */
export default wakeLockService;
