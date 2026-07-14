# PRD: 언제 만나요

> 직장인 회식 날짜 조율과 참여자 관리를 하나의 초대 링크로 처리하는 웹 서비스

---

## 1. 프로젝트 개요

| 항목      | 내용                                                      |
| --------- | --------------------------------------------------------- |
| 앱명      | 언제 만나요                                               |
| 목적      | 회식 주최자의 날짜 조율 + 참여자 관리를 단순화            |
| 개발 목표 | 포트폴리오/학습용 MVP                                     |
| 기술 스택 | Next.js 15, Supabase, TypeScript, Tailwind CSS, shadcn/ui |

### 핵심 가치 제안

회식 주최자는 이벤트를 만들고 링크 하나를 공유하면 끝. 참여자는 로그인 없이 링크만 클릭해서 가능한 날짜를 선택. 주최자는 실시간으로 집계 결과를 보고 날짜를 확정한다.

---

## 2. 타겟 사용자

### 주최자 (Authenticated)

- 직장인 팀장, 부서 회식 담당자
- Google 계정으로 로그인 후 이벤트 생성 및 관리

### 게스트 (Anonymous)

- 초대받은 직장 동료
- 로그인 불필요 — 링크 접속 후 이름 입력만으로 참여

---

## 3. 핵심 유저 플로우

### 주최자 플로우

```
랜딩 페이지 (/)
  └─→ [이벤트 만들기] 클릭
        └─→ Google 로그인 (/auth/login)
              └─→ 대시보드 (/dashboard)
                    ├─→ 새 이벤트 만들기 (/events/new)
                    │     └─→ 초대 링크 복사
                    └─→ 이벤트 관리 (/events/[id])
                          ├─→ 참여자 목록 확인
                          ├─→ 가용성 히트맵 확인
                          └─→ 최종 날짜 확정
```

### 게스트 플로우

```
초대 링크 클릭 (/join/[token])
  └─→ 이름 입력
        └─→ 가능한 날짜 선택 (달력 멀티셀렉트)
              └─→ 제출
                    └─→ 집계 결과 확인 (히트맵)
                          └─→ [내 선택 수정] (재편집 가능)
```

---

## 4. 기능 명세

### Must Have — Phase 1

| ID   | 기능명           | 설명                                                                      | 구현 페이지                     |
| ---- | ---------------- | ------------------------------------------------------------------------- | ------------------------------- |
| F001 | 이벤트 생성      | 제목/설명/장소/후보 날짜 다중 선택/마감일 입력                            | `/events/new`                   |
| F002 | 초대 링크 생성   | `nanoid(8)` 기반 고유 토큰, `/join/[token]` URL 자동 생성 + 클립보드 복사 | `/events/new`, `/events/[id]`   |
| F003 | 게스트 참여 등록 | 이름 입력 → `guest_token` 발급 → localStorage 저장                        | `/join/[token]`                 |
| F004 | 날짜 가용성 입력 | 달력 체크박스 방식 다중 날짜 선택 후 제출                                 | `/join/[token]`                 |
| F005 | 집계 그리드      | 날짜별 가능 인원수 히트맵 시각화                                          | `/events/[id]`, `/join/[token]` |
| F006 | 게스트 재편집    | localStorage `guest_token`으로 기존 선택 불러와 수정                      | `/join/[token]`                 |
| F007 | 이벤트 목록      | 주최자가 만든 이벤트 카드 목록 (상태 배지 포함)                           | `/dashboard`                    |
| F010 | Google OAuth     | Google 소셜 로그인 (기존 구현 재사용)                                     | `/auth/login`                   |

### Nice to Have — Phase 2

