/**
 * useNetworkStatus Hook
 *
 * 네트워크 연결 상태를 감지하는 React Hook
 * - 네트워크 연결 여부
 * - 연결 타입 (wifi, cellular, none)
 * - 연결 변경 이벤트
 */

import {useEffect, useState, useCallback} from 'react';
import NetInfo, {NetInfoState, NetInfoSubscription} from '@react-native-community/netinfo';

/**
 * 네트워크 연결 타입
 */
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';

/**
 * 네트워크 상태
 */
export interface NetworkStatus {
  isConnected: boolean;
  connectionType: ConnectionType;
  isInternetReachable: boolean | null;
}

/**
 * Hook 결과
 */
export interface UseNetworkStatusResult extends NetworkStatus {
  refresh: () => Promise<void>;
}

/**
 * NetInfo 타입을 ConnectionType으로 변환
 */
function mapConnectionType(type: string | null): ConnectionType {
  if (!type) return 'none';

  switch (type.toLowerCase()) {
    case 'wifi':
      return 'wifi';
    case 'cellular':
      return 'cellular';
    case 'ethernet':
      return 'ethernet';
    case 'none':
      return 'none';
    default:
      return 'unknown';
  }
}

/**
 * 네트워크 상태 감지 Hook
 */
export function useNetworkStatus(): UseNetworkStatusResult {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    connectionType: 'unknown',
    isInternetReachable: null,
  });

  // 네트워크 상태 업데이트
  const handleNetworkStateChange = useCallback((state: NetInfoState) => {
    setNetworkStatus({
      isConnected: state.isConnected ?? false,
      connectionType: mapConnectionType(state.type),
      isInternetReachable: state.isInternetReachable,
    });
  }, []);

  // 네트워크 상태 갱신
  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    handleNetworkStateChange(state);
  }, [handleNetworkStateChange]);

  useEffect(() => {
    // 초기 네트워크 상태 가져오기
    NetInfo.fetch().then(handleNetworkStateChange);

    // 네트워크 상태 변경 구독
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(handleNetworkStateChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkStateChange]);

  return {
    ...networkStatus,
    refresh,
  };
}
