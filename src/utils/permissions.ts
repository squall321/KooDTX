/**
 * Permissions Utility
 * Handles all permission requests for sensors and features
 */

import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  openSettings,
} from 'react-native-permissions';

/**
 * Permission status
 */
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  BLOCKED = 'blocked',
  UNAVAILABLE = 'unavailable',
}

/**
 * Permission type
 */
export enum PermissionType {
  ACTIVITY_RECOGNITION = 'activity_recognition',
  BODY_SENSORS = 'body_sensors',
  LOCATION_FINE = 'location_fine',
  LOCATION_COARSE = 'location_coarse',
  LOCATION_BACKGROUND = 'location_background',
  MICROPHONE = 'microphone',
  STORAGE_READ = 'storage_read',
  STORAGE_WRITE = 'storage_write',
}

/**
 * Permission result
 */
export interface PermissionResult {
  type: PermissionType;
  status: PermissionStatus;
  canRequest: boolean;
}

/**
 * Map permission types to platform-specific permissions
 */
const getPermissionForPlatform = (
  type: PermissionType,
): Permission | string | null => {
  if (Platform.OS === 'ios') {
    // iOS permissions
    switch (type) {
      case PermissionType.LOCATION_FINE:
      case PermissionType.LOCATION_COARSE:
        return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      case PermissionType.LOCATION_BACKGROUND:
        return PERMISSIONS.IOS.LOCATION_ALWAYS;
      case PermissionType.MICROPHONE:
        return PERMISSIONS.IOS.MICROPHONE;
      case PermissionType.BODY_SENSORS:
        return PERMISSIONS.IOS.MOTION; // iOS uses MOTION permission
      default:
        return null;
    }
  } else {
    // Android permissions
    switch (type) {
      case PermissionType.ACTIVITY_RECOGNITION:
        if (Platform.Version >= 29) {
          return PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION;
        }
        return null; // Not needed for API < 29
      case PermissionType.BODY_SENSORS:
        return PERMISSIONS.ANDROID.BODY_SENSORS;
      case PermissionType.LOCATION_FINE:
        return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      case PermissionType.LOCATION_COARSE:
        return PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
      case PermissionType.LOCATION_BACKGROUND:
        if (Platform.Version >= 29) {
          return PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
        }
        return null; // Not needed for API < 29
      case PermissionType.MICROPHONE:
        return PERMISSIONS.ANDROID.RECORD_AUDIO;
      case PermissionType.STORAGE_READ:
        if (Platform.Version >= 33) {
          return null; // Not needed for API >= 33 (scoped storage)
        }
        return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      case PermissionType.STORAGE_WRITE:
        if (Platform.Version >= 33) {
          return null; // Not needed for API >= 33 (scoped storage)
        }
        return PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
      default:
        return null;
    }
  }
};

/**
 * Convert react-native-permissions result to our PermissionStatus
 */
const convertPermissionResult = (result: string): PermissionStatus => {
  switch (result) {
    case RESULTS.GRANTED:
      return PermissionStatus.GRANTED;
    case RESULTS.DENIED:
      return PermissionStatus.DENIED;
    case RESULTS.BLOCKED:
    case RESULTS.LIMITED:
      return PermissionStatus.BLOCKED;
    case RESULTS.UNAVAILABLE:
    default:
      return PermissionStatus.UNAVAILABLE;
  }
};

/**
 * Check single permission status
 */
export async function checkPermission(
  type: PermissionType,
): Promise<PermissionResult> {
  try {
    const permission = getPermissionForPlatform(type);

    if (!permission) {
      // Permission not required on this platform/version
      return {
        type,
        status: PermissionStatus.GRANTED,
        canRequest: false,
      };
    }

    const result = await check(permission as Permission);
    const status = convertPermissionResult(result);

    return {
      type,
      status,
      canRequest: status === PermissionStatus.DENIED,
    };
  } catch (error) {
    console.error(`Error checking permission ${type}:`, error);
    return {
      type,
      status: PermissionStatus.UNAVAILABLE,
      canRequest: false,
    };
  }
}

/**
 * Request single permission
 */
