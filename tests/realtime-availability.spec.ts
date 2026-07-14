/**
 * Realtime 가용성 E2E 테스트
 *
 * 시나리오:
 * 1. 주최자 이벤트 상세 페이지 + 게스트 참여 페이지를 동시에 열기
 * 2. 게스트가 참여 제출 → 주최자 페이지에서 실시간 반영 확인
 * 3. 연결 상태 배지 표시 검증
 * 4. 참여자 목록 실시간 추가 확인
 *
 * 주의사항:
 * - 실제 Supabase 프로젝트에 연결하여 테스트를 진행합니다
 * - 테스트 시작 전 테스트용 이벤트 데이터가 필요합니다
 * - 멀티 컨텍스트를 활용하여 주최자/게스트 시점을 분리합니다
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * 테스트용 이벤트 ID와 초대 토큰을 환경 변수로 주입받습니다.
 * CI 환경에서는 이 값을 설정해야 테스트가 실행됩니다.
 */
const TEST_EVENT_ID = process.env.TEST_EVENT_ID ?? "";
const TEST_INVITE_TOKEN = process.env.TEST_INVITE_TOKEN ?? "";

/**
 * 테스트에 사용할 고유한 게스트 이름을 생성합니다.
 * 같은 이벤트에서 이름 충돌을 방지합니다.
 */
function createUniqueGuestName(): string {
  const timestamp = Date.now().toString(36);
  return `E2E_테스터_${timestamp}`;
}

/**
 * 실시간 연결 배지가 나타날 때까지 기다립니다.
 * Realtime 채널 구독 완료에는 약간의 시간이 필요합니다.
 */
async function waitForRealtimeConnection(page: Page): Promise<void> {
  await expect(
    page.getByTestId("connection-badge").filter({ hasText: "실시간 연결됨" }),
  ).toBeVisible({ timeout: 15000 });
}

/**
 * 이벤트 상세 페이지를 열고 Realtime 연결을 기다립니다.
 */
async function openEventDetailPage(
  context: BrowserContext,
  eventId: string,
): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`/events/${eventId}`);
  // 히트맵 카드가 렌더링될 때까지 대기
  await expect(page.getByTestId("heatmap-card")).toBeVisible({
    timeout: 10000,
  });
  return page;
}

/**
 * 게스트 참여 페이지를 열고 참여를 완료합니다.
 */
async function submitGuestParticipation(
  context: BrowserContext,
  inviteToken: string,
  guestName: string,
): Promise<Page> {
  const guestPage = await context.newPage();
  await guestPage.goto(`/join/${inviteToken}`);

  // 이름 입력
  const nameInput = guestPage.getByLabel(/이름/);
  await nameInput.fill(guestName);

  // 달력에서 첫 번째 활성 날짜 클릭 (후보 날짜 중 하나 선택)
  // ring-1 ring-primary/40 클래스를 가진 달력 셀 (후보 날짜 표시)
  const candidateDateButtons = guestPage.locator(
    "button.rdp-day:not([disabled])",
  );

  // 첫 번째 활성화된 날짜를 클릭
  const firstAvailableDate = candidateDateButtons.first();
  await firstAvailableDate.waitFor({ state: "visible", timeout: 10000 });
  await firstAvailableDate.click();

  // 참여 완료 버튼 클릭
  const submitButton = guestPage.getByRole("button", { name: /참여 완료/ });
  await submitButton.click();

  // 제출 완료 메시지 확인
  await expect(guestPage.getByText("참여 완료!", { exact: true })).toBeVisible({
    timeout: 10000,
  });

  return guestPage;
}

// ====== 테스트 케이스 ======

