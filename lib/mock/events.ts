import { type MockEvent } from "./types";

const MOCK_EVENTS: MockEvent[] = [
  {
    id: "event-001",
    title: "팀 워크숍 날짜 조율",
    description: "분기별 팀 워크숍 날짜를 함께 정해요",
    location: "서울 강남구 회의실",
    candidateDates: [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-25",
      "2026-07-26",
    ],
    deadline: "2026-07-15",
    status: "active",
    inviteToken: "abc12345",
    ownerId: "user-001",
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "event-002",
    title: "스터디 모임 개강일",
    description: "알고리즘 스터디 첫 모임 날짜를 정해요",
    location: "온라인 (Zoom)",
    candidateDates: ["2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31"],
    deadline: "2026-07-20",
    status: "active",
    inviteToken: "def67890",
    ownerId: "user-001",
    createdAt: "2026-07-05T10:00:00Z",
  },
  {
    id: "event-003",
    title: "친구들 번개 모임",
    description: "오랜만에 다 같이 모여요!",
    location: "홍대 카페거리",
    candidateDates: ["2026-07-12", "2026-07-13", "2026-07-14"],
    deadline: "2026-07-10",
    status: "confirmed",
    confirmedDate: "2026-07-13",
    inviteToken: "ghi11223",
    ownerId: "user-002",
    createdAt: "2026-07-03T14:00:00Z",
  },
];

export function getMockEvents(): MockEvent[] {
  return MOCK_EVENTS;
}

export function getMockEvent(id: string): MockEvent | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function getMockEventByToken(token: string): MockEvent | undefined {
  return MOCK_EVENTS.find((e) => e.inviteToken === token);
}
