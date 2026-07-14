/**
 * Supabase Realtime 실시간 업데이트 E2E 테스트
 *
 * 시나리오:
 * 1. 이벤트 상세 페이지의 Realtime 연결 상태 배지 렌더링 확인
 * 2. 참여자 카드 및 히트맵 카드 표시 확인
 * 3. 멀티 컨텍스트: 게스트 참여 시 이벤트 상세 페이지에 실시간 반영
 * 4. 참여자 수 증가 및 이름 목록 실시간 업데이트 확인
 * 5. 마지막 업데이트 시간 표시 확인
 *
 * 주의사항:
 * - 실제 Supabase 프로젝트에 연결하여 테스트를 진행합니다
 * - TEST_EVENT_ID / TEST_INVITE_TOKEN 환경변수가 필요합니다
 * - 멀티 컨텍스트로 주최자(context1)와 게스트(context2)를 분리합니다
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/** 테스트용 이벤트 ID (환경변수에서 주입) */
const TEST_EVENT_ID = process.env.TEST_EVENT_ID ?? "";
/** 테스트용 초대 토큰 (환경변수에서 주입) */
const TEST_INVITE_TOKEN = process.env.TEST_INVITE_TOKEN ?? "";

/**
 * 테스트에 사용할 고유 게스트 이름 생성
 * 이전 테스트와 이름 충돌을 방지합니다
 */
function createUniqueGuestName(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `RT테스터_${timestamp}`;
}

/**
 * Realtime 연결 배지가 "실시간 연결됨"이 될 때까지 대기
 */
async function waitForRealtimeConnection(page: Page): Promise<void> {
  await expect(
    page.getByTestId("connection-badge").filter({ hasText: "실시간 연결됨" }),
  ).toBeVisible({ timeout: 15000 });
}

/**
 * 이벤트 상세 페이지를 열고 히트맵 카드가 렌더링될 때까지 대기
 */
async function openEventDetailPage(
  context: BrowserContext,
  eventId: string,
): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`/events/${eventId}`);
  await expect(page.getByTestId("heatmap-card")).toBeVisible({
    timeout: 10000,
  });
  return page;
}

/**
 * 게스트 참여 페이지에서 이름 입력 후 첫 번째 후보 날짜를 선택하고 제출
 */
async function submitGuestParticipation(
  context: BrowserContext,
  inviteToken: string,
  guestName: string,
): Promise<Page> {
  const guestPage = await context.newPage();
  await guestPage.goto(`/join/${inviteToken}`);

  // 이름 입력
  await guestPage.getByLabel(/이름/i).fill(guestName);

  // 달력에서 후보 날짜(ring-1 클래스가 붙은 날짜) 중 첫 번째를 클릭
  const candidateDate = guestPage
    .locator("button.rdp-day:not([disabled])")
    .first();
  await candidateDate.waitFor({ state: "visible", timeout: 10000 });
  await candidateDate.click();

  // 참여 완료 버튼 클릭
  await guestPage.getByRole("button", { name: /참여 완료/i }).click();

  // 참여 완료 메시지 확인
  await expect(guestPage.getByText("참여 완료!", { exact: true })).toBeVisible({
    timeout: 10000,
  });

  return guestPage;
}

// ====== 단독 실행 가능한 기본 렌더링 테스트 ======

