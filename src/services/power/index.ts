/**
 * Power Management Services
 * Phase 97: Wake lock and battery optimization
 * Phase 98: Dynamic sampling rate adjustment
 */

export {
  WakeLockService,
  wakeLockService,
  WakeLockState,
  type WakeLockOptions,
  type WakeLockStats,
} from './WakeLockService';

export {
  BatteryMonitorService,
  batteryMonitorService,
  BatteryState,
  PowerMode,
  type BatteryInfo,
  type BatteryThresholds,
  type BatteryEvent,
  type BatteryEventListener,
} from './BatteryMonitorService';

export default wakeLockService;
