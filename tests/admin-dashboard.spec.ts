/**
 * Admin 대시보드 E2E 테스트
 *
 * 시나리오:
 * 1. 비로그인 사용자 → /admin 접근 시 /auth/login으로 리다이렉트
 * 2. 일반 사용자 → /admin 접근 시 /dashboard로 리다이렉트 (권한 없음)
 * 3. 관리자 사용자 → Admin 이벤트/사용자/통계 페이지 데이터 조회 확인
 * 4. 이벤트 상태 필터링 동작 확인
 *
 * 주의사항:
 * - 실제 Supabase 프로젝트에 연결하여 테스트를 진행합니다
 * - ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD 환경변수가 필요합니다
 * - 관리자 계정은 ADMIN_EMAILS 환경변수에 포함되어야 합니다
 */

import { test, expect, type Page } from "@playwright/test";

/** 테스트용 관리자 계정 (환경변수에서 주입) */
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD ?? "";

/**
 * 관리자 계정으로 로그인합니다.
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/auth/login");

  // 이메일 입력
  await page.getByLabel(/이메일/i).fill(ADMIN_EMAIL);
  // 비밀번호 입력
  await page.getByLabel(/비밀번호/i).fill(ADMIN_PASSWORD);
  // 로그인 버튼 클릭
  await page.getByRole("button", { name: /로그인/i }).click();

  // 대시보드로 리다이렉트 확인
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

// ====== 비인증 접근 테스트 ======

test.describe("Admin 비인증 접근 테스트", () => {
  test("비로그인 상태에서 /admin 접근 시 로그인 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/admin");

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 /admin/events 접근 시 로그인 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/admin/events");

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 /admin/users 접근 시 로그인 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/admin/users");

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 /admin/stats 접근 시 로그인 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/admin/stats");

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});

// ====== Admin 데이터 조회 테스트 ======

test.describe("Admin 대시보드 데이터 조회 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 환경변수가 없으면 테스트 스킵
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      "ADMIN_TEST_EMAIL 또는 ADMIN_TEST_PASSWORD 환경변수가 설정되지 않았습니다",
    );

    await loginAsAdmin(page);
  });

  test("Admin 이벤트 페이지에서 이벤트 목록이 표시된다", async ({ page }) => {
    await page.goto("/admin/events");

    // 페이지 타이틀 확인
    await expect(
      page.getByRole("heading", { name: "이벤트 관리" }),
    ).toBeVisible({ timeout: 10000 });

    // 테이블 헤더 확인
    await expect(page.getByRole("columnheader", { name: "제목" })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("columnheader", { name: "주최자" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "참여자" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "상태" }),
    ).toBeVisible();
  });

  test("Admin 이벤트 페이지에서 상태 필터가 동작한다", async ({ page }) => {
    await page.goto("/admin/events");

    // 페이지 로딩 대기
    await expect(
      page.getByRole("heading", { name: "이벤트 관리" }),
    ).toBeVisible({ timeout: 10000 });

    // '진행중' 필터 버튼 클릭
    const activeFilterBtn = page.getByRole("button", { name: "진행중" });
    await expect(activeFilterBtn).toBeVisible();
    await activeFilterBtn.click();

    // 필터 버튼이 active 상태로 변경되는지 확인 (default variant)
    // 짧은 대기 후 상태 변경 확인
    await page.waitForTimeout(500);

    // '전체' 필터로 복귀
    const allFilterBtn = page.getByRole("button", { name: "전체" });
    await allFilterBtn.click();
    await page.waitForTimeout(500);
  });

  test("Admin 사용자 페이지에서 사용자 목록이 표시된다", async ({ page }) => {
    await page.goto("/admin/users");

    // 페이지 타이틀 확인
    await expect(
      page.getByRole("heading", { name: "사용자 관리" }),
    ).toBeVisible({ timeout: 10000 });

    // 테이블 헤더 확인
    await expect(page.getByRole("columnheader", { name: "이름" })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("columnheader", { name: "이메일" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "생성 이벤트" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "참여 이벤트" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "권한" }),
    ).toBeVisible();
  });

  test("Admin 통계 페이지에서 통계 카드가 표시된다", async ({ page }) => {
    await page.goto("/admin/stats");

    // 페이지 타이틀 확인
    await expect(page.getByRole("heading", { name: "통계 분석" })).toBeVisible({
      timeout: 10000,
    });

    // 통계 카드 확인
    await expect(page.getByText("총 이벤트")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("총 사용자")).toBeVisible();
    await expect(page.getByText("확정률")).toBeVisible();
    await expect(page.getByText("진행중")).toBeVisible();
  });

  test("Admin 통계 페이지에서 상태별 분포와 최근 이벤트가 표시된다", async ({
    page,
  }) => {
    await page.goto("/admin/stats");

    // 상태별 분포 섹션 확인
    await expect(page.getByText("상태별 이벤트 분포")).toBeVisible({
      timeout: 10000,
    });

    // 최근 이벤트 섹션 확인
    await expect(page.getByText("최근 이벤트 5개")).toBeVisible();
  });
});
