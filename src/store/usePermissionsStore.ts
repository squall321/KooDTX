/**
 * Permissions Store
 * Global state management for app permissions using Zustand
 */

import {create} from 'zustand';
import {
  PermissionType,
  PermissionStatus,
  PermissionResult,
  checkPermissions,
  requestPermission,
  requestPermissions,
  requestAllAppPermissions,
  getPermissionStatusSummary,
} from '@utils/permissions';

/**
 * Permission state for a single permission type
 */
interface PermissionState {
  status: PermissionStatus;
  canRequest: boolean;
  lastChecked?: number;
}

/**
 * Permissions store state
 */
interface PermissionsState {
  // Permission states by type
  permissions: Record<PermissionType, PermissionState>;

  // Loading state
  isLoading: boolean;
  isRequesting: boolean;

  // Summary statistics
  summary: {
    totalPermissions: number;
    granted: number;
    denied: number;
    blocked: number;
    unavailable: number;
  };

  // Actions
  checkAllPermissions: () => Promise<void>;
  checkPermission: (type: PermissionType) => Promise<void>;
  requestPermission: (type: PermissionType) => Promise<boolean>;
  requestMultiplePermissions: (types: PermissionType[]) => Promise<boolean>;
  requestAllPermissions: () => Promise<boolean>;
  updatePermissionState: (type: PermissionType, result: PermissionResult) => void;
  reset: () => void;
}

/**
 * Initial permission state
 */
const createInitialPermissionState = (): PermissionState => ({
  status: PermissionStatus.UNAVAILABLE,
  canRequest: false,
  lastChecked: undefined,
});

/**
 * Initial permissions map
 */
const createInitialPermissions = (): Record<
  PermissionType,
  PermissionState
> => {
  const permissions: Partial<Record<PermissionType, PermissionState>> = {};
  Object.values(PermissionType).forEach(type => {
    permissions[type] = createInitialPermissionState();
  });
  return permissions as Record<PermissionType, PermissionState>;
};

/**
 * Initial summary
 */
const createInitialSummary = () => ({
  totalPermissions: Object.values(PermissionType).length,
  granted: 0,
  denied: 0,
  blocked: 0,
  unavailable: Object.values(PermissionType).length,
});

/**
 * Permissions store
 */
