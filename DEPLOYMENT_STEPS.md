# Vercel 배포 단계별 가이드

## 🎯 현재 상태

- ✅ GitHub에 모든 코드 푸시 완료
- ✅ 빌드 검증 완료
- ✅ 환경 변수 설정 준비 완료

## 📋 배포 단계

### 1단계: Vercel 대시보드 접속

1. [Vercel 대시보드](https://vercel.com/dashboard) 방문
2. GitHub 계정으로 로그인 (아직 계정이 없으면 가입)

### 2단계: 프로젝트 추가

1. "Add New Project" 버튼 클릭
2. "Import Git Repository" 선택
3. GitHub에서 `nextjs-supabase-app` 저장소 검색
4. 저장소 선택 후 "Import" 클릭

### 3단계: 프로젝트 설정

**프로젝트 이름**:

- Project Name: `when-to-meet` (또는 원하는 이름)

**Environment Variables** 탭에서 다음 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL = <your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = <your-supabase-publishable-key>
```

> 이 값은 [Supabase Dashboard](https://supabase.com/dashboard/project/_?showConnect=true)의 "API" 메뉴에서 확인할 수 있습니다.

### 4단계: 배포 실행

1. 모든 설정 완료 후 "Deploy" 버튼 클릭
2. 배포 진행 상황 확인 (약 2-5분 소요)
3. 배포 완료 메시지 확인

### 5단계: 배포 확인

배포 완료 후:

1. **프로덕션 URL 확인**
   - Vercel 대시보드에서 할당된 URL 확인 (예: `https://when-to-meet.vercel.app`)

2. **기본 기능 테스트**
   - [ ] 랜딩 페이지 접속 가능 확인
   - [ ] 회원가입 페이지 접속 가능 확인
   - [ ] 로그인 페이지 접속 가능 확인

3. **OG 이미지 확인**
   - 배포된 URL을 [OG Tag 검사 도구](https://www.opengraph.xyz)에 입력
   - "언제 만나요" 제목과 이미지가 표시되는지 확인
   - 또는 SNS(카톡, 페이스북 등)에 링크 공유하여 미리보기 확인

4. **Supabase 연결 확인**
   - [ ] 회원가입 시도 (성공 여부)
   - [ ] 로그인 시도 (성공 여부)
   - [ ] 이벤트 생성 시도 (성공 여부)

## 🔐 Supabase 설정 (배포 후 필수)

### OAuth Redirect URL 추가

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → Authentication → URL Configuration
3. "Redirect URLs" 섹션에 다음 URL 추가:
   ```
   https://when-to-meet.vercel.app/auth/callback
   ```
   (실제 Vercel 도메인으로 교체)

### CORS 설정 (필요시)

1. Project Settings → CORS
2. Allowed origins에 다음 추가:
   ```
   https://when-to-meet.vercel.app
   ```

## 🎉 배포 완료!

모든 단계를 완료하면 서비스가 인터넷에 공개됩니다.

## 📊 배포 후 모니터링

### Vercel Analytics

- 프로젝트 대시보드에서 "Analytics" 탭 확인
- 페이지 로드 시간, 에러율 등 모니터링

### 에러 추적

- Vercel 대시보드 → "Deployments" → 최신 배포 클릭
- "Logs" 탭에서 배포 로그 확인
- "Runtime Logs" 탭에서 실시간 로그 확인

## 🔄 자동 배포 설정

이후 `main` 브랜치에 푸시하면 자동으로 배포됩니다:

1. **Preview Deployment**: PR 생성 시 자동 배포
2. **Production Deployment**: main 브랜치 푸시 시 자동 배포

## ✅ 체크리스트

배포 전 최종 확인:

- [x] GitHub에 모든 코드 푸시 완료
- [x] 로컬 빌드 성공
- [x] TypeScript 검사 통과
- [x] ESLint 검사 통과
- [ ] Vercel 계정 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] Supabase Redirect URL 추가 완료
- [ ] 배포 완료 및 테스트 통과

---

**배포 소요 시간**: ~5분
**배포 비용**: 무료 (Vercel Free Plan)
**추가 지원**: GitHub Issues 또는 Vercel 대시보드 Support