export async function requestPermission(
  type: PermissionType,
): Promise<PermissionResult> {
  try {
    const permission = getPermissionForPlatform(type);

    if (!permission) {
      // Permission not required on this platform/version
      return {
        type,
        status: PermissionStatus.GRANTED,
        canRequest: false,
      };
    }

    const result = await request(permission as Permission);
    const status = convertPermissionResult(result);

    return {
      type,
      status,
      canRequest: status === PermissionStatus.DENIED,
    };
  } catch (error) {
    console.error(`Error requesting permission ${type}:`, error);
    return {
      type,
      status: PermissionStatus.UNAVAILABLE,
      canRequest: false,
    };
  }
}

/**
 * Check multiple permissions
 */
export async function checkPermissions(
  types: PermissionType[],
): Promise<PermissionResult[]> {
  const results = await Promise.all(types.map(type => checkPermission(type)));
  return results;
}

/**
 * Request multiple permissions
 */
export async function requestPermissions(
  types: PermissionType[],
): Promise<PermissionResult[]> {
  const results = await Promise.all(types.map(type => requestPermission(type)));
  return results;
}

/**
 * Check if all permissions are granted
 */
export async function areAllPermissionsGranted(
  types: PermissionType[],
): Promise<boolean> {
  const results = await checkPermissions(types);
  return results.every(r => r.status === PermissionStatus.GRANTED);
}

/**
 * Get permission name for display
 */
export function getPermissionName(type: PermissionType): string {
  switch (type) {
    case PermissionType.ACTIVITY_RECOGNITION:
      return 'Activity Recognition';
    case PermissionType.BODY_SENSORS:
      return 'Body Sensors';
    case PermissionType.LOCATION_FINE:
      return 'Precise Location';
    case PermissionType.LOCATION_COARSE:
      return 'Approximate Location';
    case PermissionType.LOCATION_BACKGROUND:
      return 'Background Location';
    case PermissionType.MICROPHONE:
      return 'Microphone';
    case PermissionType.STORAGE_READ:
      return 'Storage Read';
    case PermissionType.STORAGE_WRITE:
      return 'Storage Write';
    default:
      return type;
  }
}

/**
 * Get permission description/rationale
 */
export function getPermissionRationale(type: PermissionType): string {
  switch (type) {
    case PermissionType.ACTIVITY_RECOGNITION:
      return 'This app needs access to activity recognition to detect steps and classify walking/running activities.';
    case PermissionType.BODY_SENSORS:
      return 'This app needs access to body sensors (like heart rate, temperature, humidity sensors) to collect health data.';
    case PermissionType.LOCATION_FINE:
      return 'This app needs access to your precise location to record GPS coordinates during sensor data collection.';
    case PermissionType.LOCATION_COARSE:
      return 'This app needs access to your approximate location to record GPS coordinates during sensor data collection.';
    case PermissionType.LOCATION_BACKGROUND:
      return 'This app needs background location access to continue recording location data when the app is in the background.';
    case PermissionType.MICROPHONE:
      return 'This app needs access to your microphone to record audio during sensor data collection sessions.';
    case PermissionType.STORAGE_READ:
      return 'This app needs storage read permission to access saved sensor data files.';
    case PermissionType.STORAGE_WRITE:
      return 'This app needs storage write permission to save sensor data and audio recordings.';
    default:
      return `This app needs access to ${getPermissionName(type)}.`;
  }
}

/**
 * Show permission rationale dialog
 */
export function showPermissionRationale(
  type: PermissionType,
  onAccept: () => void,
  onDecline: () => void,
): void {
  Alert.alert(
    `${getPermissionName(type)} Permission`,
    getPermissionRationale(type),
    [
      {
        text: 'Cancel',
        onPress: onDecline,
        style: 'cancel',
      },
      {
        text: 'Grant Permission',
        onPress: onAccept,
      },
    ],
    {cancelable: false},
  );
}

/**
 * Show permission blocked dialog (directs to settings)
 */
