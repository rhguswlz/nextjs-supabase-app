# 서비스 레이어 아키텍처 가이드

## 개요

이 프로젝트는 비즈니스 로직을 UI 컴포넌트에서 분리하기 위한 서비스 레이어를 사용합니다.
Next.js 15의 Server Components 패러다임에 맞춰 서버/클라이언트 컨텍스트를 명확히 구분합니다.

## 아키텍처 개요

```
UI Layer (Components)
    ↓
Service Layer (lib/services/)
    ↓
Data Layer (Supabase)
```

### 서버/클라이언트 분리 원칙

```
Server Components ──→ lib/services/server/
Client Components ──→ lib/services/client/
공통 유틸리티    ──→ lib/services/shared/
```

## 에러 처리

### throw 패턴 (표준)

서비스 함수는 에러 발생 시 null을 반환하지 않고 Error를 throw합니다.

```typescript
// 서비스 레이어
export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    throw new Error(`프로필 조회에 실패했습니다: ${error.message}`);
  }

  return data; // 항상 Profile을 반환 (null이 될 수 없음)
}

// 사용하는 쪽 (Server Component)
export default async function Page() {
  try {
    const profile = await getProfile(userId);
    return <div>{profile.full_name}</div>;
  } catch (error) {
    // 에러 UI 표시
    return <div>프로필을 불러올 수 없습니다</div>;
  }
}
```

### ServiceResult 패턴 (선택적 사용)

에러를 명시적으로 처리하고 싶은 경우 ServiceResult 타입을 활용합니다.

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/services/shared";
import type { ServiceResult } from "@/lib/services/shared";

export async function safeGetProfile(
  userId: string,
): Promise<ServiceResult<Profile>> {
  try {
    const profile = await getProfile(userId);
    return createSuccessResponse(profile);
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : "알 수 없는 오류",
    );
  }
}

// 사용하는 쪽
const result = await safeGetProfile(userId);
if (result.success) {
  console.log(result.data); // Profile
} else {
  console.error(result.error); // string
}
```

## Zod 스키마 사용법

스키마는 `lib/schemas/`에 정의되어 있습니다.

### 인증 스키마

```typescript
import {
  signUpSchema,
  loginSchema,
  type SignUpFormData,
  type LoginFormData,
} from "@/lib/schemas/auth";

// 유효성 검사
const result = signUpSchema.safeParse({ email, password, confirmPassword });
if (!result.success) {
  const errors = result.error.flatten();
  // errors.fieldErrors.email, errors.fieldErrors.password 등
}
```

### 프로필 스키마

```typescript
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@/lib/schemas/profile";

const result = updateProfileSchema.safeParse({ full_name, bio, avatar_url });
```

## React Hook Form 패턴

### 기본 패턴

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      // 서버 에러를 root 에러로 설정
      setError("root", {
        message: error instanceof Error ? error.message : "오류가 발생했습니다",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      {/* 서버 에러 */}
      {errors.root && <span>{errors.root.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
```

### 필드별 에러 표시

```typescript
// 특정 필드에 에러 설정 (서버에서 반환된 에러)
setError("email", { message: "이미 사용 중인 이메일입니다" });

// 폼 전체 에러 설정
setError("root", { message: "서버 오류가 발생했습니다" });
```

## 서비스 함수 작성 규칙

### Fluid Compute 호환 (필수)

```typescript
// 올바른 방법: 함수 내에서 클라이언트 생성
export async function getProfile(userId: string) {
  const supabase = await createClient(); // 매번 새로 생성
  // ...
}

// 잘못된 방법: 전역 변수로 저장
const supabase = await createClient(); // 전역 변수 X
export async function getProfile(userId: string) {
  // supabase 사용
}
```

### 서버 vs 클라이언트 클라이언트

```typescript
// 서버 사이드 서비스
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // await 필요

// 클라이언트 사이드 서비스
import { createClient } from "@/lib/supabase/client";
const supabase = createClient(); // await 불필요
```

## 파일 위치 참조

| 목적                     | 경로                                     |
| ------------------------ | ---------------------------------------- |
| 서버 인증 서비스         | `lib/services/server/auth.service.ts`    |
| 서버 프로필 서비스       | `lib/services/server/profile.service.ts` |
| 클라이언트 프로필 서비스 | `lib/services/client/profile.service.ts` |
| 공유 타입                | `lib/services/shared/types.ts`           |
| 공유 유틸리티            | `lib/services/shared/utils.ts`           |
| 인증 스키마              | `lib/schemas/auth.ts`                    |
| 프로필 스키마            | `lib/schemas/profile.ts`                 |