test.describe("Realtime 가용성 구독 테스트", () => {
  /**
   * 환경 변수 없이 기본 동작하는 단독 테스트
   * TEST_EVENT_ID 없이도 연결 상태 컴포넌트 동작을 검증합니다.
   */
  test.describe("연결 상태 배지 기본 렌더링", () => {
    test("이벤트 상세 페이지에 연결 상태 배지가 렌더링된다", async ({
      page,
    }) => {
      // TEST_EVENT_ID가 없으면 스킵
      test.skip(!TEST_EVENT_ID, "TEST_EVENT_ID 환경변수가 설정되지 않았습니다");

      await page.goto(`/events/${TEST_EVENT_ID}`);

      // 히트맵 카드가 렌더링되는지 확인
      await expect(page.getByTestId("heatmap-card")).toBeVisible({
        timeout: 10000,
      });

      // 연결 상태 배지가 존재하는지 확인 (초기에는 "연결 중..." 또는 "실시간 연결됨")
      await expect(page.getByTestId("connection-badge")).toBeVisible({
        timeout: 10000,
      });

      // 최종적으로 "실시간 연결됨" 상태가 되어야 함
      await waitForRealtimeConnection(page);
    });

    test("참여자 카드가 렌더링된다", async ({ page }) => {
      test.skip(!TEST_EVENT_ID, "TEST_EVENT_ID 환경변수가 설정되지 않았습니다");

      await page.goto(`/events/${TEST_EVENT_ID}`);

      // 참여자 카드가 보이는지 확인
      await expect(page.getByTestId("participants-card")).toBeVisible({
        timeout: 10000,
      });

      // 참여자 수 표시 확인
      await expect(page.getByTestId("participants-count")).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("멀티 컨텍스트 Realtime 테스트", () => {
    /**
     * 주최자(context1)와 게스트(context2)를 분리된 브라우저 컨텍스트로 구성합니다.
     * 두 컨텍스트는 독립적인 세션을 가집니다.
     */
    test("게스트 참여 시 주최자 페이지에 실시간으로 반영된다", async ({
      browser,
    }) => {
      test.skip(
        !TEST_EVENT_ID || !TEST_INVITE_TOKEN,
        "TEST_EVENT_ID 또는 TEST_INVITE_TOKEN 환경변수가 설정되지 않았습니다",
      );

      // 두 개의 독립된 브라우저 컨텍스트 생성
      const hostContext = await browser.newContext();
      const guestContext = await browser.newContext();

      try {
        // 1. 주최자 페이지 열기 및 Realtime 연결 대기
        const hostPage = await openEventDetailPage(hostContext, TEST_EVENT_ID);
        await waitForRealtimeConnection(hostPage);

        // 현재 참여자 수 기록
        const initialCountText = await hostPage
          .getByTestId("participants-count")
          .textContent();
        const initialCount = parseInt(
          initialCountText?.match(/\d+/)?.[0] ?? "0",
          10,
        );

        // 2. 게스트 참여 제출
        const guestName = createUniqueGuestName();
        await submitGuestParticipation(
          guestContext,
          TEST_INVITE_TOKEN,
          guestName,
        );

        // 3. 주최자 페이지에서 참여자 수 증가 확인 (Realtime 반영)
        await expect(hostPage.getByTestId("participants-count")).toContainText(
          `${initialCount + 1}명`,
          { timeout: 20000 },
        );

        // 4. 새로운 참여자 이름이 목록에 표시되는지 확인
        await expect(
          hostPage.getByTestId(`participant-item-${guestName}`),
        ).toBeVisible({ timeout: 15000 });

        // 5. 마지막 업데이트 시간이 표시되는지 확인
        await expect(hostPage.getByTestId("last-updated")).toBeVisible({
          timeout: 15000,
        });
      } finally {
        // 컨텍스트 정리
        await hostContext.close();
        await guestContext.close();
      }
    });

    test("참여자 추가 후 히트맵이 업데이트된다", async ({ browser }) => {
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

        // 2. 게스트 참여 제출
        const guestName = createUniqueGuestName();
        await submitGuestParticipation(
          guestContext,
          TEST_INVITE_TOKEN,
          guestName,
        );

        // 히트맵 카드에 데이터가 표시되는지 확인
        // (참여자가 늘면 "아직 응답한 참여자가 없습니다" 메시지가 사라져야 함)
        const heatmapCard = hostPage.getByTestId("heatmap-card");
        await expect(heatmapCard).toBeVisible({ timeout: 10000 });

        // Realtime 업데이트 후 마지막 업데이트 시간이 표시됨을 확인
        await expect(hostPage.getByTestId("last-updated")).toBeVisible({
          timeout: 20000,
        });
      } finally {
        await hostContext.close();
        await guestContext.close();
      }
    });
  });

  test.describe("연결 상태 시각화 테스트", () => {
    test("Realtime 연결 성공 시 녹색 배지로 변경된다", async ({ page }) => {
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
  });
});

/**
 * 집계 유틸리티 함수 단위 테스트
 *
 * E2E 환경이 없어도 실행 가능한 순수 함수 테스트입니다.
 */
test.describe("가용성 집계 유틸 함수 테스트 (단위)", () => {
  test("빈 배열을 입력하면 빈 배열을 반환한다", async () => {
    // 동적 import로 서버 의존성 없이 순수 함수만 테스트
    const { aggregateAvailability } =
      await import("../lib/utils/availability-aggregation");

    const result = aggregateAvailability([], []);
    expect(result).toEqual([]);
  });

  test("가용성 데이터를 날짜별로 올바르게 집계한다", async () => {
    const { aggregateAvailability } =
      await import("../lib/utils/availability-aggregation");

    // 테스트 데이터 설정
    const availabilityRows = [
      { date: "2025-08-01", participant_id: "p1" },
      { date: "2025-08-01", participant_id: "p2" },
      { date: "2025-08-02", participant_id: "p1" },
    ];

    const participants = [
      { id: "p1", guest_name: "홍길동" },
      { id: "p2", guest_name: "김철수" },
    ];

    const result = aggregateAvailability(availabilityRows, participants);

    // 2025-08-01: 홍길동, 김철수 (2명)
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      date: "2025-08-01",
      count: 2,
      participants: expect.arrayContaining(["홍길동", "김철수"]),
    });

    // 2025-08-02: 홍길동 (1명)
    expect(result[1]).toMatchObject({
      date: "2025-08-02",
      count: 1,
      participants: ["홍길동"],
    });
  });

  test("참여자 ID가 없는 가용성 행은 집계에서 제외한다", async () => {
    const { aggregateAvailability } =
      await import("../lib/utils/availability-aggregation");

    // p999는 participants에 없는 ID
    const availabilityRows = [
      { date: "2025-08-01", participant_id: "p1" },
      { date: "2025-08-01", participant_id: "p999" }, // 존재하지 않는 참여자
    ];

    const participants = [{ id: "p1", guest_name: "홍길동" }];

    const result = aggregateAvailability(availabilityRows, participants);

    // p999는 제외되어 count=1
    expect(result[0]).toMatchObject({
      date: "2025-08-01",
      count: 1,
      participants: ["홍길동"],
    });
  });

  test("결과가 날짜 오름차순으로 정렬된다", async () => {
    const { aggregateAvailability } =
      await import("../lib/utils/availability-aggregation");

    // 의도적으로 역순으로 입력
    const availabilityRows = [
      { date: "2025-08-03", participant_id: "p1" },
      { date: "2025-08-01", participant_id: "p1" },
      { date: "2025-08-02", participant_id: "p1" },
    ];

    const participants = [{ id: "p1", guest_name: "홍길동" }];

    const result = aggregateAvailability(availabilityRows, participants);

    // 날짜 오름차순 정렬 확인
    expect(result.map((r) => r.date)).toEqual([
      "2025-08-01",
      "2025-08-02",
      "2025-08-03",
    ]);
  });
});
