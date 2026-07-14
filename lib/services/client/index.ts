/**
 * 클라이언트 사이드 서비스 re-export
 *
 * 클라이언트 컴포넌트("use client")에서 사용하는
 * 서비스 함수와 타입을 내보냅니다.
 *
 * 주의: 이 파일의 내용은 Server Components에서 import하면 안 됩니다.
 * 서버 사이드 서비스는 @/lib/services/server를 사용하세요.
 */

// 클라이언트 사이드 프로필 서비스
export { getProfile, updateProfile } from "./profile.service";
export type { Profile, ProfileUpdate } from "./profile.service";
