/**
 * FeedbackScreen
 *
 * Screen for users to submit feedback (bug reports, feature requests, general feedback).
 *
 * Features:
 * - Feedback type selection (bug, feature, general)
 * - Text input for feedback message
 * - Optional email input
 * - Auto-includes device info and app version
 * - Sends feedback via email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Linking } from 'react-native';
import { AnalyticsEvents } from '@/events/analyticsEvents';

type FeedbackType = 'bug' | 'feature' | 'general';

interface FeedbackScreenProps {
  navigation: any; // Replace with proper navigation type
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle feedback submission
   */
  const handleSubmit = async () => {
    // Validate feedback
    if (feedback.trim().length === 0) {
      Alert.alert('오류', '피드백 내용을 입력해 주세요.');
      return;
    }

    if (feedback.trim().length < 10) {
      Alert.alert('오류', '피드백은 최소 10자 이상 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect device info
      const deviceInfo = await getDeviceInfo();

      // Create email body
      const emailBody = createEmailBody(feedbackType, feedback, deviceInfo);

      // Send email
      await sendFeedbackEmail(feedbackType, emailBody, email);

      // Log analytics event
      await AnalyticsEvents.logFeedbackSubmitted({
        feedbackType,
        hasEmail: email.trim().length > 0,
      });

      // Show success message
      Alert.alert(
        '감사합니다!',
        '피드백이 전송되었습니다.\n24-48시간 내에 답변드리겠습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Reset form
      setFeedback('');
      setEmail('');
      setFeedbackType('general');
    } catch (error) {
      console.error('[FeedbackScreen] Failed to submit feedback:', error);
      Alert.alert(
        '오류',
        '피드백 전송에 실패했습니다.\nsupport@koodtx.com으로 직접 이메일을 보내주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get device information
   */
  const getDeviceInfo = async () => {
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    const deviceBrand = DeviceInfo.getBrand();
    const deviceModel = DeviceInfo.getModel();
    const systemVersion = DeviceInfo.getSystemVersion();
    const deviceId = await DeviceInfo.getUniqueId();

    return {
      appVersion,
      buildNumber,
      deviceBrand,
      deviceModel,
      systemVersion,
      deviceId,
      platform: Platform.OS,
    };
  };

  /**
   * Create email body
   */
  const createEmailBody = (
    type: FeedbackType,
    message: string,
    deviceInfo: any
  ): string => {
    const typeLabels = {
      bug: '버그 리포트',
      feature: '기능 요청',
      general: '일반 문의',
    };

    return `
===========================================
피드백 타입: ${typeLabels[type]}
${email ? `이메일: ${email}` : '이메일: (미제공)'}
===========================================

${message}

===========================================
Device Information
===========================================
App Version: ${deviceInfo.appVersion} (${deviceInfo.buildNumber})
Device: ${deviceInfo.deviceBrand} ${deviceInfo.deviceModel}
OS: Android ${deviceInfo.systemVersion}
Device ID: ${deviceInfo.deviceId}
Platform: ${deviceInfo.platform}
===========================================
    `.trim();
  };

  /**
   * Send feedback email
   */
  const sendFeedbackEmail = async (
    type: FeedbackType,
    body: string,
    userEmail: string
  ) => {
    const typeLabels = {
      bug: 'Bug Report',
      feature: 'Feature Request',
      general: 'General Feedback',
    };

    const subject = `[KooDTX Feedback] ${typeLabels[type]}`;
    const recipient = 'support@koodtx.com';

    // Construct mailto URL
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Check if email app is available
    const canOpen = await Linking.canOpenURL(mailtoUrl);

    if (!canOpen) {
      throw new Error('Email app not available');
    }

    // Open email app
    await Linking.openURL(mailtoUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>피드백 보내기</Text>
        <Text style={styles.subtitle}>
          KooDTX를 개선하는 데 도움을 주세요!
        </Text>
      </View>

      {/* Feedback Type Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>피드백 타입 *</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              feedbackType === 'bug' && styles.typeButtonActive,
            ]}
            onPress={() => setFeedbackType('bug')}
          >
            <Text
              style={[
                styles.typeButtonText,
                feedbackType === 'bug' && styles.typeButtonTextActive,
              ]}
            >
              🐛 버그 리포트
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              feedbackType === 'feature' && styles.typeButtonActive,
            ]}
            onPress={() => setFeedbackType('feature')}
          >
            <Text
              style={[
                styles.typeButtonText,
                feedbackType === 'feature' && styles.typeButtonTextActive,
              ]}
            >
              💡 기능 요청
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              feedbackType === 'general' && styles.typeButtonActive,
            ]}
            onPress={() => setFeedbackType('general')}
          >
            <Text
              style={[
                styles.typeButtonText,
                feedbackType === 'general' && styles.typeButtonTextActive,
              ]}
            >
              💬 일반 문의
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback Message */}
      <View style={styles.section}>
        <Text style={styles.label}>피드백 내용 *</Text>
        <TextInput
          style={styles.textArea}
          placeholder={getPlaceholderText(feedbackType)}
          placeholderTextColor="#999"
          multiline
          numberOfLines={8}
          value={feedback}
          onChangeText={setFeedback}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{feedback.length} / 1000</Text>
      </View>

      {/* Email (Optional) */}
      <View style={styles.section}>
        <Text style={styles.label}>이메일 (선택사항)</Text>
        <Text style={styles.hint}>
          답변을 받으시려면 이메일을 입력하세요.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="your-email@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Device Info Preview */}
      <View style={styles.section}>
        <Text style={styles.label}>자동 포함 정보</Text>
        <Text style={styles.hint}>
          다음 정보가 자동으로 포함됩니다:
        </Text>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>• 앱 버전</Text>
          <Text style={styles.deviceInfoText}>• 기기 모델</Text>
          <Text style={styles.deviceInfoText}>• Android 버전</Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? '전송 중...' : '피드백 보내기'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>
        직접 이메일을 보내시려면: support@koodtx.com
      </Text>
    </ScrollView>
  );
};

/**
 * Get placeholder text based on feedback type
 */
const getPlaceholderText = (type: FeedbackType): string => {
  switch (type) {
    case 'bug':
      return '발견하신 버그를 자세히 설명해 주세요.\n\n예시:\n1. 어떤 화면에서 발생했나요?\n2. 어떤 동작을 했을 때 발생했나요?\n3. 오류 메시지가 있었나요?';
    case 'feature':
      return '원하시는 기능을 설명해 주세요.\n\n예시:\n1. 어떤 기능이 필요한가요?\n2. 왜 이 기능이 유용한가요?\n3. 어떻게 동작하면 좋을까요?';
    case 'general':
      return '문의 사항이나 의견을 자유롭게 작성해 주세요.';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#6200EE',
    backgroundColor: '#F3E5FF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  deviceInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  deviceInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
});
