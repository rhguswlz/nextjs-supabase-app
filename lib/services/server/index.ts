/**
 * 서버 사이드 서비스 re-export
 *
 * Server Components, Server Actions, Route Handlers에서 사용하는
 * 서비스 함수와 타입을 내보냅니다.
 *
 * 주의: 이 파일의 내용은 클라이언트 컴포넌트에서 import하면 안 됩니다.
 */

// 인증 서비스
export {
  signUpUser,
  signInUser,
  signOutUser,
  resetPassword,
  updatePassword,
} from "./auth.service";

export type { AuthUser, AuthResponse } from "./auth.service";

// 프로필 서비스
export {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileByEmail,
  getAllProfiles,
} from "./profile.service";

export type { Profile, ProfileInsert, ProfileUpdate } from "./profile.service";

// Admin 서비스 (관리자 전용)
export {
  getAllEvents,
  getAllProfiles as getAdminProfiles,
  getEventStats,
} from "./admin.service";

export type { AdminEvent, AdminProfile, AdminStats } from "./admin.service";
