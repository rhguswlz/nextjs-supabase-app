/**
 * 서비스 레이어 공유 유틸리티 함수
 *
 * Supabase 에러 처리 및 표준 응답 생성 함수를 제공합니다.
 */

import type { PostgrestError } from "@supabase/supabase-js";
import type { ServiceResult } from "./types";

/**
 * Supabase PostgrestError를 표준 에러 메시지로 변환합니다.
 *
 * @param error - Supabase에서 반환된 PostgrestError 객체
 * @returns 사용자에게 표시할 한국어 에러 메시지
 */
export function handleSupabaseError(error: PostgrestError): string {
  // PostgreSQL 에러 코드별 한국어 메시지 매핑
  const errorMap: Record<string, string> = {
    // 중복 키 위반
    "23505": "이미 존재하는 데이터입니다",
    // 외래 키 위반
    "23503": "참조하는 데이터가 존재하지 않습니다",
    // NOT NULL 위반
    "23502": "필수 값이 누락되었습니다",
    // 권한 없음 (RLS 정책)
    "42501": "접근 권한이 없습니다",
    // 데이터 찾을 수 없음
    PGRST116: "데이터를 찾을 수 없습니다",
  };

  // 매핑된 에러 메시지 반환, 없으면 원본 메시지 사용
  return errorMap[error.code] ?? error.message;
}

/**
 * 성공 응답을 생성합니다.
 *
 * @param data - 응답에 포함할 데이터
 * @returns ServiceResult 성공 객체
 */
export function createSuccessResponse<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/**
 * 에러 응답을 생성합니다.
 *
 * @param error - 에러 메시지 또는 Error 객체
 * @returns ServiceResult 실패 객체
 */
export function createErrorResponse<T>(
  error: string | Error | PostgrestError,
): ServiceResult<T> {
  if (typeof error === "string") {
    return { success: false, error };
  }

  // PostgrestError 타입 체크 (code 프로퍼티 존재 여부로 확인)
  if ("code" in error && "message" in error && "details" in error) {
    return {
      success: false,
      error: handleSupabaseError(error as PostgrestError),
    };
  }

  // 일반 Error 객체
  return { success: false, error: error.message };
}