| ID   | 기능명             | 우선순위 | 설명                                                              |
| ---- | ------------------ | -------- | ----------------------------------------------------------------- |
| F008 | Realtime 업데이트  | 높음     | `availability_dates` 변경 시 히트맵 자동 갱신 (Supabase Realtime) |
| F009 | 히트맵 색상 강도   | 높음     | 참여 비율에 따라 `bg-green-100~600` 그라데이션 적용               |
| F011 | 이벤트 생성 Wizard | 중간     | 3단계 Step Indicator UI (기본 정보 → 날짜 선택 → 완료)            |
| F012 | 날짜 확정          | 중간     | 주최자가 최종 날짜 클릭 → 이벤트 상태 `closed` + 배너 표시        |
| F013 | 마감일 처리        | 중간     | 마감일 이후 게스트 응답 차단, 읽기 전용으로 전환                  |
| F014 | 참여자 삭제        | 중간     | 주최자가 특정 참여자 제거                                         |

### Nice to Have — Phase 3

| ID   | 기능명      | 우선순위 | 설명                             |
| ---- | ----------- | -------- | -------------------------------- |
| F015 | OG 이미지   | 낮음     | 링크 공유 시 SNS 미리보기 이미지 |
| F016 | Vercel 배포 | 낮음     | 도메인 연결 + 환경변수 설정      |

---

## 5. 페이지 구조

```
app/
├── page.tsx                       # / — 랜딩 페이지 (서비스 소개 + CTA)
├── auth/
│   ├── login/page.tsx             # /auth/login — Google 로그인 (기존 활용)
│   └── callback/route.ts          # /auth/callback — OAuth 콜백 (기존 활용)
├── dashboard/
│   ├── layout.tsx                 # 인증 가드 + 네비게이션 바
│   └── page.tsx                   # /dashboard — 이벤트 카드 목록 (F007)
├── events/
│   ├── new/
│   │   └── page.tsx               # /events/new — 이벤트 생성 (F001, F002)
│   └── [id]/
│       └── page.tsx               # /events/[id] — 이벤트 관리 (F002, F005, F012, F014)
└── join/
    └── [token]/
        └── page.tsx               # /join/[token] — 게스트 참여 (F003, F004, F005, F006)
```

### 라우팅 보호 전략

| 경로                      | 접근 권한   | 미인증 처리              |
| ------------------------- | ----------- | ------------------------ |
| `/dashboard`, `/events/*` | 로그인 필요 | `/auth/login` 리다이렉트 |
| `/join/*`                 | 전체 공개   | 없음 (로그인 불필요)     |
| `/auth/*`                 | 전체 공개   | 없음                     |

---

## 6. 데이터 모델

### 기존 테이블 (재사용)

- `auth.users` — Supabase 관리
- `profiles` — 주최자 프로필 (id = auth.users.id)

### 신규 테이블

#### `events`

```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  location        TEXT,
  invite_token    TEXT UNIQUE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'closed', 'cancelled')),
  candidate_dates DATE[] NOT NULL,
  confirmed_date  DATE,
  deadline        TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

#### `participants`

```sql
CREATE TABLE participants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_name   TEXT NOT NULL,
  guest_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  user_id      UUID REFERENCES auth.users(id),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(event_id, guest_name)
);
```

#### `availability_dates`

```sql
CREATE TABLE availability_dates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(participant_id, date)
);
```

### 테이블 관계

```
auth.users
    │
    ├──→ profiles (1:1)
    │
    └──→ events (1:N, host_id)
               │
               └──→ participants (1:N, event_id)
                         │
                         └──→ availability_dates (1:N, participant_id)
