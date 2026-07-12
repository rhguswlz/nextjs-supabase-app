import { type MockParticipant } from "./types";

const MOCK_PARTICIPANTS: MockParticipant[] = [
  {
    id: "part-001",
    eventId: "event-001",
    name: "김지민",
    guestToken: "gt-001",
    availableDates: ["2026-07-20", "2026-07-21", "2026-07-25"],
    createdAt: "2026-07-02T10:00:00Z",
  },
  {
    id: "part-002",
    eventId: "event-001",
    name: "이수현",
    guestToken: "gt-002",
    availableDates: ["2026-07-21", "2026-07-22", "2026-07-25", "2026-07-26"],
    createdAt: "2026-07-02T11:00:00Z",
  },
  {
    id: "part-003",
    eventId: "event-001",
    name: "박민준",
    guestToken: "gt-003",
    availableDates: ["2026-07-20", "2026-07-25", "2026-07-26"],
    createdAt: "2026-07-03T09:00:00Z",
  },
  {
    id: "part-004",
    eventId: "event-002",
    name: "최예린",
    guestToken: "gt-004",
    availableDates: ["2026-07-28", "2026-07-30"],
    createdAt: "2026-07-06T09:00:00Z",
  },
  {
    id: "part-005",
    eventId: "event-003",
    name: "정하늘",
    guestToken: "gt-005",
    availableDates: ["2026-07-12", "2026-07-13"],
    createdAt: "2026-07-04T15:00:00Z",
  },
];

export function getMockParticipantsByEventId(
  eventId: string,
): MockParticipant[] {
  return MOCK_PARTICIPANTS.filter((p) => p.eventId === eventId);
}
