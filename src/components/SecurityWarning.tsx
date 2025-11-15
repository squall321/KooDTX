/**
 * Security Warning Component
 * Phase 172: Display security warnings for rooted/jailbroken devices
 *
 * Features:
 * - Show security warnings
 * - Allow user to continue (optional)
 * - Restrict features based on security level
 * - Log security events
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  performSecurityCheck,
  getSecurityLevel,
  getSecurityWarningMessage,
  logSecurityCheck,
  SecurityCheckResult,
} from '@utils/deviceSecurity';

export interface SecurityWarningProps {
  onAcceptRisk?: () => void;
  onReject?: () => void;
  allowBypass?: boolean;
  autoCheck?: boolean;
  showDetails?: boolean;
}

export const SecurityWarning: React.FC<SecurityWarningProps> = ({
  onAcceptRisk,
  onReject,
  allowBypass = true,
  autoCheck = true,
  showDetails = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [securityResult, setSecurityResult] = useState<SecurityCheckResult | null>(null);

  useEffect(() => {
    if (autoCheck) {
      checkSecurity();
    }
  }, [autoCheck]);

  const checkSecurity = () => {
    const result = performSecurityCheck();
    setSecurityResult(result);

    if (result.isCompromised) {
      setVisible(true);
      logSecurityCheck(result);
    }
  };

  const handleAcceptRisk = () => {
    setVisible(false);
    onAcceptRisk?.();
  };

  const handleReject = () => {
    setVisible(false);
    onReject?.();
  };

  const getSecurityLevelColor = () => {
    const level = getSecurityLevel();
    switch (level) {
      case 'compromised':
        return '#d32f2f';
      case 'warning':
        return '#f57c00';
      default:
        return '#388e3c';
    }
  };

  const getSecurityLevelText = () => {
    const level = getSecurityLevel();
    switch (level) {
      case 'compromised':
        return 'Device Compromised';
      case 'warning':
        return 'Security Warning';
      default:
        return 'Device Secure';
    }
  };

  if (!visible || !securityResult) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleReject}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: getSecurityLevelColor() }]}>
            <Text style={styles.headerText}>⚠️ {getSecurityLevelText()}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>{getSecurityWarningMessage()}</Text>

            {showDetails && securityResult.warnings.length > 0 && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Issues Detected:</Text>
                {securityResult.warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningItem}>
                    • {warning}
                  </Text>
                ))}
              </View>
            )}

            {showDetails && securityResult.recommendations.length > 0 && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Recommendations:</Text>
                {securityResult.recommendations.map((rec, index) => (
                  <Text key={index} style={styles.recommendationItem}>
                    • {rec}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.disclaimer}>
              Using this app on a compromised device may pose security risks.
              We recommend using a secure device for sensitive operations.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {allowBypass && (
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={handleAcceptRisk}
              >
                <Text style={styles.buttonText}>Continue Anyway</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.buttonText}>Close App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Hook for security check
 */
export const useSecurityCheck = (options: {
  autoCheck?: boolean;
  onCompromised?: (result: SecurityCheckResult) => void;
} = {}) => {
  const [securityResult, setSecurityResult] = useState<SecurityCheckResult | null>(null);
  const [isCompromised, setIsCompromised] = useState(false);

  useEffect(() => {
    if (options.autoCheck !== false) {
      const result = performSecurityCheck();
      setSecurityResult(result);
      setIsCompromised(result.isCompromised);

      if (result.isCompromised) {
        options.onCompromised?.(result);
        logSecurityCheck(result);
      }
    }
  }, []);

  const recheckSecurity = () => {
    const result = performSecurityCheck();
    setSecurityResult(result);
    setIsCompromised(result.isCompromised);
    return result;
  };

  return {
    securityResult,
    isCompromised,
    recheckSecurity,
    securityLevel: getSecurityLevel(),
  };
};

/**
 * Show security alert
 */
export const showSecurityAlert = (result: SecurityCheckResult) => {
  if (!result.isCompromised) {
    return;
  }

  Alert.alert(
    'Security Warning',
    getSecurityWarningMessage() || 'Device security issue detected',
    [
      {
        text: 'OK',
        style: 'default',
      },
    ]
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 4,
  },
  recommendationItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  rejectButton: {
    // No additional styles
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default SecurityWarning;