test.describe("Realtime UI 기본 렌더링 테스트", () => {
  test("이벤트 상세 페이지에 Realtime 연결 상태 배지가 존재한다", async ({
    page,
  }) => {
    test.skip(!TEST_EVENT_ID, "TEST_EVENT_ID 환경변수가 설정되지 않았습니다");

    await page.goto(`/events/${TEST_EVENT_ID}`);

    // 히트맵 카드 렌더링 대기
    await expect(page.getByTestId("heatmap-card")).toBeVisible({
      timeout: 10000,
    });

    // 연결 상태 배지가 존재하는지 확인 (초기에는 "연결 중..." 상태)
    await expect(page.getByTestId("connection-badge")).toBeVisible({
      timeout: 10000,
    });
  });

  test("Realtime 연결 성공 시 연결 상태 배지가 녹색으로 변경된다", async ({
    page,
  }) => {
    test.skip(!TEST_EVENT_ID, "TEST_EVENT_ID 환경변수가 설정되지 않았습니다");

    await page.goto(`/events/${TEST_EVENT_ID}`);

    // 히트맵 카드 렌더링 대기
    await expect(page.getByTestId("heatmap-card")).toBeVisible({
      timeout: 10000,
    });

    // Realtime 연결 완료 대기
    await waitForRealtimeConnection(page);

    // 배지 텍스트 확인
    const badge = page.getByTestId("connection-badge");
    await expect(badge).toContainText("실시간 연결됨");

    // 배지 색상 확인 (녹색 배경 클래스)
    await expect(badge).toHaveClass(/bg-green-500/);
  });

  test("이벤트 상세 페이지에 참여자 카드가 렌더링된다", async ({ page }) => {
    test.skip(!TEST_EVENT_ID, "TEST_EVENT_ID 환경변수가 설정되지 않았습니다");

    await page.goto(`/events/${TEST_EVENT_ID}`);

    // 참여자 카드 확인
    await expect(page.getByTestId("participants-card")).toBeVisible({
      timeout: 10000,
    });

    // 참여자 수 표시 확인 ("N명" 형태)
    await expect(page.getByTestId("participants-count")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("participants-count")).toContainText("명");
  });
});

// ====== 멀티 컨텍스트 Realtime 실시간 반영 테스트 ======

