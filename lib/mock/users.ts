export type MockUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const mockUsers: MockUser[] = [
  {
    id: "user-001",
    email: "hjkoh0907@gmail.com",
    name: "고현주",
    createdAt: "2025-07-01T10:00:00Z",
  },
  {
    id: "user-002",
    email: "kim.sunghwan@example.com",
    name: "김성환",
    createdAt: "2025-07-02T14:30:00Z",
  },
  {
    id: "user-003",
    email: "lee.minjung@example.com",
    name: "이민정",
    createdAt: "2025-07-03T09:15:00Z",
  },
  {
    id: "user-004",
    email: "park.jiyoon@example.com",
    name: "박지윤",
    createdAt: "2025-07-04T16:45:00Z",
  },
  {
    id: "user-005",
    email: "choi.hyunjae@example.com",
    name: "최현재",
    createdAt: "2025-07-05T11:20:00Z",
  },
];

export function getMockUsers(): MockUser[] {
  return mockUsers;
}

export function getMockUserById(userId: string): MockUser | undefined {
  return mockUsers.find((user) => user.id === userId);
}
