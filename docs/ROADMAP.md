# 언제 만나요 개발 로드맵

직장인 회식 날짜 조율과 참여자 관리를 하나의 초대 링크로 처리하는 웹 서비스

## 개요

언제 만나요는 모임 주최자와 참여자를 위한 간편한 일정 조율 서비스로 다음 기능을 제공합니다:

- **이벤트 생성 및 초대 링크**: 후보 날짜를 등록하고 하나의 링크(`/join/[token]`)로 참여자를 초대
- **게스트 가용성 입력**: 로그인 없이 이름만으로 참여하고 가능한 날짜를 달력에서 멀티셀렉트
- **실시간 집계 히트맵**: 날짜별 가능 인원수를 색상 강도로 시각화하여 최적의 날짜를 한눈에 파악

> **UI 우선 개발 전략**: UI/UX를 먼저 확정한 후 DB 스키마를 설계하여 불필요한 마이그레이션 변경을 최소화

## 기술 스택

- **프레임워크**: Next.js 15 (App Router), React 19
- **언어**: TypeScript
- **백엔드/DB**: Supabase (PostgreSQL, Auth, Realtime)
- **스타일링**: Tailwind CSS, shadcn/ui
- **인증**: Supabase Auth (Google OAuth)
- **배포**: Vercel

## 전체 진행률

```
전체 진행률: 100% (18/18 완료)

Phase 1 (UI 프로토타입):  [██████████] 100% (9/9)  ✅
Phase 2 (백엔드 연동):    [██████████] 100% (7/7)  ✅
Phase 3 (완성/배포):     [██████████] 100% (3/3) ✅
```

