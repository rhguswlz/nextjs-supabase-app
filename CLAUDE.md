# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 리포지토리에서 코드 작업을 수행할 때 참고하는 가이드입니다.

## 프로젝트 개요

Next.js 15 + Supabase 스타터 킷(React 19, TypeScript, Tailwind CSS, shadcn/ui 포함). Supabase SSR을 통한 쿠키 기반 인증을 사용하여 클라이언트 컴포넌트, 서버 컴포넌트, 라우트 핸들러, 서버 액션 전체에서 사용자 세션을 이용할 수 있습니다.

## 개발 명령어

```bash
npm run dev        # 개발 서버 시작 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 시작
npm run lint       # ESLint 실행
```

## 아키텍처 개요

### Supabase 통합

- **Server Client** (`lib/supabase/server.ts`): 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 사용하는 Supabase 클라이언트. `@supabase/ssr`을 통해 쿠키 기반 세션 관리
- **Browser Client** (`lib/supabase/client.ts`): 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
- **Database Types** (`lib/database.types.ts`): Supabase 데이터베이스 스키마의 자동 생성 TypeScript 타입

### 라우팅 구조

- **`app/`**: Next.js App Router를 사용한 루트 레이아웃 및 메인 페이지
- **`app/auth/`**: 인증 관련 페이지 및 액션
  - `login/page.tsx`, `sign-up/page.tsx`, `forgot-password/page.tsx` 등
  - `actions.ts`: 인증 작업을 위한 서버 액션 (로그인, 회원가입, 로그아웃, 비밀번호 재설정)
  - `confirm/route.ts`: OAuth 콜백 및 이메일 확인 라우트
- **`app/protected/`**: 인증이 필요한 페이지

### 훅 및 서비스

- **`lib/hooks/`**: 커스텀 React 훅
  - `useAuth.ts`: 현재 인증된 사용자 정보 접근
  - `useProfile.ts`: 사용자 프로필 데이터 접근
- **`lib/services/`**: 비즈니스 로직 계층
  - `profile.service.ts`: 프로필 관련 작업

### 컴포넌트

- **`components/`**: 재사용 가능한 React 컴포넌트
  - shadcn/ui 컴포넌트와 Tailwind CSS로 구성
  - `sign-up-form.tsx` 등

## 필수 환경 변수

`.env.local`에 다음을 설정해야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-프로젝트-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
```

이 키들은 공개 키이므로 브라우저에 노출되어도 안전합니다. 민감한 작업은 서버 측 클라이언트를 사용합니다.

## 중요 사항

- **Server Client 생성**: 각 함수 내에서 항상 새로운 Supabase 서버 클라이언트를 생성하세요. 특히 Fluid Compute 사용 시 전역 변수에 저장하지 마세요.
- **인증 흐름**: `@supabase/ssr`을 통한 쿠키 기반 세션 관리를 사용하므로 서버 클라이언트를 통해 서버 컴포넌트에서 세션이 자동으로 사용 가능합니다.
- **데이터베이스 동기화**: Supabase 스키마가 변경될 때마다 Supabase CLI를 사용하여 `lib/database.types.ts`의 타입을 다시 생성해야 합니다.
- **컴포넌트 분할**: 브라우저 API나 인터랙티브 기능이 필요한 컴포넌트에만 'use client' 디렉티브를 사용하고, 가능한 한 서버 컴포넌트를 선호하세요.

## 스타일링

- **프레임워크**: Tailwind CSS
- **UI 라이브러리**: shadcn/ui
- **테마**: next-themes를 통한 라이트/다크 모드 지원

## 일반적인 패턴

### 서버 컴포넌트에서 Supabase 사용

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("table").select();
  return <div>{/* 데이터 렌더링 */}</div>;
}
```

### 클라이언트 컴포넌트에서 Supabase 사용

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function MyComponent() {
  const supabase = createClient();
  // 훅과 이펙트를 사용하여 데이터 조회/구독
}
```

### 데이터 변경을 위한 서버 액션

같은 파일이나 전용 액션 파일에 정의하고 `"use server"` 디렉티브와 함께 클라이언트 컴포넌트에서 호출하세요.
