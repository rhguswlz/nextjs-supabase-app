/**
 * 프로필 관련 Zod 스키마 정의
 *
 * 프로필 수정 폼의 유효성 검사 스키마를 정의합니다.
 * 모든 에러 메시지는 한국어로 작성됩니다.
 */

import { z } from "zod";

/**
 * 프로필 업데이트 스키마
 *
 * - full_name: 선택 입력, 최대 50자
 * - bio: 선택 입력, 최대 500자
 * - avatar_url: 선택 입력, 유효한 URL 형식
 */
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .max(50, { message: "이름은 최대 50자까지 입력할 수 있습니다" })
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, { message: "자기소개는 최대 500자까지 입력할 수 있습니다" })
    .optional()
    .nullable(),
  avatar_url: z
    .string()
    .url({ message: "올바른 URL 형식을 입력해주세요" })
    .optional()
    .nullable(),
});

/** 프로필 업데이트 폼 데이터 타입 */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