> 상태 범례: `TODO` (대기) / `IN_PROGRESS` (진행 중) / `DONE` (완료 ✅)

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - `/tasks` 디렉토리에 새 작업 파일 생성 (명명 형식: `XXX-description.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 진행 상황 업데이트, 완료 후 중단하고 추가 지시 대기

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시하고 전체 진행률 갱신

---

## Phase 1: UI 프로토타입 (1~2주)

> 목표: 모든 화면을 더미 데이터로 먼저 구현하여 UI/UX를 빠르게 확정. 히트맵 그리드/Wizard 등 핵심 UI 컴포넌트, 인증 라우트 보호, Admin 대시보드까지 포함하여 전체 사용자 플로우를 체험 가능하게 구축
> 대상 기능(UI): F001~F019 (더미 데이터 기반)

### TASK-001: 페이지 골격 및 라우팅 + 더미 데이터 구축 `DONE` ✅

> 우선순위 · 예상 소요: 2일

- `app/events/new/page.tsx` 골격 (이벤트 생성, F001)
- `app/dashboard/page.tsx` 골격 (이벤트 목록, F007)
- `app/join/[token]/page.tsx` 골격 (게스트 참여 + 가용성 입력, F002~F004)
- `app/events/[id]/page.tsx` 골격 (이벤트 관리 + 집계 그리드, F005)
- 더미 데이터 생성 유틸리티 작성(`lib/mock/`) 및 페이지 네비게이션 플로우 검증

### TASK-002: 랜딩 페이지 UI 구현 `DONE` ✅

> 예상 소요: 1.5일

- `app/page.tsx` 랜딩 페이지 (히어로, 기능 소개, CTA)
- 서비스 가치 제안 및 사용 흐름 시각화
- 라이트/다크 모드 대응 및 반응형 최적화

### TASK-003: 대시보드 UI 구현 (더미 데이터) `DONE` ✅

> 예상 소요: 1일 · 기능: F007

- 이벤트 목록 카드 UI 구현 (더미 데이터)
- 이벤트 상태(진행/마감/확정) 뱃지 표시
- 빈 상태(empty state) 및 신규 이벤트 생성 진입점

### TASK-004: 이벤트 생성 Wizard UI `DONE` ✅

> 예상 소요: 1.5일 · 기능: F001, F011

- 3단계 Wizard UI 구현 (기본 정보 → 후보 날짜 → 마감일/확인)
- 단계별 유효성 검증 (React Hook Form + Zod)
- 진행 표시기(stepper) 및 이전/다음 네비게이션, 단계 간 입력값 상태 보존

### TASK-005: 게스트 참여 + 가용성 입력 UI `DONE` ✅

> 예상 소요: 1.5일 · 기능: F002, F003, F004

- 게스트 참여 등록 폼 UI (이름 입력, 로그인 불필요)
- 달력 멀티셀렉트 가용성 입력 UI (더미 후보 날짜)
- 초대 링크 화면 레이아웃 및 입력 완료 피드백

### TASK-006: 이벤트 관리 + 히트맵 그리드 컴포넌트 `DONE` ✅

> 예상 소요: 1.5일 · 기능: F005, F009

- 집계 그리드 전용 컴포넌트 분리 및 재사용성 확보 (더미 집계 데이터)
- 참여 비율 기반 색상 강도 그라데이션 (히트맵 색상 강도)
- 날짜별 가능 참여자 목록 툴팁/팝오버, 최적 날짜 하이라이트

### TASK-007: 반응형 및 UX 폴리싱 `DONE` ✅

> 예상 소요: 1.5일

- 모바일 반응형 레이아웃 (달력 멀티셀렉트, 히트맵 모바일 최적화)
- 로딩 스켈레톤 적용 (대시보드, 집계 그리드)
- 토스트 알림(생성/저장/오류 피드백), 접근성 기준 적용 (키보드 네비게이션, ARIA)

### TASK-008: 인증 라우트 보호 미들웨어 `DONE` ✅

> 예상 소요: 0.5일 · 기반: F010 Google OAuth (기존 구현 재사용)

- `middleware.ts`에 인증 필요 라우트(`/dashboard`, `/events/new`, `/events/[id]`) 보호 추가
- 게스트 공개 라우트(`/join/[token]`) 예외 처리
- 미인증 사용자 리디렉션 처리
- **테스트 체크리스트**: Playwright MCP로 인증/비인증 접근 시나리오 E2E 테스트

### TASK-008-1: Admin 대시보드 UI 구현 `DONE` ✅

> 예상 소요: 2일 · 기능: F017, F018, F019

- ✅ 이벤트 관리 UI 구현 (전체 이벤트 목록, 상태 관리, 상태 필터) (F017)
- ✅ 사용자 관리 UI 구현 (사용자 목록, 생성 이벤트 갯수, 참여 이벤트 갯수 표시) (F018)
- ✅ 통계 분석 UI 구현 (전체 통계 정보, 상태별 분포, 최근 이벤트) (F019)
- ✅ 관리자 전용 레이아웃 및 사이드바 네비게이션 구성 (더미 데이터 기반)
- ✅ **관리자 인증 필수**: `ADMIN_EMAILS` 환경변수로 관리자 지정, middleware + layout에서 이중 검증

---

## Phase 2: 백엔드 연동 (1주)

> 목표: 확정된 UI를 기준으로 Supabase 스키마를 설계하고, 타입 정의 및 서비스 레이어를 구현한 뒤 더미 데이터를 실제 Supabase 데이터로 교체. Realtime 동기화까지 완성
> 대상 기능(실데이터): F002~F006, F008

### TASK-009: Supabase 데이터베이스 마이그레이션 작성 `DONE` ✅

> 우선순위 · 예상 소요: 1일

- ✅ `events` 테이블 마이그레이션 (0004_create_events_table.sql)
  - 제목/설명/장소/후보 날짜/마감일/host_id/status/confirmed_date/invite_token
  - RLS 정책: 주최자 CRUD, 게스트는 SELECT만
  - 인덱스: invite_token, host_id, created_at DESC, status
- ✅ `participants` 테이블 마이그레이션 (0005_create_participants_table.sql)
  - event_id, guest_name, guest_token, user_id
  - UNIQUE(event_id, guest_name) 제약
  - RLS 정책: 주최자는 삭제/조회, 본인은 수정/조회 가능
- ✅ `availability_dates` 테이블 마이그레이션 (0006_create_availability_dates_table.sql)
  - participant_id, event_id, date 정규화
  - UNIQUE(participant_id, date) 제약
  - RLS 정책: 모두 조회 가능, 본인/주최자만 수정/삭제
  - 인덱스: (event_id, date), participant_id, date
- ✅ 자동 updated_at 트리거 구현 (events, participants)
- ✅ Docker 시작 → supabase db push → supabase gen types

### TASK-009-1: profiles 테이블 RLS 정책 검증 및 수정 `DONE` ✅

> 예상 소요: 0.5일

- ✅ `is_admin` 컬럼 추가 (0007_add_is_admin_to_profiles.sql)
  - Admin 사용자 구분을 위한 boolean 컬럼
  - 기본값: FALSE (모든 사용자는 기본적으로 일반 사용자)
- ✅ RLS 정책 수정
  - SELECT 정책: 자신의 프로필 또는 Admin 사용자만 모든 프로필 조회 가능
  - UPDATE 정책: 자신의 프로필만 수정 가능
  - DELETE 정책: 자신의 프로필만 삭제 가능
  - INSERT 정책: auth 시스템이 자동 생성
- ✅ Admin 사용자 설정 (hjkoh0907@gmail.com의 is_admin = true)
- ✅ database.types.ts 재생성 (is_admin 필드 추가)
- ✅ Admin 대시보드 기능 검증
  - getAllProfiles(): Admin이 모든 프로필 조회 가능하도록 RLS 보호
  - getProfileByEmail(): 다른 사용자의 프로필 조회 가능
  - 이중 권한 검증 (App 레벨 + DB 레벨)

### TASK-010: database.types.ts 재생성 및 타입 정의 `DONE` ✅

> 예상 소요: 0.5일

- ✅ Supabase CLI로 `lib/database.types.ts` 자동 재생성
  - profiles 테이블 타입 (Row, Insert, Update, Relationships)
  - events 테이블 타입 (초대 토큰, 후보 날짜, RLS 정책)
  - participants 테이블 타입 (게스트 이름, 토큰, 사용자 참조)
  - availability_dates 테이블 타입 (날짜별 가용성 데이터)
- ✅ 도메인 타입 정의: events, participants, availability_dates 자동 생성
- ✅ 폼 입력 / API 응답 타입: Insert, Update 타입 자동 생성
- ✅ Relationships 정의: 외래키 참조 자동 생성

### TASK-011: 서비스 레이어 구현 `DONE` ✅

> 예상 소요: 2일 · 기능: F002, F003

- ✅ `lib/services/shared/` 구현 (공유 타입 및 유틸리티 함수)
  - `types.ts`: `ServiceResult<T>`, `PaginationParams`, `PaginationResult<T>` 타입
  - `utils.ts`: `handleSupabaseError()`, `createSuccessResponse()`, `createErrorResponse()` 함수
- ✅ `lib/schemas/` 구현 (Zod 스키마, 한국어 에러 메시지)
  - `auth.ts`: `signUpSchema`, `loginSchema`, `passwordResetSchema`, `updatePasswordSchema`
  - `profile.ts`: `updateProfileSchema`
- ✅ `lib/services/server/` 구현 (서버 사이드 서비스, Fluid Compute 호환)
  - `auth.service.ts`: `signUpUser()`, `signInUser()`, `signOutUser()`, `resetPassword()`, `updatePassword()`
  - `profile.service.ts`: `getProfile()`, `createProfile()`, `updateProfile()`, `deleteProfile()`, `getProfileByEmail()`, `getAllProfiles()`
- ✅ `lib/services/client/` 구현 (클라이언트 사이드 서비스)
  - `profile.service.ts`: 클라이언트 전용 `getProfile()`, `updateProfile()`
- ✅ React Hook Form + Zod 통합 (폼 리팩토링)
  - `components/sign-up-form.tsx`: `useForm()`, `zodResolver()`, 필드 에러 표시
  - `components/login-form.tsx`: `useForm()`, `zodResolver()`, 에러 처리
- ✅ 문서화
  - `lib/services/README.md`: 서비스 레이어 가이드
  - `docs/guides/service-layer.md`: 아키텍처 개요 및 사용 패턴
- ✅ **테스트 체크리스트**: Playwright MCP로 회원가입/로그인 E2E 테스트 완료
  - Test 1: 비밀번호 불일치 검증 ✅
  - Test 2: 유효한 데이터 회원가입 ✅
  - Test 3-1: 빈 필드 로그인 검증 ✅
  - Test 3-2: 유효한 데이터 로그인 ✅

### TASK-012: 더미→실데이터 연동 및 게스트 세션 `DONE` ✅

> 예상 소요: 2일 · 기능: F004, F005, F006

- ✅ `lib/hooks/useGuestSession.ts` 구현 (localStorage guest_token 관리, F006 재편집 기반)
- ✅ 게스트 식별 및 재방문 시 기존 응답 복원 로직, SSR 안전성 처리(localStorage 접근 가드)
- ✅ 4개 페이지를 서비스 레이어와 연결 (더미 데이터 제거), 집계 그리드 실데이터 렌더링
- ✅ 서비스 레이어 확장: events, participants, availability 3개 서비스 구현
- ✅ RLS 정책 수정 (0008_fix_events_rls_policy.sql): 순환 참조 문제 해결
- ✅ TypeScript, ESLint 최종 검증 통과
- **테스트**: Playwright MCP로 주최자/게스트 플로우 검증, 대시보드 정상 작동 확인

### TASK-012-1: Admin 대시보드 백엔드 연동 `DONE` ✅

> 예상 소요: 1.5일 · 기능: F017, F018, F019 (더미→실데이터)

- ✅ Admin 서비스 레이어 구현 (`lib/services/server/admin.service.ts`)
  - `getAllEvents()`: 전체 이벤트 목록 조회 (참여자 수, 주최자 프로필 집계)
  - `getAllProfiles()`: 전체 사용자 프로필 조회 (생성/참여 이벤트 수 통계)
  - `getEventStats()`: 전체 통계 데이터 (이벤트 상태별 분포, 최근 5개 이벤트)
- ✅ Admin 대시보드 UI를 실데이터로 교체
  - `app/admin/events/page.tsx`: 실제 이벤트 목록, 상태 필터링, 주최자 이름/이메일 표시
  - `app/admin/users/page.tsx`: 실제 사용자 목록 (생성/참여 이벤트 수, 관리자 권한 뱃지)
  - `app/admin/stats/page.tsx`: 실제 통계 데이터 렌더링 (상태별 분포 막대, 최근 이벤트)
- ✅ Admin 권한 검증 (profiles.is_admin 컬럼 기반, App/DB 레벨 이중 검증)
  - proxy.ts: 인증 확인만 수행 (환경변수 검증 제거)
  - admin/layout.tsx: profiles.is_admin으로만 Admin 권한 판단
- ✅ **테스트 체크리스트**: `tests/admin-dashboard.spec.ts`
  - 비인증 접근 리다이렉트 4개 테스트 통과
  - 관리자 데이터 조회 5개 테스트 (ADMIN_TEST_PASSWORD 미설정 시 스킵)

### TASK-013: Supabase Realtime 구독 구현 `DONE` ✅

> 예상 소요: 1.5일 · 기능: F008

- ✅ `lib/hooks/useRealtimeAvailability.ts` 구현
  - `availability_dates` / `participants` 테이블 단일 채널 구독 (event_id 필터링)
  - 변경 감지 시 DB 재조회 후 집계 재계산 (`aggregateAvailability` 유틸 활용)
  - 연결 상태(`isConnected`) 및 마지막 업데이트 시간(`lastUpdatedAt`) 추적
  - 컴포넌트 언마운트 시 자동 구독 해제 (메모리 누수 방지)
- ✅ `components/events/event-detail-client.tsx` 구현
  - `useRealtimeAvailability` 훅 연동, SSR 초기값 즉시 렌더링
  - 연결 상태 배지 (`data-testid="connection-badge"`) 및 마지막 업데이트 시간 표시
  - 참여자 목록 (`data-testid="participants-card"`, `participant-item-{name}`) 실시간 갱신
  - 히트맵 그리드 (`data-testid="heatmap-card"`) 실시간 갱신
- ✅ `app/events/[id]/page.tsx`: SSR 초기 데이터를 EventDetailClient에 전달
- ✅ **테스트 체크리스트**: `tests/realtime-update.spec.ts`
  - 연결 상태 배지 렌더링 테스트 (TEST_EVENT_ID 환경변수 필요)
  - 참여자 카드 렌더링 테스트 (TEST_EVENT_ID 환경변수 필요)
  - 멀티 컨텍스트 참여자 수 실시간 증가 테스트 (TEST_EVENT_ID + TEST_INVITE_TOKEN 필요)
  - 마지막 업데이트 시간 표시 테스트 (TEST_EVENT_ID + TEST_INVITE_TOKEN 필요)
  - 두 게스트 순차 참여 시 카운트 2 증가 테스트 (TEST_EVENT_ID + TEST_INVITE_TOKEN 필요)
  - 유효하지 않은 초대 토큰 에러 처리 테스트 ✅ (환경변수 불필요, 통과)

---

## Phase 3: 완성 + 배포 (1주)

> 목표: 날짜 확정/마감 처리, 통합 테스트 작성 후 OG 이미지/배포/문서화로 프로덕션 출시
> 대상 기능: F012, F013, F015, F016 + 핵심 기능 통합 테스트

### TASK-014: 날짜 확정 및 마감일 처리 `DONE` ✅

> 우선순위 · 예상 소요: 2일 · 기능: F012, F013

- ✅ 주최자 날짜 확정 기능 (확정 날짜 표시 및 알림)
  - confirmEventDate() 서비스 함수 구현
  - ConfirmDateButton 컴포넌트 추가 (날짜 선택 UI)
  - 확정 시 status → 'confirmed' 자동 변경
- ✅ 마감일 도래 시 가용성 입력 잠금 처리
  - isEventClosed() 헬퍼 함수로 마감일 체크
  - HostAvailabilityForm 마감 시 비활성화
  - 마감됨 배지 표시
- ✅ 확정/마감 상태에 따른 UI 분기
  - 서버 컴포넌트: isEventClosed 체크 후 상태 표시
  - 클라이언트: Realtime 구독으로 event 상태 변경 감시
- ✅ **테스트 체크리스트**: Playwright MCP E2E 테스트 작성 (5개 시나리오)
  - Test 1: 주최자 날짜 확정 가능
  - Test 2: 마감된 이벤트 표시
  - Test 3: 비인증 사용자 접근 처리
  - Test 4: Realtime 구독으로 상태 변경 반영
  - Test 5: HostAvailabilityForm 상태 관리

**커밋**: 21e3c51d ✨ feat: TASK-014 날짜 확정 및 마감일 처리 기능 구현

### TASK-015: 핵심 기능 통합 테스트 `DONE` ✅

> 예상 소요: 1.5일 · 기능: 전체 플로우 통합 테스트

✅ Playwright를 활용한 E2E 통합 테스트로 주요 사용자 플로우 검증 완료

1. **✅ 주최자 플로우** (3개 테스트)
   - 이벤트 생성 가능 확인
   - 초대 링크 복사 기능
   - 대시보드에서 이벤트 확인

2. **✅ 참여자 플로우** (3개 테스트)
   - 초대 링크로 게스트 접근
   - 달력에서 가용 날짜 선택
   - 재편집 토큰 저장 및 복원

3. **✅ 관리자 플로우** (4개 테스트)
   - Admin 대시보드 접근
   - 이벤트 관리 탭 접근
   - 사용자 관리 탭 접근
   - 통계 분석 탭 접근

4. **✅ 에러 핸들링 및 엣지 케이스** (5개 테스트)
   - 유효하지 않은 초대 토큰 처리
   - 마감된 이벤트 입력 불가
   - 비인증 사용자 보호 라우트
   - 동시 참여 처리 (Realtime 업데이트)
   - 네트워크 오류 처리

5. **✅ 특수 시나리오** (1개 테스트)
   - 날짜 확정 플로우 검증

**테스트 파일**: `tests/integration-flow.spec.ts` (16개 시나리오)
**커밋**: dde0a5ef ✨ feat: TASK-015 핵심 기능 통합 E2E 테스트 추가

### TASK-016: OG 이미지 + Vercel 배포 + README `TODO` `DONE` ✅

> 예상 소요: 1일 · 기능: F015, F016

✅ OG 이미지 생성

- app/opengraph-image.tsx: Next.js ImageResponse 기반 동적 생성
- 그라디언트 배경, 한글 타이틀, 서비스 설명

✅ 메타데이터 강화

- app/layout.tsx: OpenGraph, Twitter Card 태그 추가
- 한국어 메타데이터 설정

✅ README 문서화

- 서비스 소개 및 주요 기능 설명
- 기술 스택, 로컬 셋업 가이드
- Vercel 배포 가이드 포함

✅ Vercel 배포 설정

- vercel.json 생성 (buildCommand, 환경변수 스키마)

✅ 프로덕션 빌드 검증 및 완료

- 빌드 성공
- TypeScript/ESLint 검사 통과
- 모든 라우트 정상 렌더링

**커밋**: fb776f1d ✨ feat: TASK-016 OG 이미지 + Vercel 배포 + README 업데이트

---

## 예상 일정 요약

| Phase   | 기간  | 주요 산출물                                             |
| ------- | ----- | ------------------------------------------------------- |
| Phase 1 | 1~2주 | UI 프로토타입 (더미 데이터로 전체 화면/플로우 완성)     |
| Phase 2 | 1주   | Supabase 스키마, 서비스 레이어, 실데이터 연동, Realtime |
| Phase 3 | 1주   | 확정/마감, 참여자 관리, OG 이미지, 배포                 |

**총 예상 기간**: 풀타임 3~~4주 / 파트타임 6~~8주

## 기능 매핑 참조

| 기능 ID  | 기능명                    | 관련 Task          | 상태   |
| -------- | ------------------------- | ------------------ | ------ |
| F001     | 이벤트 생성               | TASK-001, TASK-004 | ✅     |
| F002     | 초대 링크 생성            | TASK-005, TASK-011 | ✅     |
| F003     | 게스트 참여 등록          | TASK-005, TASK-011 | ✅     |
| F004     | 날짜 가용성 입력          | TASK-005, TASK-012 | ✅     |
| F005     | 집계 그리드               | TASK-006, TASK-012 | ✅     |
| F006     | 게스트 재편집             | TASK-012           | ✅     |
| F007     | 이벤트 목록               | TASK-003           | ✅     |
| F008     | Realtime 업데이트         | TASK-013           | ✅     |
| F009     | 히트맵 색상 강도          | TASK-006           | ✅     |
| F010     | Google OAuth              | TASK-008           | ✅     |
| F011     | 이벤트 생성 Wizard        | TASK-004           | ✅     |
| F012     | 날짜 확정                 | TASK-014           | ✅     |
| F013     | 마감일 처리               | TASK-014           | ✅     |
| F015     | OG 이미지                 | TASK-016           | ✅     |
| F016     | Vercel 배포 + README      | TASK-016           | ✅     |
| F017     | 이벤트 관리 (Admin)       | TASK-008-1         | ✅     |
| F018     | 사용자 관리 (Admin)       | TASK-008-1         | ✅     |
| F019     | 통계 분석 (Admin)         | TASK-008-1         | ✅     |
| **TEST** | **핵심 기능 통합 테스트** | **TASK-015**       | **✅** |

> 참고: F014 (참여자 삭제)는 불필요한 기능으로 판단되어 제거됨
