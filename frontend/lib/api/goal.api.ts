import { apiRequest } from "@/lib/api/client";
import { GoalItem } from "@/types/goal";

type GoalListResponse = {
  data: GoalItem[];
};

export async function createGoal(payload: {
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
}) {
  return apiRequest<GoalItem>("/api/goals", {
    method: "POST",
    body: payload,
    headers: {
      "x-user-id": "00000000-0000-0000-0000-000000000001",
    },
  });
}

export async function getGoals() {
  const response = await apiRequest<GoalListResponse>("/api/goals", {
    headers: {
      "x-user-id": "00000000-0000-0000-0000-000000000001",
    },
  });
  return response.data || [];
}

export async function updateGoal(id: string, payload: Partial<GoalItem>) {
  return apiRequest<GoalItem>(`/api/goals/${id}`, {
    method: "PUT",
    body: payload,
    headers: {
      "x-user-id": "00000000-0000-0000-0000-000000000001",
    },
  });
}