export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  permissions: createInitialPermissions(),
  isLoading: false,
  isRequesting: false,
  summary: createInitialSummary(),

  /**
   * Check all permissions status
   */
  checkAllPermissions: async () => {
    set({isLoading: true});

    try {
      const summary = await getPermissionStatusSummary();

      // Update individual permission states
      const updatedPermissions = {...get().permissions};
      summary.details.forEach(result => {
        updatedPermissions[result.type] = {
          status: result.status,
          canRequest: result.canRequest,
          lastChecked: Date.now(),
        };
      });

      set({
        permissions: updatedPermissions,
        summary: {
          totalPermissions: summary.totalPermissions,
          granted: summary.granted,
          denied: summary.denied,
          blocked: summary.blocked,
          unavailable: summary.unavailable,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking all permissions:', error);
      set({isLoading: false});
    }
  },

  /**
   * Check single permission status
   */
  checkPermission: async (type: PermissionType) => {
    try {
      const results = await checkPermissions([type]);
      if (results.length > 0) {
        get().updatePermissionState(type, results[0]);
      }
    } catch (error) {
      console.error(`Error checking permission ${type}:`, error);
    }
  },

  /**
   * Request single permission
   */
  requestPermission: async (type: PermissionType): Promise<boolean> => {
    set({isRequesting: true});

    try {
      const result = await requestPermission(type);
      get().updatePermissionState(type, result);
      set({isRequesting: false});

      return result.status === PermissionStatus.GRANTED;
    } catch (error) {
      console.error(`Error requesting permission ${type}:`, error);
      set({isRequesting: false});
      return false;
    }
  },

  /**
   * Request multiple permissions
   */
  requestMultiplePermissions: async (
    types: PermissionType[],
  ): Promise<boolean> => {
    set({isRequesting: true});

    try {
      const results = await requestPermissions(types);
      results.forEach(result => {
        get().updatePermissionState(result.type, result);
      });
      set({isRequesting: false});

      return results.every(r => r.status === PermissionStatus.GRANTED);
    } catch (error) {
      console.error('Error requesting multiple permissions:', error);
      set({isRequesting: false});
      return false;
    }
  },

  /**
   * Request all app permissions
   */
  requestAllPermissions: async (): Promise<boolean> => {
    set({isRequesting: true});

    try {
      const result = await requestAllAppPermissions();

      // Update all permission states
      const allResults = [
        ...result.byCategory.sensors,
        ...result.byCategory.location,
        ...result.byCategory.microphone,
        ...result.byCategory.storage,
      ];

      allResults.forEach(permResult => {
        get().updatePermissionState(permResult.type, permResult);
      });

      set({isRequesting: false});

      return result.allGranted;
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      set({isRequesting: false});
      return false;
    }
  },

  /**
   * Update permission state
   */
  updatePermissionState: (type: PermissionType, result: PermissionResult) => {
    const updatedPermissions = {...get().permissions};
    updatedPermissions[type] = {
      status: result.status,
      canRequest: result.canRequest,
      lastChecked: Date.now(),
    };

    // Recalculate summary
    const states = Object.values(updatedPermissions);
    const summary = {
      totalPermissions: states.length,
      granted: states.filter(s => s.status === PermissionStatus.GRANTED).length,
      denied: states.filter(s => s.status === PermissionStatus.DENIED).length,
      blocked: states.filter(s => s.status === PermissionStatus.BLOCKED).length,
      unavailable: states.filter(s => s.status === PermissionStatus.UNAVAILABLE)
        .length,
    };

    set({
      permissions: updatedPermissions,
      summary,
    });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      permissions: createInitialPermissions(),
      isLoading: false,
      isRequesting: false,
      summary: createInitialSummary(),
    });
  },
}));

/**
 * Selectors for easier access
 */

// Check if permission is granted
export const useIsPermissionGranted = (type: PermissionType): boolean => {
  return usePermissionsStore(
    state => state.permissions[type].status === PermissionStatus.GRANTED,
  );
};

// Check if any permission is denied
export const useHasDeniedPermissions = (): boolean => {
  return usePermissionsStore(state => state.summary.denied > 0);
};

// Check if any permission is blocked
export const useHasBlockedPermissions = (): boolean => {
  return usePermissionsStore(state => state.summary.blocked > 0);
};

// Get all granted permissions
export const useGrantedPermissions = (): PermissionType[] => {
  return usePermissionsStore(state =>
    Object.entries(state.permissions)
      .filter(([_, perm]) => perm.status === PermissionStatus.GRANTED)
      .map(([type]) => type as PermissionType),
  );
};

// Get all denied permissions
export const useDeniedPermissions = (): PermissionType[] => {
  return usePermissionsStore(state =>
    Object.entries(state.permissions)
      .filter(([_, perm]) => perm.status === PermissionStatus.DENIED)
      .map(([type]) => type as PermissionType),
  );
};

// Get all blocked permissions
export const useBlockedPermissions = (): PermissionType[] => {
  return usePermissionsStore(state =>
    Object.entries(state.permissions)
      .filter(([_, perm]) => perm.status === PermissionStatus.BLOCKED)
      .map(([type]) => type as PermissionType),
  );
};

// Check if all required permissions are granted
export const useAreRequiredPermissionsGranted = (
  requiredTypes: PermissionType[],
): boolean => {
  return usePermissionsStore(state =>
    requiredTypes.every(
      type => state.permissions[type].status === PermissionStatus.GRANTED,
    ),
  );
};

// Get permission summary
export const usePermissionSummary = () => {
  return usePermissionsStore(state => state.summary);
};

// Get loading state
export const usePermissionsLoading = (): boolean => {
  return usePermissionsStore(state => state.isLoading);
};

// Get requesting state
export const usePermissionsRequesting = (): boolean => {
  return usePermissionsStore(state => state.isRequesting);
};
