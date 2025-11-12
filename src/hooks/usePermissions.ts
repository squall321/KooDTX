/**
 * usePermissions Hook
 * Handles sensor and location permissions for Android and iOS
 */

import {useEffect, useState, useCallback} from 'react';
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface PermissionsState {
  location: PermissionStatus;
  sensors: PermissionStatus;
  microphone: PermissionStatus;
}

export interface UsePermissionsResult {
  permissions: PermissionsState;
  isLoading: boolean;
  requestPermissions: () => Promise<boolean>;
  openSettings: () => void;
}

/**
 * Hook for managing app permissions
 */
export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] = useState<PermissionsState>({
    location: 'unavailable',
    sensors: 'unavailable',
    microphone: 'unavailable',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const locationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const micGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        setPermissions({
          location: locationGranted ? 'granted' : 'denied',
          sensors: 'granted', // Android sensors don't need runtime permission
          microphone: micGranted ? 'granted' : 'denied',
        });
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }
    } else if (Platform.OS === 'ios') {
      // iOS permissions are checked at runtime
      // For now, assume unavailable until requested
      setPermissions({
        location: 'unavailable',
        sensors: 'unavailable',
        microphone: 'unavailable',
      });
    }
  }, []);

  // Request all necessary permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (Platform.OS === 'android') {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const locationGranted =
          results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;

        const micGranted =
          results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;

        setPermissions({
          location: locationGranted ? 'granted' : 'denied',
          sensors: 'granted',
          microphone: micGranted ? 'granted' : 'denied',
        });

        setIsLoading(false);

        // Check if all required permissions are granted
        return locationGranted;
      } else if (Platform.OS === 'ios') {
        // iOS permissions are handled by the Info.plist descriptions
        // and are requested when the feature is first used
        setPermissions({
          location: 'granted',
          sensors: 'granted',
          microphone: 'granted',
        });

        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Open app settings
  const openSettings = useCallback(() => {
    Alert.alert(
      '권한 필요',
      '센서 데이터를 수집하려면 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
      [
        {text: '취소', style: 'cancel'},
        {text: '설정 열기', onPress: () => Linking.openSettings()},
      ],
    );
  }, []);

  return {
    permissions,
    isLoading,
    requestPermissions,
    openSettings,
  };
}
