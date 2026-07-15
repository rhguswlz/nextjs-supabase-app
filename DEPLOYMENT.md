# 언제 만나요 배포 가이드

## 🚀 Vercel 배포 (권장)

### 사전 준비

- [x] GitHub 계정 (저장소 푸시용)
- [x] Vercel 계정 (vercel.com)
- [x] Supabase 프로젝트 (이미 생성됨)

### 배포 단계

#### 1단계: 로컬 변경사항 푸시

```bash
# 현재 브랜치 상태 확인
git status

# 모든 변경사항 커밋 및 푸시
git push origin main
```

#### 2단계: Vercel 대시보드에서 배포

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "Add New Project" 클릭
3. GitHub 저장소 선택 (`nextjs-supabase-app` 또는 본인 계정)
4. "Import" 클릭

#### 3단계: 환경 변수 설정

프로젝트 설정 → Environment Variables에서 다음 변수 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

> 이 값은 [Supabase Dashboard](https://supabase.com/dashboard/project/_?showConnect=true)의 API 설정에서 확인할 수 있습니다.

#### 4단계: 배포 실행

1. Environment Variables 설정 완료 후
2. "Deploy" 버튼 클릭
3. 배포 진행 상황 확인 (약 2-5분 소요)
4. 배포 완료 후 URL 확인

### 배포 확인

배포 완료 후:

- [ ] 랜딩 페이지 (/) 접속 가능 확인
- [ ] OG 이미지 생성 확인
  - 링크를 SNS에 공유하여 미리보기 확인
  - 또는 [OG Tag 검사 도구](https://www.opengraph.xyz) 사용
- [ ] 회원가입 및 로그인 기능 동작 확인
- [ ] 이벤트 생성 및 초대 링크 공유 기능 확인
- [ ] 게스트 참여 기능 확인

### 자동 배포

GitHub main 브랜치에 푸시하면 자동으로 Vercel에 배포됩니다.

- **Preview Deployment**: PR 생성 시 자동 배포 (PR URL 제공)
- **Production Deployment**: main 브랜치 푸시 시 자동 배포

## 🔧 배포 후 설정

### Supabase 설정 확인

1. **Authentication 설정**
   - Supabase → Authentication → Providers
   - Google OAuth 설정 확인
   - Redirect URLs에 Vercel URL 추가
     ```
     https://<your-vercel-domain>/auth/callback
     ```

2. **CORS 설정**
   - 프로젝트 설정 → CORS 허용 목록에 Vercel URL 추가

3. **RLS 정책 확인**
   - Database → Policies에서 RLS 정책 활성화 확인

### 커스텀 도메인 (선택)

1. Vercel 프로젝트 설정 → Domains
2. "Add Domain" 클릭
3. 도메인 입력 및 DNS 설정 완료

## 📊 배포 모니터링

### Vercel Analytics

Vercel 대시보드에서 다음을 모니터링할 수 있습니다:

- **Deployments**: 배포 이력 및 상태
- **Analytics**: 페이지 로드 시간, 에러율 등
- **Function Logs**: 서버 함수 로그

### 에러 추적

에러 발생 시:

1. Vercel 대시보드의 "Logs" 탭 확인
2. 프로젝트 설정 → "Real-time Logs" 활성화

## 🆘 배포 문제 해결

### 빌드 실패

**문제**: 빌드 실패 메시지 확인

**해결책**:

1. 로컬에서 `npm run build` 실행하여 동일 오류 확인
2. 오류 수정 후 다시 푸시
3. Vercel에서 자동 재배포

### 환경 변수 오류

**문제**: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**해결책**:

1. Vercel 프로젝트 설정에서 Environment Variables 확인
2. 변수명 정확성 확인 (대소문자 구분)
3. 변수 추가 후 재배포 필요

### 데이터베이스 연결 오류

**문제**: Supabase 연결 실패

**해결책**:

1. Supabase URL 및 Publishable Key 확인
2. Supabase → Authentication → Redirect URLs에 Vercel URL 추가
3. CORS 설정 확인

## 📈 프로덕션 체크리스트

배포 전 최종 확인:

- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] E2E 테스트 통과 (`npm run test:e2e`)
- [ ] 환경 변수 설정 완료
- [ ] Supabase RLS 정책 활성화
- [ ] OG 이미지 설정 확인
- [ ] README 문서 최신화
- [ ] 라이선스 파일 포함
- [ ] GitHub README와 동기화

## 🎯 다음 단계

배포 완료 후:

1. **모니터링**: Vercel Analytics로 성능 모니터링
2. **사용자 피드백**: 초기 사용자에게서 피드백 수집
3. **버그 수정**: 발견된 이슈 수정 및 핫픽스 배포
4. **기능 추가**: 로드맵의 추가 기능 구현

---

**배포 시간**: ~5분 (네트워크 속도에 따라 다름)
**배포 비용**: Vercel Free Plan (충분)
**지원**: Vercel 대시보드 또는 GitHub Issues에서 문의
