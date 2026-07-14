import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 *
 * 로컬 개발 서버(http://localhost:3000)에서 실행되는 E2E 테스트를 위한 설정입니다.
 * Realtime 테스트는 멀티 컨텍스트를 사용하여 여러 사용자의 동시 접속을 시뮬레이션합니다.
 */
export default defineConfig({
  // 테스트 파일 경로
  testDir: "./tests",

  // 테스트 타임아웃 (Realtime 구독 대기 시간 포함하여 넉넉하게 설정)
  timeout: 60000,

  // 기대값(expect) 타임아웃
  expect: {
    timeout: 15000,
  },

  // 각 테스트 실패 시 스크린샷 저장
  reporter: "html",

  use: {
    // 테스트 대상 URL
    baseURL: "http://localhost:3000",

    // 테스트 실패 시 트레이스 파일 저장
    trace: "on-first-retry",

    // 헤드리스 모드 (CI 환경에서는 항상 헤드리스)
    headless: true,
  },

  // 테스트 프로젝트 설정 (브라우저별)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 테스트 실행 전 로컬 개발 서버 자동 시작
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
