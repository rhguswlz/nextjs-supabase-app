import { type MockAvailabilityAggregation } from "./types";
import { getMockParticipantsByEventId } from "./participants";

export function getAvailabilityAggregation(
  eventId: string,
): MockAvailabilityAggregation[] {
  const participants = getMockParticipantsByEventId(eventId);
  const dateMap = new Map<string, string[]>();

  for (const participant of participants) {
    for (const date of participant.availableDates) {
      const existing = dateMap.get(date) ?? [];
      dateMap.set(date, [...existing, participant.name]);
    }
  }

  return Array.from(dateMap.entries())
    .map(([date, names]) => ({
      date,
      count: names.length,
      participants: names,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
