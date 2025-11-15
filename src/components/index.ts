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

// UI components (Phase 146-150)
export { default as SplashScreen } from './SplashScreen';
export { default as LoadingIndicator, LoadingPresets } from './LoadingIndicator';
export type { LoadingSize } from './LoadingIndicator';
export { default as ErrorMessage, ErrorPresets } from './ErrorMessage';
export type { ErrorType } from './ErrorMessage';
export { default as Toast, toast, toastConfig } from './Toast';
export { default as Dialog, DialogManager } from './Dialog';
export type { DialogType, DialogButton } from './Dialog';
