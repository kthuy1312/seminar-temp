import { apiRequest } from "@/lib/api/client";
import { GoalItem, RoadmapItem } from "@/types/goal";

type GoalListResponse = {
  data: GoalItem[];
};

export async function createGoal(payload: {
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  target_score?: string;
  current_level?: string;
  daily_hours?: number;
  subjects?: string[];
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

export async function getRoadmap(goalId: string) {
  return apiRequest<RoadmapItem[]>(`/api/goals/${goalId}/roadmap`);
}

export async function toggleRoadmapItem(itemId: string, is_completed: boolean) {
  return apiRequest<any>(`/api/goals/roadmap/${itemId}`, {
    method: "PUT",
    body: { is_completed },
  });
}

export async function updateGoal(id: string, payload: Partial<GoalItem>) {
  // ℹ️ x-user-id will be automatically added by API Gateway from JWT token
  return apiRequest<GoalItem>(`/api/goals/${id}`, {
    method: "PUT",
    body: payload,
  });
}
