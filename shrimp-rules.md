# Development Guidelines — 모임날잡기 (GatherEase)

## 1. 프로젝트 개요

- **서비스**: 직장인 회식 날짜 조율 + 참여자 관리를 초대 링크 하나로 처리
- **스택**: Next.js 15 App Router · React 19 · TypeScript · Supabase · Tailwind CSS · shadcn/ui
- **개발 전략**: UI 프로토타입(더미 데이터) → 백엔드 연동 순서로 진행
- **기준 문서**: `docs/PRD.md`, `docs/ROADMAP.md`

---

## 2. 디렉토리 구조 및 역할

```
app/                        # Next.js App Router 페이지
  auth/                     # 인증 페이지 + 서버액션 (기존 구현 재사용)
  dashboard/                # 주최자 이벤트 목록 (인증 필요)
  events/
    new/                    # 이벤트 생성 Wizard
    [id]/                   # 이벤트 관리 + 집계 그리드
  join/
    [token]/                # 게스트 참여 (로그인 불필요)
  page.tsx                  # 랜딩 페이지
lib/
  supabase/
    server.ts               # SSR 클라이언트 (서버 컴포넌트·서버액션·라우트핸들러 전용)
    client.ts               # 브라우저 클라이언트 (클라이언트 컴포넌트 전용)
  database.types.ts         # Supabase CLI 자동 생성 타입 (직접 편집 금지)
  services/                 # 비즈니스 로직 레이어
    profile.service.ts      # 프로필 CRUD (패턴 참조용)
    event.service.ts        # 이벤트 CRUD + invite_token 생성
    participant.service.ts  # 게스트 등록 + guest_token 발급
    availability.service.ts # 가용성 저장·조회·집계
  hooks/                    # 클라이언트 전용 커스텀 훅
    useAuth.ts              # 인증 상태
    useProfile.ts           # 프로필 데이터
    useGuestSession.ts      # localStorage guest_token 관리
  mock/                     # 더미 데이터 유틸리티 (Phase 1 전용)
components/
  ui/                       # shadcn/ui 원본 (직접 편집 금지)
  *.tsx                     # 프로젝트 커스텀 컴포넌트
supabase/
  migrations/               # SQL 마이그레이션 파일 (순번_설명.sql)
docs/
  ROADMAP.md                # 작업 완료 시 반드시 상태 업데이트
```

---

## 3. Supabase 클라이언트 사용 규칙

### 서버 클라이언트 (`lib/supabase/server.ts`)

- **사용 위치**: 서버 컴포넌트, 서버 액션(`"use server"`), 라우트 핸들러
- **반드시** 함수 내부에서 매번 새로 생성한다 — 전역 변수에 저장 금지

```typescript
// ✅ 올바른 사용
export async function myAction() {
  const supabase = await createClient(); // 함수 내부에서 생성
  ...
}

// ❌ 금지
const supabase = await createClient(); // 모듈 최상위에서 생성
```

### 브라우저 클라이언트 (`lib/supabase/client.ts`)

- **사용 위치**: `"use client"` 컴포넌트, 커스텀 훅
- 파일 상단 또는 컴포넌트 함수 내부에서 `createClient()` 호출

### 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL` — 필수
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — 필수
- 민감한 서버 전용 키는 `.env.local`에만 저장, `NEXT_PUBLIC_` 접두사 붙이지 않는다

---

## 4. 서버 / 클라이언트 컴포넌트 분리 규칙

- 기본값은 **서버 컴포넌트** — `"use client"` 없이 작성
- `"use client"` 추가 조건 (하나라도 해당하면 필수):
  - `useState`, `useEffect`, `useRef` 등 React 훅 사용
  - 브라우저 API(`localStorage`, `window`, `document`) 접근
  - 이벤트 핸들러(`onClick`, `onChange` 등) 직접 바인딩
  - Supabase Realtime 구독
