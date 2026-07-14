# 서비스 레이어 구조

이 디렉토리는 비즈니스 로직을 담당하는 서비스 레이어를 포함합니다.

## 디렉토리 구조

```
lib/services/
├── README.md                    # 이 파일
├── server/                      # 서버 사이드 전용 서비스
│   ├── index.ts                 # re-export
│   ├── auth.service.ts          # 인증 서비스 (signUp, signIn, signOut 등)
│   └── profile.service.ts       # 프로필 서비스 (CRUD)
├── client/                      # 클라이언트 사이드 전용 서비스
│   ├── index.ts                 # re-export
│   └── profile.service.ts       # 프로필 서비스 (조회, 업데이트)
├── shared/                      # 서버/클라이언트 공유 유틸리티
│   ├── index.ts                 # re-export
│   ├── types.ts                 # ServiceResult, PaginationParams 등 공통 타입
│   └── utils.ts                 # 에러 처리 헬퍼 함수
└── profile.service.ts           # [Deprecated] 기존 파일 (하위 호환성 유지)
```

## server/ - 서버 사이드 서비스

Server Components, Server Actions, Route Handlers에서 사용합니다.

- `@supabase/ssr`의 서버 클라이언트를 사용합니다.
- 쿠키를 통한 세션 관리가 가능합니다.
- **Fluid Compute 호환**: 각 함수 내에서 새로운 클라이언트를 생성합니다.

```typescript
// 올바른 사용 예시 (Server Component)
import { getProfile } from "@/lib/services/server/profile.service";

export default async function ProfilePage() {
  const profile = await getProfile(userId);
  return <div>{profile.full_name}</div>;
}
```

## client/ - 클라이언트 사이드 서비스

`"use client"` 디렉티브가 있는 클라이언트 컴포넌트에서 사용합니다.

- `@supabase/supabase-js`의 브라우저 클라이언트를 사용합니다.
- RLS(Row Level Security) 정책이 적용됩니다.
- 읽기/수정 작업만 포함합니다 (민감한 작업은 서버 서비스 사용).

```typescript
// 올바른 사용 예시 (Client Component)
"use client";
import { updateProfile } from "@/lib/services/client/profile.service";

export function ProfileForm({ userId }: { userId: string }) {
  const handleSubmit = async (data) => {
    const updated = await updateProfile(userId, data);
  };
}
```

## shared/ - 공유 유틸리티

서버/클라이언트 양쪽에서 사용 가능한 타입과 유틸리티입니다.

### 주요 타입

```typescript
// 서비스 함수의 표준 응답 타입
type ServiceResult<T> =
  { success: true; data: T } | { success: false; error: string };

// 페이지네이션 파라미터
interface PaginationParams {
  limit?: number;
  offset?: number;
}

// 페이지네이션 결과
interface PaginationResult<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
}
```

### 에러 처리 헬퍼

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/services/shared";

// 성공 응답 생성
return createSuccessResponse(data);

// 에러 응답 생성
return createErrorResponse(error);
```

## 마이그레이션 가이드

기존 `lib/services/profile.service.ts`에서 마이그레이션:

| 기존 (deprecated)                | 새로운 경로                                          |
| -------------------------------- | ---------------------------------------------------- |
| `@/lib/services/profile.service` | `@/lib/services/server/profile.service` (서버)       |
| `@/lib/services/profile.service` | `@/lib/services/client/profile.service` (클라이언트) |
