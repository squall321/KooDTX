/**
 * BetaInfoScreen Component
 * Phase 221: Beta Tester Recruitment
 *
 * Features:
 * - Beta program information
 * - How to join (TestFlight/Play Store)
 * - Feedback channels
 * - Test guide access
 * - Tester registration status
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeStore } from '../store/useThemeStore';

/**
 * Beta Testing Information Screen
 * Phase 221: Beta tester recruitment and onboarding
 */
const BetaInfoScreenComponent = () => {
  const { colors } = useThemeStore();
  const [isBetaTester, setIsBetaTester] = useState(false);

  /**
   * Open external link with error handling
   */
  const openLink = useCallback(async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', `${label} 링크를 열 수 없습니다.`);
      }
    } catch (error) {
      console.error(`Failed to open ${label}:`, error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert('오류', `링크 열기 실패: ${errorMessage}`);
    }
  }, []);

  /**
   * Join beta program
   */
  const joinBeta = useCallback(() => {
    if (Platform.OS === 'ios') {
      // TestFlight link (replace with actual link)
      openLink(
        'https://testflight.apple.com/join/YOUR_TESTFLIGHT_CODE',
        'TestFlight'
      );
    } else {
      // Google Play Internal Testing link (replace with actual link)
      openLink(
        'https://play.google.com/apps/internaltest/YOUR_TESTING_TRACK',
        'Google Play 베타 테스트'
      );
    }
  }, [openLink]);

  /**
   * Open feedback form
   */
  const openFeedbackForm = useCallback(() => {
    // Google Forms or other feedback tool (replace with actual link)
    openLink(
      'https://forms.gle/YOUR_FEEDBACK_FORM',
      '피드백 폼'
    );
  }, [openLink]);

  /**
   * Report bug
   */
  const reportBug = useCallback(() => {
    // Bug report form (replace with actual link)
    openLink(
      'https://forms.gle/YOUR_BUG_REPORT_FORM',
      '버그 리포트'
    );
  }, [openLink]);

  /**
   * Request feature
   */
  const requestFeature = useCallback(() => {
    // Feature request form (replace with actual link)
    openLink(
      'https://forms.gle/YOUR_FEATURE_REQUEST_FORM',
      '기능 요청'
    );
  }, [openLink]);

  /**
   * Open Discord/Slack community (optional)
   */
  const openCommunity = useCallback(() => {
    openLink(
      'https://discord.gg/YOUR_DISCORD_INVITE',
      'Discord 커뮤니티'
    );
  }, [openLink]);

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    headerCard: {
      backgroundColor: colors.primaryContainer,
      padding: 20,
      marginBottom: 16,
      borderRadius: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.onPrimaryContainer,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.onPrimaryContainer,
      opacity: 0.8,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.onSurface,
    },
    sectionIcon: {
      marginRight: 8,
    },
    sectionText: {
      fontSize: 14,
      color: colors.onSurface,
      lineHeight: 22,
      marginBottom: 8,
    },
    bulletPoint: {
      fontSize: 14,
      color: colors.onSurface,
      lineHeight: 22,
      marginLeft: 16,
      marginBottom: 4,
    },
    buttonContainer: {
      marginTop: 12,
    },
    button: {
      marginBottom: 8,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 8,
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    contactInfo: {
      backgroundColor: colors.secondaryContainer,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    contactText: {
      fontSize: 13,
      color: colors.onSecondaryContainer,
      marginBottom: 4,
    },
    warningCard: {
      backgroundColor: colors.errorContainer,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningText: {
      fontSize: 13,
      color: colors.onErrorContainer,
      flex: 1,
      marginLeft: 8,
    },
    chipStyle: {
      marginTop: 12,
      alignSelf: 'flex-start',
    },
    currentStatusText: {
      marginTop: 12,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>🚀 KooDTX 베타 테스트</Text>
          <Text style={styles.headerSubtitle}>
            센서 데이터 수집 앱의 베타 테스터가 되어주세요!
          </Text>
          {isBetaTester && (
            <Chip
              icon="check-circle"
              style={styles.chipStyle}
            >
              베타 테스터 등록됨
            </Chip>
          )}
        </View>

        {/* What is Beta Testing */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="information" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>베타 테스트란?</Text>
          </View>
          <Text style={styles.sectionText}>
            KooDTX 앱의 정식 출시 전에 미리 사용해보고, 버그를 찾거나 개선사항을 제안하는 프로그램입니다.
          </Text>
          <Text style={styles.bulletPoint}>• 새로운 기능을 가장 먼저 체험</Text>
          <Text style={styles.bulletPoint}>• 앱 개선에 직접 기여</Text>
          <Text style={styles.bulletPoint}>• 개발팀과 직접 소통</Text>
          <Text style={styles.bulletPoint}>• 정식 출시 후 크레딧 제공</Text>
        </Card>

        {/* How to Join */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="account-plus" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>참여 방법</Text>
          </View>
          <Text style={styles.sectionText}>
            {Platform.OS === 'ios'
              ? 'TestFlight를 통해 베타 프로그램에 참여할 수 있습니다.'
              : 'Google Play 내부 테스트 트랙을 통해 참여할 수 있습니다.'}
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="download"
              onPress={joinBeta}
              style={styles.button}
            >
              {Platform.OS === 'ios' ? 'TestFlight으로 참여' : 'Google Play 베타 참여'}
            </Button>
          </View>

          <View style={styles.warningCard}>
            <Icon name="alert" size={20} color={colors.onErrorContainer} />
            <Text style={styles.warningText}>
              베타 버전은 불안정할 수 있으며, 버그나 크래시가 발생할 수 있습니다.
            </Text>
          </View>
        </Card>

        {/* Tester Group */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="account-group" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>테스터 그룹</Text>
          </View>
          <Text style={styles.sectionText}>
            다양한 테스터 그룹으로 구성되어 있습니다:
          </Text>

          <View style={styles.chipContainer}>
            <Chip icon="shield-star" style={styles.chip}>내부 테스터 (5-10명)</Chip>
            <Chip icon="account-multiple" style={styles.chip}>오픈 베타 (50-100명)</Chip>
            <Chip icon="star" style={styles.chip}>파워 유저</Chip>
            <Chip icon="devices" style={styles.chip}>다양한 기기 테스트</Chip>
          </View>

          <Text style={[styles.sectionText, styles.currentStatusText]}>
            현재 모집 중인 그룹: 내부 베타 테스터 (Week 1)
          </Text>
        </Card>

        {/* Test Guide */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="book-open-variant" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>테스트 가이드</Text>
          </View>
          <Text style={styles.sectionText}>
            효과적인 테스트를 위한 가이드라인:
          </Text>
          <Text style={styles.bulletPoint}>1. 다양한 센서 조합으로 녹화 테스트</Text>
          <Text style={styles.bulletPoint}>2. 긴 녹화 세션 (30분+) 안정성 테스트</Text>
          <Text style={styles.bulletPoint}>3. 서버 동기화 기능 테스트</Text>
          <Text style={styles.bulletPoint}>4. 백그라운드 녹화 테스트</Text>
          <Text style={styles.bulletPoint}>5. 배터리 소모 모니터링</Text>
          <Text style={styles.bulletPoint}>6. UI/UX 사용성 피드백</Text>

          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>
              📋 자세한 가이드는 프로젝트 저장소의 BETA_TESTING_GUIDE.md 참조
            </Text>
          </View>
        </Card>

        {/* Feedback Channels */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="message-text" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>피드백 채널</Text>
          </View>
          <Text style={styles.sectionText}>
            다양한 방법으로 피드백을 제공할 수 있습니다:
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              icon="comment-text"
              onPress={openFeedbackForm}
              style={styles.button}
            >
              일반 피드백 제출
            </Button>

            <Button
              mode="outlined"
              icon="bug"
              onPress={reportBug}
              style={styles.button}
            >
              버그 리포트
            </Button>

            <Button
              mode="outlined"
              icon="lightbulb-on"
              onPress={requestFeature}
              style={styles.button}
            >
              기능 요청
            </Button>

            <Button
              mode="outlined"
              icon="discord"
              onPress={openCommunity}
              style={styles.button}
            >
              커뮤니티 참여 (선택)
            </Button>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>
              📧 이메일: beta@koodtx.com
            </Text>
            <Text style={styles.contactText}>
              💬 Discord: discord.gg/koodtx
            </Text>
            <Text style={styles.contactText}>
              📱 응답 시간: 평일 24시간 이내
            </Text>
          </View>
        </Card>

        {/* Expected Timeline */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="calendar-clock" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>베타 테스트 일정</Text>
          </View>
          <Text style={styles.bulletPoint}>• Week 1: 내부 베타 (5-10명)</Text>
          <Text style={styles.bulletPoint}>• Week 2-4: 오픈 베타 (50-100명)</Text>
          <Text style={styles.bulletPoint}>• Week 5: 최종 검증</Text>
          <Text style={styles.bulletPoint}>• Week 6: 정식 출시</Text>

          <Text style={[styles.sectionText, styles.currentStatusText]}>
            현재 진행 상태: 내부 베타 모집 중 (Week 1)
          </Text>
        </Card>

        {/* Rewards */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="gift" size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>테스터 혜택</Text>
          </View>
          <Text style={styles.bulletPoint}>• 앱 크레딧에 이름 등재</Text>
          <Text style={styles.bulletPoint}>• 프리미엄 기능 무료 이용 (1년)</Text>
          <Text style={styles.bulletPoint}>• 개발 로드맵 우선 공개</Text>
          <Text style={styles.bulletPoint}>• 베타 테스터 전용 배지</Text>
          <Text style={styles.bulletPoint}>• 우수 테스터 시상</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

// Memoize component to prevent unnecessary re-renders
export const BetaInfoScreen = React.memo(BetaInfoScreenComponent);
export default BetaInfoScreen;