```

### RLS 정책

| 테이블               | anon                      | authenticated (host)         |
| -------------------- | ------------------------- | ---------------------------- |
| `events`             | SELECT (invite_token으로) | 본인 이벤트 CRUD             |
| `participants`       | INSERT, SELECT            | SELECT, DELETE (본인 이벤트) |
| `availability_dates` | INSERT, DELETE, SELECT    | SELECT (본인 이벤트)         |

### 핵심 집계 쿼리

```sql
SELECT date, COUNT(*) AS available_count
FROM availability_dates
WHERE event_id = $event_id
GROUP BY date
ORDER BY date;
```

---

## 7. 기술 구현 핵심 결정사항

### 게스트 인증 전략

서버 액션에서 `participants` 레코드 생성 시 PostgreSQL `gen_random_bytes(16)`으로 `guest_token`을 자동 생성. 클라이언트는 `localStorage`에 `guestToken_[eventId]` 키로 저장하고, 재방문 시 이 토큰으로 기존 응답을 조회·수정.

### invite_token 생성

서버 액션 내 `nanoid(8)` 또는 PostgreSQL `encode(gen_random_bytes(6), 'base64')`로 생성. DB `UNIQUE` 제약과 서버 액션 재시도 로직으로 충돌 방지.

### 히트맵 구현

shadcn/ui `Table` 기반, 각 셀에 `available_count / total_participants` 비율로 `bg-green-{100~600}` Tailwind 클래스를 동적 적용. Supabase Realtime `postgres_changes` 채널로 실시간 업데이트 구독.

### 재사용 가능한 기존 코드

| 파일                                  | 재사용 방식                                           |
| ------------------------------------- | ----------------------------------------------------- |
| `lib/supabase/server.ts`, `client.ts` | 그대로 활용                                           |
| `lib/services/profile.service.ts`     | 패턴 복제 → 신규 서비스 작성                          |
| `components/google-oauth-button.tsx`  | 랜딩 페이지 CTA 재사용                                |
| `app/auth/*`                          | 기존 그대로, 로그인 후 `/dashboard` 리다이렉트만 변경 |
| `supabase/migrations/0001_*.sql`      | 마이그레이션 패턴 참고                                |

---

## 8. 개발 로드맵

### Phase 1 (1~2주): 핵심 플로우 동작

목표: 이벤트 생성 → 링크 공유 → 게스트 응답 → 집계 확인 전체 플로우 동작

1. Supabase 마이그레이션 3개 작성 (`events`, `participants`, `availability_dates`)
2. `lib/database.types.ts` 재생성 (`supabase gen types`)
3. 서비스 레이어 작성
   - `lib/services/event.service.ts` — 이벤트 CRUD, invite_token 생성
   - `lib/services/participant.service.ts` — 게스트 등록, guest_token 관리
   - `lib/services/availability.service.ts` — 날짜 가용성 저장/조회/집계
4. 커스텀 훅: `lib/hooks/useGuestSession.ts` (localStorage guest_token 관리)
5. 페이지 구현 (4개)
6. `middleware.ts` 인증 라우트 보호 추가

### Phase 2 (1주): UI 완성도 + Realtime

목표: 포트폴리오 품질의 UI/UX 완성

1. 히트맵 그리드 컴포넌트 (`components/availability-grid.tsx`)
2. Supabase Realtime 구독 (`availability_dates` 변경 → 자동 업데이트)
3. 이벤트 생성 3단계 Wizard UI (Step Indicator)
4. 모바일 반응형 최적화 + 로딩 스켈레톤 + 토스트 알림

### Phase 3 (1주): 완성 + 배포

목표: 서비스 완성 및 포트폴리오 제출

1. 최종 날짜 확정 + 이벤트 마감일 처리
2. 참여자 삭제 (주최자 권한)
3. 랜딩 페이지 리디자인 (기존 기본 페이지 교체)
4. OG 이미지 설정 + Vercel 배포 + README

**예상 개발 기간**: 풀타임 3~~4주 / 파트타임(2~~3시간/일) 6~8주

---

## 9. 검증 체크리스트

- [ ] Supabase 대시보드에서 신규 테이블 3개 확인
- [ ] 주최자: Google 로그인 → 이벤트 생성 → 초대 링크 복사 → 대시보드 표시
- [ ] 게스트: 시크릿 창에서 링크 접속 → 이름 입력 → 날짜 선택 → 집계 확인
- [ ] 게스트 재편집: 재방문 시 기존 선택 불러오기 + 수정 저장
- [ ] Realtime: 두 탭에서 동시 접속 → 한쪽 입력 시 반대쪽 히트맵 자동 업데이트
- [ ] 미들웨어: 비로그인 상태로 `/dashboard` 접근 시 `/auth/login` 리다이렉트
- [ ] 만료/존재하지 않는 토큰 접근 시 적절한 에러 처리
