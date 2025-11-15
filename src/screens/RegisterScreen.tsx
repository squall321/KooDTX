/**
 * RegisterScreen
 * Phase 141: Register screen
 *
 * Features:
 * - Name, Email, Password input fields
 * - Password confirmation
 * - Sign up button
 * - Validation
 * - Error display
 * - Loading state
 * - iOS-style design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';

interface RegisterScreenProps {
  navigation?: any; // React Navigation prop
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auth store
  const { register, isLoading, error: authError, clearError } = useAuthStore();

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isStrongPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle registration
  const handleRegister = async () => {
    // Clear previous error
    clearError();

    // Validation
    if (!name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('오류', '이름은 최소 2자 이상이어야 합니다.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (!password) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('오류', '비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (!isStrongPassword(password)) {
      Alert.alert('오류', '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.');
      return;
    }

    if (!confirmPassword) {
      Alert.alert('오류', '비밀번호 확인을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // Call register from auth store
      await register(name, email, password);

      // On success, navigate to main app (auto-logged in)
      Alert.alert(
        '회원가입 성공',
        '계정이 생성되었습니다. 환영합니다!',
        [
          {
            text: '확인',
            onPress: () => {
              // Navigate to main app
              navigation?.replace('MainApp');
            },
          },
        ]
      );
    } catch (err: any) {
      // Error is already set in auth store
      Alert.alert('회원가입 실패', err.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  // Handle login navigation
  const handleLogin = () => {
    // Navigate back to login screen
    navigation?.navigate('Login');
  };

  // Get password strength text
  const getPasswordStrengthText = (): string => {
    if (!password) return '';
    if (password.length < 8) return '너무 짧음';
    if (!isStrongPassword(password)) return '약함';
    return '강함';
  };

  // Get password strength color
  const getPasswordStrengthColor = (): string => {
    const strength = getPasswordStrengthText();
    if (strength === '강함') return '#34C759';
    if (strength === '약함') return '#FF9500';
    return '#FF3B30';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Icon name="person-add" size={60} color="#007AFF" />
          </View>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            KooDTX 계정을 만들어주세요
          </Text>
        </View>

        {/* Register Form */}
        <View style={styles.form}>
          {/* Error Message */}
          {authError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.input}
              placeholder="이름"
              placeholderTextColor="#8E8E93"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError();
              }}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (최소 8자)"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          {/* Password Strength Indicator */}
          {password ? (
            <View style={styles.passwordStrengthContainer}>
              <Text style={styles.passwordStrengthLabel}>비밀번호 강도: </Text>
              <Text
                style={[
                  styles.passwordStrengthText,
                  { color: getPasswordStrengthColor() },
                ]}
              >
                {getPasswordStrengthText()}
              </Text>
            </View>
          ) : null}

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#8E8E93" />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인"
              placeholderTextColor="#8E8E93"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          {/* Password Match Indicator */}
          {confirmPassword ? (
            <View style={styles.passwordMatchContainer}>
              <Icon
                name={
                  password === confirmPassword
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={16}
                color={password === confirmPassword ? '#34C759' : '#FF3B30'}
              />
              <Text
                style={[
                  styles.passwordMatchText,
                  {
                    color:
                      password === confirmPassword ? '#34C759' : '#FF3B30',
                  },
                ]}
              >
                {password === confirmPassword
                  ? '비밀번호가 일치합니다'
                  : '비밀번호가 일치하지 않습니다'}
              </Text>
            </View>
          ) : null}

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              회원가입을 진행하면{' '}
              <Text style={styles.termsLink}>서비스 이용약관</Text> 및{' '}
              <Text style={styles.termsLink}>개인정보 처리방침</Text>에
              동의하는 것으로 간주됩니다.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>회원가입</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              이미 계정이 있으신가요?{' '}
              <Text style={styles.loginLink}>로그인</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            KooDTX v1.0.0 © 2025
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  eyeIcon: {
    padding: 4,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  passwordStrengthLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  passwordStrengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
    gap: 6,
  },
  passwordMatchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default RegisterScreen;