test.describe("멀티 컨텍스트 Realtime 실시간 반영 테스트", () => {
  test("게스트 참여 시 이벤트 상세 페이지 참여자 수가 실시간으로 증가한다", async ({
    browser,
  }) => {
    test.skip(
      !TEST_EVENT_ID || !TEST_INVITE_TOKEN,
      "TEST_EVENT_ID 또는 TEST_INVITE_TOKEN 환경변수가 설정되지 않았습니다",
    );

    // 주최자(context1)와 게스트(context2) 브라우저 컨텍스트 분리
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();

    try {
      // 1. 주최자 페이지 열기 및 Realtime 연결 대기
      const hostPage = await openEventDetailPage(hostContext, TEST_EVENT_ID);
      await waitForRealtimeConnection(hostPage);

      // 현재 참여자 수 기록
      const countText = await hostPage
        .getByTestId("participants-count")
        .textContent();
      const initialCount = parseInt(countText?.match(/\d+/)?.[0] ?? "0", 10);

      // 2. 게스트 참여 제출
      const guestName = createUniqueGuestName();
      await submitGuestParticipation(
        guestContext,
        TEST_INVITE_TOKEN,
        guestName,
      );

      // 3. 주최자 페이지에서 참여자 수 증가 실시간 확인
      await expect(hostPage.getByTestId("participants-count")).toContainText(
        `${initialCount + 1}명`,
        { timeout: 20000 },
      );

      // 4. 새로운 참여자 이름이 목록에 나타나는지 확인
      await expect(
        hostPage.getByTestId(`participant-item-${guestName}`),
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });

  test("게스트 참여 후 히트맵 마지막 업데이트 시간이 표시된다", async ({
    browser,
  }) => {
    test.skip(
      !TEST_EVENT_ID || !TEST_INVITE_TOKEN,
      "TEST_EVENT_ID 또는 TEST_INVITE_TOKEN 환경변수가 설정되지 않았습니다",
    );

    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();

    try {
      // 주최자 페이지 열기
      const hostPage = await openEventDetailPage(hostContext, TEST_EVENT_ID);
      await waitForRealtimeConnection(hostPage);

      // 게스트 참여 제출
      const guestName = createUniqueGuestName();
      await submitGuestParticipation(
        guestContext,
        TEST_INVITE_TOKEN,
        guestName,
      );

      // 마지막 업데이트 시간 표시 확인 (Realtime 이벤트 수신 후 나타남)
      await expect(hostPage.getByTestId("last-updated")).toBeVisible({
        timeout: 20000,
      });

      // 히트맵 카드가 여전히 정상 렌더링되는지 확인
      await expect(hostPage.getByTestId("heatmap-card")).toBeVisible();
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });

  test("두 명의 게스트가 순차적으로 참여하면 참여자 수가 2명 증가한다", async ({
    browser,
  }) => {
    test.skip(
      !TEST_EVENT_ID || !TEST_INVITE_TOKEN,
      "TEST_EVENT_ID 또는 TEST_INVITE_TOKEN 환경변수가 설정되지 않았습니다",
    );

    const hostContext = await browser.newContext();
    const guest1Context = await browser.newContext();
    const guest2Context = await browser.newContext();

    try {
      // 주최자 페이지 열기 및 연결 대기
      const hostPage = await openEventDetailPage(hostContext, TEST_EVENT_ID);
      await waitForRealtimeConnection(hostPage);

      // 초기 참여자 수 기록
      const countText = await hostPage
        .getByTestId("participants-count")
        .textContent();
      const initialCount = parseInt(countText?.match(/\d+/)?.[0] ?? "0", 10);

      // 첫 번째 게스트 참여
      const guest1Name = createUniqueGuestName();
      await submitGuestParticipation(
        guest1Context,
        TEST_INVITE_TOKEN,
        guest1Name,
      );

      // 첫 번째 게스트 반영 대기
      await expect(hostPage.getByTestId("participants-count")).toContainText(
        `${initialCount + 1}명`,
        { timeout: 20000 },
      );

      // 두 번째 게스트 참여
      const guest2Name = createUniqueGuestName();
      await submitGuestParticipation(
        guest2Context,
        TEST_INVITE_TOKEN,
        guest2Name,
      );

      // 두 번째 게스트 반영 대기
      await expect(hostPage.getByTestId("participants-count")).toContainText(
        `${initialCount + 2}명`,
        { timeout: 20000 },
      );

      // 두 참여자 이름이 모두 표시되는지 확인
      await expect(
        hostPage.getByTestId(`participant-item-${guest1Name}`),
      ).toBeVisible({ timeout: 15000 });
      await expect(
        hostPage.getByTestId(`participant-item-${guest2Name}`),
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await hostContext.close();
      await guest1Context.close();
      await guest2Context.close();
    }
  });
});

// ====== join 페이지 기본 렌더링 테스트 ======

test.describe("게스트 참여 페이지 렌더링 테스트", () => {
  test("초대 링크 페이지가 정상적으로 렌더링된다", async ({ page }) => {
    test.skip(
      !TEST_INVITE_TOKEN,
      "TEST_INVITE_TOKEN 환경변수가 설정되지 않았습니다",
    );

    await page.goto(`/join/${TEST_INVITE_TOKEN}`);

    // 이벤트 정보 카드 확인
    await expect(
      page.getByRole("heading", { name: "모임 참여하기" }),
    ).toBeVisible({ timeout: 10000 });

    // 이름 입력 필드 확인
    await expect(page.getByLabel(/이름/i)).toBeVisible();

    // 달력 렌더링 확인
    await expect(page.getByText("가능한 날짜 선택")).toBeVisible();
  });

  test("유효하지 않은 초대 토큰으로 접근하면 에러 메시지를 표시한다", async ({
    page,
  }) => {
    await page.goto("/join/invalid-token-12345");

    // 에러 메시지 확인
    await expect(page.getByText("초대 링크가 유효하지 않습니다")).toBeVisible({
      timeout: 10000,
    });

    // 홈으로 돌아가기 버튼 확인
    await expect(
      page.getByRole("link", { name: "홈으로 돌아가기" }),
    ).toBeVisible();
  });
});
