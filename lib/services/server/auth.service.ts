/**
 * 서버 사이드 인증 서비스
 *
 * Supabase Auth를 활용한 인증 관련 비즈니스 로직을 담당합니다.
 * Server Components, Server Actions, Route Handlers에서 사용합니다.
 *
 * 주의사항:
 * - Fluid Compute 호환을 위해 각 함수 내에서 새로운 클라이언트를 생성합니다.
 * - 전역 변수로 클라이언트를 저장하지 마세요.
 */

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * 인증된 사용자 정보 타입
 * Supabase User 객체의 핵심 필드만 포함합니다.
 */
export interface AuthUser {
  id: string;
  email: string | undefined;
  emailConfirmedAt: string | null;
  createdAt: string;
}

/**
 * 인증 작업 응답 타입
 */
export interface AuthResponse {
  user: AuthUser;
}

/**
 * Supabase User 객체를 AuthUser 형태로 변환합니다.
 */
function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    createdAt: user.created_at,
  };
}

/**
 * 이메일과 비밀번호로 회원가입합니다.
 *
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @param redirectTo - 이메일 인증 후 리다이렉트할 URL (선택)
 * @returns 생성된 사용자 정보
 * @throws 회원가입 실패 시 Error
 */
export async function signUpUser(
  email: string,
  password: string,
  redirectTo?: string,
): Promise<AuthResponse> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        redirectTo ??
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("사용자 생성에 실패했습니다");
  }

  return { user: toAuthUser(data.user) };
}

/**
 * 이메일과 비밀번호로 로그인합니다.
 *
 * @param email - 사용자 이메일
 * @param password - 사용자 비밀번호
 * @returns 로그인된 사용자 정보
 * @throws 로그인 실패 시 Error
 */
export async function signInUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 인증 실패 에러를 사용자 친화적인 메시지로 변환
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error(
        "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요",
      );
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("로그인에 실패했습니다");
  }

  return { user: toAuthUser(data.user) };
}

/**
 * 로그아웃합니다.
 *
 * @throws 로그아웃 실패 시 Error
 */
export async function signOutUser(): Promise<void> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`로그아웃에 실패했습니다: ${error.message}`);
  }
}

/**
 * 비밀번호 재설정 이메일을 발송합니다.
 *
 * @param email - 비밀번호를 재설정할 계정의 이메일
 * @param redirectTo - 비밀번호 재설정 후 리다이렉트할 URL (선택)
 * @throws 이메일 발송 실패 시 Error
 */
export async function resetPassword(
  email: string,
  redirectTo?: string,
): Promise<void> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      redirectTo ??
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/update-password`,
  });

  if (error) {
    throw new Error(
      `비밀번호 재설정 이메일 발송에 실패했습니다: ${error.message}`,
    );
  }
}

/**
 * 비밀번호를 변경합니다.
 * 비밀번호 재설정 이메일의 링크를 클릭한 후 호출해야 합니다.
 *
 * @param newPassword - 새 비밀번호
 * @throws 비밀번호 변경 실패 시 Error
 */
export async function updatePassword(newPassword: string): Promise<void> {
  // Fluid Compute 호환: 함수 내에서 새로운 클라이언트 생성
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(`비밀번호 변경에 실패했습니다: ${error.message}`);
  }
}
