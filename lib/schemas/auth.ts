/**
 * 인증 관련 Zod 스키마 정의
 *
 * 회원가입, 로그인, 비밀번호 재설정 등 인증 폼의 유효성 검사 스키마를 정의합니다.
 * 모든 에러 메시지는 한국어로 작성됩니다.
 */

import { z } from "zod";

/**
 * 회원가입 폼 스키마
 *
 * - email: 유효한 이메일 형식
 * - password: 최소 8자, 영문 + 숫자 조합
 * - confirmPassword: password와 동일해야 함
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "이메일을 입력해주세요" })
      .email({ message: "올바른 이메일 형식을 입력해주세요" }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
      .regex(/[A-Za-z]/, { message: "비밀번호에 영문자를 포함해야 합니다" })
      .regex(/[0-9]/, { message: "비밀번호에 숫자를 포함해야 합니다" }),
    confirmPassword: z
      .string()
      .min(1, { message: "비밀번호 확인을 입력해주세요" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/** 회원가입 폼 데이터 타입 */
export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * 로그인 폼 스키마
 *
 * - email: 유효한 이메일 형식
 * - password: 빈 값 허용하지 않음
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요" })
    .email({ message: "올바른 이메일 형식을 입력해주세요" }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요" }),
});

/** 로그인 폼 데이터 타입 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 비밀번호 재설정 요청 스키마
 *
 * - email: 유효한 이메일 형식
 */
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요" })
    .email({ message: "올바른 이메일 형식을 입력해주세요" }),
});

/** 비밀번호 재설정 요청 폼 데이터 타입 */
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

/**
 * 비밀번호 변경 스키마
 *
 * - password: 최소 8자, 영문 + 숫자 조합
 * - confirmPassword: password와 동일해야 함
 */
export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
      .regex(/[A-Za-z]/, { message: "비밀번호에 영문자를 포함해야 합니다" })
      .regex(/[0-9]/, { message: "비밀번호에 숫자를 포함해야 합니다" }),
    confirmPassword: z
      .string()
      .min(1, { message: "비밀번호 확인을 입력해주세요" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

/** 비밀번호 변경 폼 데이터 타입 */
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
