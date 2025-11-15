/**
 * Components exports
 * Central export point for all UI components
 */

export {ErrorBoundary} from './ErrorBoundary';
export {StepCounter} from './StepCounter';
export {AudioVisualizer} from './AudioVisualizer';
export {SensorCard} from './SensorCard';
export type {SensorCardProps, SensorData} from './SensorCard';
export { default as SyncProgress } from './SyncProgress';
export type { SyncProgressProps } from './SyncProgress';
export { default as SyncLog } from './SyncLog';
export type { SyncLogProps, SyncLogEntry } from './SyncLog';

// Authentication components (Phase 145)
export { default as AuthGuard } from './AuthGuard';
export { default as AuthProvider } from './AuthProvider';
export { withAuth } from './withAuth';
