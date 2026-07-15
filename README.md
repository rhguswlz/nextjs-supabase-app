# 언제 만나요

> 직장인 회식부터 동창회까지, 복잡한 일정 조율을 하나의 링크로 해결하세요

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Flanguage-exchange-app&project-name=when-to-meet&repository-name=when-to-meet)

## 🎯 소개

**언제 만나요**는 복잡한 일정 조율을 간단하게 해주는 웹 서비스입니다.

- **초대 링크로 쉬운 공유**: 복잡한 가입 과정 없이 초대 링크 하나로 모두 참여
- **직관적인 달력 선택**: 가능한 날짜를 달력에서 간단하게 선택
- **실시간 결과 확인**: 참여자들의 가용성을 색상으로 시각화한 히트맵에서 최적의 날짜 한눈에 파악
- **관리자 대시보드**: 생성한 모든 이벤트를 한곳에서 관리

## ✨ 주요 기능

### 주최자

- 📅 **이벤트 생성**: 후보 날짜를 등록하고 초대 링크 생성
- 🔗 **초대 링크 공유**: 카톡, 메일 등 원하는 방식으로 초대
- 📊 **실시간 집계**: 참여자들의 가용성을 히트맵으로 시각화
- ✅ **날짜 확정**: 최적의 날짜를 선택하고 확정

### 참여자

- 🎫 **로그인 없이 참여**: 초대 링크로 바로 접근, 로그인 불필요
- 📅 **가용성 입력**: 달력에서 편하게 날짜 선택
- 💾 **재편집**: 입력한 정보를 언제든 수정 가능

## 🛠️ 기술 스택

- **프레임워크**: [Next.js 15](https://nextjs.org) (App Router)
- **언어**: [TypeScript](https://www.typescriptlang.org)
- **데이터베이스**: [Supabase](https://supabase.com) (PostgreSQL)
- **인증**: [Supabase Auth](https://supabase.com/docs/guides/auth) (Google OAuth)
- **UI 라이브러리**: [shadcn/ui](https://ui.shadcn.com)
- **스타일**: [Tailwind CSS](https://tailwindcss.com)
- **상태 관리**: [Zustand](https://github.com/pmndrs/zustand)
- **폼 관리**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- **배포**: [Vercel](https://vercel.com)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm, yarn, 또는 pnpm

### 로컬 개발 환경 설정

1. **저장소 클론**

   ```bash
   git clone https://github.com/your-username/when-to-meet.git
   cd when-to-meet
   ```

2. **Supabase 프로젝트 생성**

   [Supabase Dashboard](https://database.new)에서 새 프로젝트 생성

3. **환경 변수 설정**

   `.env.local` 파일 생성 및 다음 내용 추가:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

   > 이 값들은 [Supabase Dashboard](https://supabase.com/dashboard/project/_?showConnect=true)의 API 설정에서 확인할 수 있습니다.

4. **Supabase 로컬 셋업 (선택사항)**

   ```bash
   npm install -g supabase
   supabase start
   supabase gen types typescript --local > lib/database.types.ts
   ```

5. **의존성 설치 및 개발 서버 실행**

   ```bash
   npm install
   npm run dev
   ```

   브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📋 주요 명령어

```bash
# 개발 서버 실행 (핫 리로드 지원)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# ESLint 코드 검사
npm run lint

# E2E 테스트 실행
npm run test:e2e

# E2E 테스트 UI 모드로 실행
npm run test:e2e-ui
```

## 🌐 배포

### Vercel 배포 (권장)

가장 간단한 배포 방법입니다. Vercel은 Next.js의 개발사에서 제공하며, Supabase와의 통합이 잘 지원됩니다.

**빠른 배포 (1클릭)**:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fwhen-to-meet&project-name=when-to-meet)

**수동 배포 단계**:

1. [Vercel](https://vercel.com)에 가입
2. GitHub에 저장소 푸시
3. Vercel Dashboard에서 "Add New Project" 선택
4. 저장소 선택
5. Environment Variables 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Deploy 클릭

> **자동 배포**: GitHub에 푸시하면 자동으로 배포됩니다.

**상세 배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md) 참조

### 다른 플랫폼 배포

- **Netlify**: [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- **AWS Amplify**: [AWS Amplify Hosting](https://aws.amazon.com/amplify/)
- **Docker**: `Dockerfile` 생성 후 자체 서버에 배포

## 📚 프로젝트 구조

```
.
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 랜딩 페이지
│   ├── auth/                 # 인증 관련 페이지
│   ├── dashboard/            # 사용자 대시보드
│   ├── events/               # 이벤트 관련 페이지
│   ├── join/                 # 게스트 참여 페이지
│   └── admin/                # 관리자 페이지
├── components/               # 재사용 가능한 React 컴포넌트
├── lib/                      # 유틸리티, 훅, 서비스
│   ├── supabase/             # Supabase 클라이언트
│   ├── hooks/                # 커스텀 React 훅
│   ├── services/             # 비즈니스 로직
│   ├── schemas/              # Zod 스키마
│   └── database.types.ts     # Supabase 타입 정의
├── public/                   # 정적 자산
├── tests/                    # E2E 테스트
├── docs/                     # 문서
└── CLAUDE.md                 # Claude Code 개발 가이드
```

## 📖 개발 가이드

자세한 개발 정보는 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

### 서비스 아키텍처

- **Server Components**: 데이터 조회, 권한 검증
- **Client Components**: 상호작용, 실시간 업데이트
- **Server Actions**: 데이터 변경 (form submission)
- **Route Handlers**: API 엔드포인트, 보안 작업

자세한 내용은 [Service Layer Guide](./docs/guides/service-layer.md)를 참조하세요.

## 🧪 테스트

### E2E 테스트 (Playwright)

```bash
# 테스트 실행
npm run test:e2e

# UI 모드로 테스트 (대화형)
npm run test:e2e-ui

# 특정 테스트만 실행
npm run test:e2e -- tests/integration-flow.spec.ts
```

테스트 작성 가이드: [E2E 테스트 가이드](./docs/guides/e2e-testing.md)

## 🤝 기여하기

버그 리포트, 기능 제안, PR을 환영합니다!

1. Fork the repository
2. Feature branch 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 Commit (`git commit -m '✨ feat: amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📜 라이선스

MIT License - [LICENSE](./LICENSE) 파일 참조

## 📞 지원

문제가 발생하거나 궁금한 점이 있으면:

- GitHub Issues에서 버그 리포트
- Discussions에서 질문하기
- 이메일: support@example.com

## 🙏 감사의 말

이 프로젝트는 다음의 훌륭한 오픈소스 프로젝트를 기반으로 합니다:

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**언제 만나요**와 함께 편하게 일정을 조율하세요! 🎉
