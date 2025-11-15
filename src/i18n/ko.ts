/**
 * Korean Language Strings
 * Phase 199: i18n setup
 *
 * All user-facing strings in Korean
 * Future: Add en.ts, ja.ts, etc.
 */

export const ko = {
  // Common
  common: {
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    ok: '확인',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    retry: '재시도',
    refresh: '새로고침',
  },

  // Recording Screen
  recording: {
    title: '녹화',
    start: '시작',
    stop: '중지',
    duration: '녹화 시간',
    sensors: '센서',
    eventMarker: '이벤트 표시',
    addMarker: '마커 추가',
  },

  // Sessions Screen
  sessions: {
    title: '세션',
    noSessions: '세션이 없습니다',
    delete: '삭제',
    search: '검색',
    sort: '정렬',
    filter: '필터',
  },

  // Settings Screen
  settings: {
    title: '설정',
    sensor: '센서 설정',
    sync: '동기화 설정',
    theme: '테마 설정',
    server: '서버 설정',
    data: '데이터 관리',
    advanced: '고급 설정',
    lightMode: '라이트 모드',
    darkMode: '다크 모드',
    systemMode: '시스템 설정',
  },

  // Sync Status
  sync: {
    status: '동기화 상태',
    syncing: '동기화 중',
    idle: '대기 중',
    lastSync: '마지막 동기화',
    pending: '대기 중인 데이터',
    uploadStats: '업로드 통계',
    successRate: '성공률',
  },

  // Errors
  errors: {
    networkError: '네트워크 오류',
    permissionDenied: '권한이 거부되었습니다',
    fileNotFound: '파일을 찾을 수 없습니다',
    saveFailed: '저장에 실패했습니다',
    loadFailed: '로딩에 실패했습니다',
  },
};

export type I18nStrings = typeof ko;
export default ko;
