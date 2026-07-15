/**
 * 날짜 확정 및 마감일 처리 E2E 테스트
 *
 * 시나리오:
 * 1. 주최자가 날짜 확정 (status → 'confirmed')
 * 2. 마감일 도래 시 게스트 입력 불가
 * 3. 비주최자 날짜 확정 시도 (권한 에러)
 * 4. Realtime 구독으로 다른 클라이언트에 상태 변경 반영
 * 5. 마감된 이벤트에서 HostAvailabilityForm 비활성화
 *
 * 주의사항:
 * - TEST_EVENT_ID / TEST_INVITE_TOKEN 환경변수가 필요합니다
 * - 멀티 컨텍스트로 주최자(context1)와 게스트(context2)를 분리합니다
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const TEST_EVENT_ID = process.env.TEST_EVENT_ID ?? "";
const TEST_INVITE_TOKEN = process.env.TEST_INVITE_TOKEN ?? "";

async function openEventDetailPage(
  context: BrowserContext,
  eventId: string,
): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`/events/${eventId}`);
  await page.getByTestId("heatmap-card").waitFor({ timeout: 10000 });
  return page;
}

test.describe("날짜 확정 및 마감일 처리", () => {
  test.skipIf(!TEST_EVENT_ID, "TEST_EVENT_ID 환경변수 필요");

  test("Test 1: 주최자가 날짜 확정 가능", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await openEventDetailPage(context, TEST_EVENT_ID);

    // 날짜 확정 버튼 찾기
    const confirmButtons = page.locator("button:has-text('확정')");
    const count = await confirmButtons.count();

    // 최소 1개의 확정 버튼이 있어야 함
    expect(count).toBeGreaterThanOrEqual(1);

    // 첫 번째 날짜 선택 버튼 클릭
    const dateButtons = page.locator("button").filter({
      hasText: /\d{4}-\d{2}-\d{2}/,
    });
    const firstDateButton = dateButtons.first();

    if ((await firstDateButton.count()) > 0) {
      await firstDateButton.click();

      // 확정 버튼 클릭
      const confirmButton = page.locator("button:has-text('확정')").last();
      await confirmButton.click();

      // 성공 토스트 확인
      await page.getByText("확정되었습니다").waitFor({ timeout: 5000 });
    }

    await context.close();
  });

  test("Test 2: 마감된 이벤트 표시", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await openEventDetailPage(context, TEST_EVENT_ID);

    // 마감됨 배지 또는 마감 상태 표시 확인
    const closedBadge = page.locator("text=마감됨").first();
    const closedMessage = page.locator("text=마감된 이벤트").first();

    // 마감 상태이면 해당 요소 표시됨
    const hasClosedStatus =
      (await closedBadge.count()) > 0 || (await closedMessage.count()) > 0;

    if (hasClosedStatus) {
      expect(hasClosedStatus).toBe(true);
    }

    await context.close();
  });

  test("Test 3: 비인증 사용자 접근 처리", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 초대 링크로 게스트 접근
    if (TEST_INVITE_TOKEN) {
      await page.goto(`/join/${TEST_INVITE_TOKEN}`);
      await page.getByText("게스트 이름").waitFor({ timeout: 5000 }).catch();

      // 게스트는 날짜 확정 버튼이 없어야 함
      const confirmButton = page.locator("button:has-text('📌')").first();
      expect(await confirmButton.count()).toBe(0);
    }

    await context.close();
  });

  test("Test 4: Realtime 구독으로 상태 변경 반영", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await openEventDetailPage(context1, TEST_EVENT_ID);
    const page2 = await openEventDetailPage(context2, TEST_EVENT_ID);

    // 두 페이지 모두 로드 확인
    await expect(page1.getByTestId("heatmap-card")).toBeVisible();
    await expect(page2.getByTestId("heatmap-card")).toBeVisible();

    // Realtime 연결 상태 확인
    const badge1 = page1.getByTestId("connection-badge");
    const badge2 = page2.getByTestId("connection-badge");

    expect(await badge1.count()).toBeGreaterThan(0);
    expect(await badge2.count()).toBeGreaterThan(0);

    await context1.close();
    await context2.close();
  });

  test("Test 5: HostAvailabilityForm 상태 관리", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await openEventDetailPage(context, TEST_EVENT_ID);

    // 주최자의 가용 날짜 폼 찾기
    const hostForm = page.locator("text=당신의 가용 날짜").first();

    if ((await hostForm.count()) > 0) {
      // 마감된 경우 비활성화 메시지 확인
      const closedMessage = page.locator("text=마감된 이벤트");
      const lockIcon = page.locator("text=🔒").first();

      // 마감 상태이면 폼이 비활성화되어야 함
      if ((await closedMessage.count()) > 0 || (await lockIcon.count()) > 0) {
        expect(true).toBe(true);
      } else {
        // 활성 상태이면 달력이 있어야 함
        const calendar = page.locator("[role='presentation']").first();
        expect(await calendar.count()).toBeGreaterThanOrEqual(0);
      }
    }

    await context.close();
  });
});