- 클라이언트 컴포넌트는 가능한 한 **리프 노드(최하위)** 에 배치한다
- 서버 컴포넌트에서 데이터를 패치한 뒤 클라이언트 컴포넌트에 props로 전달하는 패턴 사용

---

## 5. 서비스 레이어 패턴

- 모든 Supabase 쿼리는 `lib/services/*.service.ts`에 작성한다
- 페이지·컴포넌트에서 직접 Supabase 쿼리 작성 금지
- 서비스 파일 명명: `{도메인}.service.ts` (예: `event.service.ts`)
- 참조 패턴: `lib/services/profile.service.ts`

```typescript
// ✅ 올바른 패턴 (profile.service.ts 참조)
import { type Tables, type TablesInsert } from "@/lib/database.types";

export type Event = Tables<"events">;
export type EventInsert = TablesInsert<"events">;

export async function getEvent(id: string): Promise<Event | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("이벤트 조회 오류:", error);
    return null;
  }
  return data;
}

// ❌ 금지 — 페이지에서 직접 쿼리
export default async function EventPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*"); // 금지
}
```

---

## 6. 데이터베이스 타입 규칙

- `lib/database.types.ts`는 **직접 편집 금지** — 항상 Supabase CLI로 재생성
- 재생성 명령: `npx supabase gen types typescript --local > lib/database.types.ts`
- DB 스키마 변경 시 **반드시** 타입 재생성 후 커밋한다
- 타입 사용:

```typescript
import {
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "@/lib/database.types";

type Event = Tables<"events">; // SELECT 결과
type EventInsert = TablesInsert<"events">; // INSERT 입력
type EventUpdate = TablesUpdate<"events">; // UPDATE 입력
```

---

## 7. 마이그레이션 작성 규칙

- 파일 위치: `supabase/migrations/`
- 명명 형식: `{순번4자리}_{설명}.sql` (예: `0004_create_events_table.sql`)
- 기존 마이그레이션 파일 편집 금지 — 변경은 새 마이그레이션으로
- 모든 테이블에 RLS 활성화 및 정책 명시 필수
- 외래키에 `ON DELETE CASCADE` 여부를 명시적으로 지정
- `updated_at` 컬럼이 있으면 자동 업데이트 트리거 작성

```sql
-- ✅ 필수 포함 항목
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON events FOR SELECT USING (...);
```

---

## 8. 게스트 인증 전략

- 게스트는 Supabase Auth 사용 안 함 — **guest_token** 방식으로 식별
- `participants` 테이블 INSERT 시 PostgreSQL이 `guest_token` 자동 생성 (`gen_random_bytes(16)`)
- 클라이언트는 `localStorage`에 `guestToken_{eventId}` 키로 저장
- 재방문 시 `localStorage` 토큰으로 기존 응답 조회·수정 (`useGuestSession.ts` 활용)
- SSR 환경에서 `localStorage` 접근 시 반드시 가드 처리:

```typescript
// ✅ SSR 안전 접근
const token =
  typeof window !== "undefined"
    ? localStorage.getItem(`guestToken_${eventId}`)
    : null;
```

---

## 9. 라우팅 보호 전략

| 경로                      | 보호 여부 | 처리                               |
| ------------------------- | --------- | ---------------------------------- |
| `/dashboard`, `/events/*` | 인증 필요 | 미인증 시 `/auth/login` 리다이렉트 |
| `/join/*`                 | 공개      | 보호 없음                          |
| `/auth/*`                 | 공개      | 보호 없음                          |
| `/`                       | 공개      | 보호 없음                          |

- 보호 로직은 `middleware.ts`에서만 관리한다
- 새 보호 라우트 추가 시 반드시 `middleware.ts`도 함께 수정한다

---

## 10. 컴포넌트 작성 규칙

