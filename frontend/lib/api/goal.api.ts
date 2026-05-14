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
  // ℹ️ x-user-id will be automatically added by API Gateway from JWT token
  return apiRequest<GoalItem>("/api/goals", {
    method: "POST",
    body: payload,
  });
}

export async function getGoals() {
  // ℹ️ x-user-id will be automatically added by API Gateway from JWT token
  const response = await apiRequest<GoalListResponse>("/api/goals");
  return response.data || [];
}

export async function updateGoal(id: string, payload: Partial<GoalItem>) {
  // ℹ️ x-user-id will be automatically added by API Gateway from JWT token
  return apiRequest<GoalItem>(`/api/goals/${id}`, {
    method: "PUT",
    body: payload,
  });
}