export function showPermissionBlockedDialog(type: PermissionType): void {
  Alert.alert(
    'Permission Required',
    `${getPermissionName(type)} permission is required for this feature. Please enable it in app settings.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => openSettings(),
      },
    ],
    {cancelable: false},
  );
}

/**
 * Request sensor permissions (Activity Recognition + Body Sensors)
 */
export async function requestSensorPermissions(): Promise<{
  allGranted: boolean;
  results: PermissionResult[];
}> {
  const types: PermissionType[] = [
    PermissionType.ACTIVITY_RECOGNITION,
    PermissionType.BODY_SENSORS,
  ];

  const results = await requestPermissions(types);
  const allGranted = results.every(r => r.status === PermissionStatus.GRANTED);

  return {allGranted, results};
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(
  includeBackground: boolean = false,
): Promise<{
  allGranted: boolean;
  results: PermissionResult[];
}> {
  const types: PermissionType[] = [
    PermissionType.LOCATION_FINE,
    PermissionType.LOCATION_COARSE,
  ];

  if (includeBackground) {
    types.push(PermissionType.LOCATION_BACKGROUND);
  }

  const results = await requestPermissions(types);
  const allGranted = results.every(r => r.status === PermissionStatus.GRANTED);

  return {allGranted, results};
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<PermissionResult> {
  return await requestPermission(PermissionType.MICROPHONE);
}

/**
 * Request storage permissions
 */
export async function requestStoragePermissions(): Promise<{
  allGranted: boolean;
  results: PermissionResult[];
}> {
  const types: PermissionType[] = [
    PermissionType.STORAGE_READ,
    PermissionType.STORAGE_WRITE,
  ];

  const results = await requestPermissions(types);
  const allGranted = results.every(r => r.status === PermissionStatus.GRANTED);

  return {allGranted, results};
}

/**
 * Request all app permissions
 */
export async function requestAllAppPermissions(): Promise<{
  allGranted: boolean;
  byCategory: {
    sensors: PermissionResult[];
    location: PermissionResult[];
    microphone: PermissionResult[];
    storage: PermissionResult[];
  };
  denied: PermissionResult[];
  blocked: PermissionResult[];
}> {
  // Request permissions in sequence to avoid overwhelming the user
  const sensorResults = await requestSensorPermissions();
  const locationResults = await requestLocationPermissions(false);
  const microphoneResult = await requestMicrophonePermission();
  const storageResults = await requestStoragePermissions();

  const allResults = [
    ...sensorResults.results,
    ...locationResults.results,
    microphoneResult,
    ...storageResults.results,
  ];

  const denied = allResults.filter(r => r.status === PermissionStatus.DENIED);
  const blocked = allResults.filter(r => r.status === PermissionStatus.BLOCKED);
  const allGranted = allResults.every(
    r => r.status === PermissionStatus.GRANTED,
  );

  return {
    allGranted,
    byCategory: {
      sensors: sensorResults.results,
      location: locationResults.results,
      microphone: [microphoneResult],
      storage: storageResults.results,
    },
    denied,
    blocked,
  };
}

/**
 * Get permission status summary
 */
export async function getPermissionStatusSummary(): Promise<{
  totalPermissions: number;
  granted: number;
  denied: number;
  blocked: number;
  unavailable: number;
  details: PermissionResult[];
}> {
  const allTypes = Object.values(PermissionType);
  const details = await checkPermissions(allTypes);

  const granted = details.filter(
    r => r.status === PermissionStatus.GRANTED,
  ).length;
  const denied = details.filter(
    r => r.status === PermissionStatus.DENIED,
  ).length;
  const blocked = details.filter(
    r => r.status === PermissionStatus.BLOCKED,
  ).length;
  const unavailable = details.filter(
    r => r.status === PermissionStatus.UNAVAILABLE,
  ).length;

  return {
    totalPermissions: allTypes.length,
    granted,
    denied,
    blocked,
    unavailable,
    details,
  };
}

/**
 * Check if app has minimum required permissions to function
 */
export async function hasMinimumRequiredPermissions(): Promise<boolean> {
  // Minimum required: at least one sensor permission (activity recognition or body sensors)
  const sensorCheck = await checkPermissions([
    PermissionType.ACTIVITY_RECOGNITION,
    PermissionType.BODY_SENSORS,
  ]);

  return sensorCheck.some(r => r.status === PermissionStatus.GRANTED);
}