- 파일명: `kebab-case.tsx` (예: `availability-grid.tsx`)
- 컴포넌트명: `PascalCase` (예: `AvailabilityGrid`)
- shadcn/ui 컴포넌트 추가: `npx shadcn@latest add {component}` 사용
- `components/ui/` 내 파일 직접 편집 금지
- 재사용 컴포넌트는 `components/` 최상위에 배치
- 페이지 전용 서브컴포넌트는 해당 페이지 폴더 내에 배치 가능

---

## 11. 히트맵 그리드 구현 규칙

- 컴포넌트 위치: `components/availability-grid.tsx`
- 색상 강도: `available_count / total_participants` 비율로 `bg-green-{100|200|300|400|500|600}` 동적 적용
- Realtime 구독: `availability_dates` 테이블의 `postgres_changes` 채널 사용
- 구독 정리: 컴포넌트 언마운트 시 `channel.unsubscribe()` 반드시 호출

---

## 12. 더미 데이터 관리 (Phase 1 전용)

- 더미 데이터는 `lib/mock/` 디렉토리에만 작성
- Phase 2 실데이터 연동 시 `lib/mock/` 임포트를 서비스 호출로 교체
- 더미 데이터를 컴포넌트 파일 내에 하드코딩 금지

---

## 13. 파일 동시 수정 요건

| 작업                | 수정 필수 파일                                                          |
| ------------------- | ----------------------------------------------------------------------- |
| DB 테이블 추가/변경 | `supabase/migrations/{N}.sql` + `lib/database.types.ts` (재생성)        |
| 새 서비스 추가      | `lib/services/{도메인}.service.ts` + 대응 훅 `lib/hooks/use{Domain}.ts` |
| 새 보호 라우트 추가 | `app/{경로}/page.tsx` + `middleware.ts`                                 |
| 새 공개 라우트 추가 | `app/{경로}/page.tsx` (middleware.ts 예외 목록 확인)                    |
| ROADMAP 작업 완료   | `docs/ROADMAP.md` — 해당 TASK 상태를 `DONE ✅`으로 변경 + 진행률 갱신   |
| 인증 플로우 변경    | `app/auth/actions.ts` + `app/auth/callback/route.ts`                    |

---

## 14. 코드 스타일 규칙

- 들여쓰기: **2칸 스페이스**
- 변수·함수명: `camelCase`
- 컴포넌트명: `PascalCase`
- 타입·인터페이스명: `PascalCase`
- 상수: `UPPER_SNAKE_CASE`
- 주석: **한국어** 작성
- 커밋 메시지: 한국어, 이모지 컨벤션 (예: `✨ feat: 이벤트 생성 기능 추가`)
- Prettier + ESLint 설정 준수 (`.prettierrc`, `eslint.config.mjs` 참조)

---

## 15. 서버 액션 작성 규칙

- 파일 최상단 또는 함수 최상단에 `"use server"` 디렉티브 명시
- 각 액션 내부에서 `createClient()` 새로 생성 (전역 클라이언트 재사용 금지)
- 인증이 필요한 액션에서는 반드시 `supabase.auth.getUser()` 로 사용자 검증

```typescript
"use server";
import { createClient } from "@/lib/supabase/server";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("인증 필요");
  // ...
}
```

---

## 16. 금지 사항

- `lib/database.types.ts` 직접 편집 — CLI 재생성만 허용
- `components/ui/` 내 shadcn 원본 파일 편집
- 기존 마이그레이션 파일(`supabase/migrations/*.sql`) 내용 수정
- 모듈 최상위에서 서버 Supabase 클라이언트 생성 후 전역 저장
- 페이지·컴포넌트에서 Supabase 쿼리 직접 작성 (서비스 레이어 우회)
- `localStorage` 접근 시 SSR 가드 없이 사용
- Phase 1 더미 데이터를 `lib/mock/` 외부 파일에 하드코딩
- ROADMAP TASK 완료 후 `docs/ROADMAP.md` 업데이트 누락
- 새 보호 라우트 추가 시 `middleware.ts` 수정 누락
- `"use client"` 없이 브라우저 API 또는 React 훅 사용
