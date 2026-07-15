# Vercel 자동 배포 설정 가이드

## 🎯 상황

- ✅ 모든 코드가 GitHub에 푸시됨
- ✅ `main` 브랜치에 최신 코드 있음
- ✅ Vercel 배포 준비 완료

## 🚀 배포 방법 3가지

### 방법 1️⃣: **Vercel GitHub 통합 (자동 배포, 권장)** ⭐⭐⭐

가장 간단합니다. GitHub에 푸시하면 자동으로 Vercel에 배포됩니다.

**단계:**

1. **Vercel 앱 설치**
   - [Vercel GitHub App](https://github.com/apps/vercel) 방문
   - "Install" 클릭
   - 계정 선택
   - "nextjs-supabase-app" 저장소 선택 후 "Install" 클릭

2. **Vercel 대시보드에서 프로젝트 연결**
   - [Vercel 대시보드](https://vercel.com/dashboard) 접속
   - "Add New Project" → "Import Git Repository"
   - GitHub의 `nextjs-supabase-app` 선택
   - "Import" 클릭

3. **환경 변수 설정**
   - Project Settings → "Environment Variables"
   - 다음 2개 변수 추가:
     ```
     NEXT_PUBLIC_SUPABASE_URL = [값]
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = [값]
     ```
   - "Save" 클릭

4. **배포 실행**
   - "Deploy" 버튼 클릭
   - 배포 진행 상황 확인 (2-5분)
   - 완료!

**장점:**

- GitHub에 푸시하면 자동 배포
- PR 생성 시 Preview URL 자동 생성
- 환경 변수 자동 적용

---

### 방법 2️⃣: **Vercel CLI (로컬에서 배포)**

Vercel CLI를 사용하여 로컬에서 배포합니다.

**전제조건:**

- Vercel 계정 필수
- Vercel 토큰 필요

**단계:**

1. **Vercel 토큰 생성**
   - [Vercel 계정 설정](https://vercel.com/account/tokens) 접속
   - "Create" 클릭
   - 토큰 복사

2. **환경 변수 설정**

   ```bash
   export VERCEL_TOKEN="your-token-here"
   ```

3. **배포 실행**

   ```bash
   npx vercel@latest deploy --prod
   ```

4. **환경 변수 추가 (선택)**
   ```bash
   npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel@latest env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```

---

### 방법 3️⃣: **GitHub Actions (자동 CI/CD)**

GitHub Actions를 사용한 자동 배포 파이프라인을 설정합니다.

**단계:**

1. **GitHub Secrets 추가**
   - 저장소 Settings → Secrets and variables → Actions
   - "New repository secret" 클릭
   - 다음 secrets 추가:
     ```
     VERCEL_TOKEN: [Vercel 토큰]
     VERCEL_PROJECT_ID: [Vercel 프로젝트 ID]
     VERCEL_ORG_ID: [Vercel 조직 ID]
     ```

2. **Workflow 파일 생성**
   - `.github/workflows/vercel-deploy.yml` 생성:
     ```yaml
     name: Vercel Deployment

     on:
       push:
         branches:
           - main

     jobs:
       deploy:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with:
               node-version: "18"
           - run: npm ci
           - run: npm run build
           - name: Deploy to Vercel
             run: npx vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
             env:
               VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
               VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
     ```

3. **배포 확인**
   - `main` 브랜치에 푸시
   - GitHub Actions 탭에서 배포 진행 상황 확인

---

## 🎓 각 방법 비교

| 항목       | 방법 1 (GitHub 통합) | 방법 2 (CLI) | 방법 3 (Actions) |
| ---------- | -------------------- | ------------ | ---------------- |
| **난이도** | ⭐ 매우 쉬움         | ⭐⭐ 중간    | ⭐⭐⭐ 어려움    |
| **자동화** | ✅ 자동              | ❌ 수동      | ✅ 자동          |
| **설정**   | 최소                 | 중간         | 복잡             |
| **권장**   | ✅ 처음 사용자       | ❌           | ⭐ 고급 사용자   |

---

## ✅ Vercel 배포 후 필수 설정

### 1. Supabase OAuth 설정 (필수)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. Authentication → URL Configuration
3. "Redirect URLs"에 추가:
   ```
   https://[vercel-domain].vercel.app/auth/callback
   ```

### 2. CORS 설정 (필수)

1. Project Settings → CORS
2. "Allowed origins"에 추가:
   ```
   https://[vercel-domain].vercel.app
   ```

### 3. 배포 확인

- [ ] 배포 URL 접속 확인
- [ ] 회원가입 기능 동작 확인
- [ ] 로그인 기능 동작 확인
- [ ] 이벤트 생성 기능 확인

---

## 🆘 문제 해결

### 빌드 실패

**증상**: Vercel에서 "Build failed" 메시지

**해결:**

1. Vercel 대시보드에서 배포 로그 확인
2. 로컬에서 `npm run build` 실행하여 동일 오류 확인
3. 오류 수정 후 다시 푸시

### 환경 변수 오류

**증상**: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**해결:**

1. Vercel 프로젝트 설정 확인
2. Environment Variables 섹션에서 변수 재확인
3. 변수명 정확성 확인 (대소문자 구분)
4. 재배포

### 인증 오류

**증상**: 로그인/회원가입 실패

**해결:**

1. Supabase → Authentication → Redirect URLs 확인
2. Vercel 도메인이 정확히 추가되었는지 확인
3. Supabase CORS 설정 확인

---

## 🎉 다음 단계

배포 완료 후:

1. **모니터링**: Vercel Analytics에서 성능 확인
2. **피드백**: 초기 사용자 피드백 수집
3. **개선**: 발견된 이슈 수정 및 배포
4. **확장**: 추가 기능 개발

---

## 📚 참고 링크

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

---

**추천**: 처음 배포는 **방법 1 (GitHub 통합)**을 사용하세요! 🚀
