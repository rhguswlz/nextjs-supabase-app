export interface MockEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  candidateDates: string[];
  deadline: string;
  status: "active" | "closed" | "confirmed";
  confirmedDate?: string;
  inviteToken: string;
  ownerId: string;
  createdAt: string;
}

export interface MockParticipant {
  id: string;
  eventId: string;
  name: string;
  guestToken: string;
  availableDates: string[];
  createdAt: string;
}

export interface MockAvailabilityAggregation {
  date: string;
  count: number;
  participants: string[];
}
