/**
 * StepCounter Component
 * Displays real-time step count with activity type classification
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StepActivityType} from '@app-types/sensor.types';

interface StepCounterProps {
  totalSteps: number;
  walkingSteps: number;
  runningSteps: number;
  currentActivity: StepActivityType;
  confidence?: number;
  showDetails?: boolean;
}

export const StepCounter: React.FC<StepCounterProps> = ({
  totalSteps,
  walkingSteps,
  runningSteps,
  currentActivity,
  confidence,
  showDetails = true,
}) => {
  const [displayedSteps, setDisplayedSteps] = useState(totalSteps);

  // Animate step count changes
  useEffect(() => {
    if (displayedSteps !== totalSteps) {
      const timer = setTimeout(() => {
        setDisplayedSteps(totalSteps);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [totalSteps, displayedSteps]);

  const getActivityColor = (activity: StepActivityType): string => {
    switch (activity) {
      case StepActivityType.WALKING:
        return '#4CAF50'; // Green
      case StepActivityType.RUNNING:
        return '#FF5722'; // Orange-Red
      case StepActivityType.UNKNOWN:
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getActivityIcon = (activity: StepActivityType): string => {
    switch (activity) {
      case StepActivityType.WALKING:
        return '🚶';
      case StepActivityType.RUNNING:
        return '🏃';
      case StepActivityType.UNKNOWN:
      default:
        return '❓';
    }
  };

  const getActivityLabel = (activity: StepActivityType): string => {
    switch (activity) {
      case StepActivityType.WALKING:
        return '걷기';
      case StepActivityType.RUNNING:
        return '뛰기';
      case StepActivityType.UNKNOWN:
      default:
        return '감지 중';
    }
  };

  const activityColor = getActivityColor(currentActivity);
  const activityIcon = getActivityIcon(currentActivity);
  const activityLabel = getActivityLabel(currentActivity);

  return (
    <View style={styles.container}>
      {/* Main Step Count */}
      <View style={styles.mainCounter}>
        <Text style={styles.stepCount}>{displayedSteps}</Text>
        <Text style={styles.stepLabel}>걸음</Text>
      </View>

      {/* Current Activity Indicator */}
      <View style={[styles.activityIndicator, {backgroundColor: activityColor}]}>
        <Text style={styles.activityIcon}>{activityIcon}</Text>
        <Text style={styles.activityLabel}>{activityLabel}</Text>
        {confidence !== undefined && (
          <Text style={styles.confidenceLabel}>
            ({Math.round(confidence * 100)}%)
          </Text>
        )}
      </View>

      {/* Detailed Breakdown */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <View style={[styles.detailDot, {backgroundColor: '#4CAF50'}]} />
            <Text style={styles.detailLabel}>걷기</Text>
            <Text style={styles.detailValue}>{walkingSteps}</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.detailDot, {backgroundColor: '#FF5722'}]} />
            <Text style={styles.detailLabel}>뛰기</Text>
            <Text style={styles.detailValue}>{runningSteps}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  mainCounter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepCount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  activityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 16,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});
