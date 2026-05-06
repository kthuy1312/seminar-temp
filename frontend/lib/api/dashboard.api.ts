import { apiRequest } from "@/lib/api/client";
import { DashboardActivity, DashboardOverview } from "@/types/dashboard";

type DashboardStatsResponse = {
  success: boolean;
  data: {
    totals?: {
      goals?: number;
      documents?: number;
      quizzes?: number;
      completionRate?: number;
    };
    averages?: {
      streakDays?: number;
    };
  };
};

type DashboardActivityResponse = {
  success: boolean;
  data: DashboardActivity[];
};

type DashboardProgressResponse = {
  success: boolean;
  data: Array<{ date: string; completedGoals: number }>;
};

export async function getDashboardOverview() {
  const stats = await apiRequest<DashboardStatsResponse>("/api/dashboard/stats");
  const totals = stats.data?.totals || {};
  const averages = stats.data?.averages || {};

  const overview: DashboardOverview = {
    progressPercent: Number(totals.completionRate || 0),
    stats: [
      { label: "Hours studied", value: String(totals.documents || 0) },
      { label: "Tasks completed", value: String(totals.goals || 0) },
      { label: "Current streak", value: `${averages.streakDays || 0} days` },
    ],
    nextTasks: [],
    suggestions: [],
  };

  return overview;
}

export async function getRecentActivities() {
  const response = await apiRequest<DashboardActivityResponse>("/api/dashboard/activity");
  return response.data || [];
}

export async function getDashboardProgress() {
  const response = await apiRequest<DashboardProgressResponse>("/api/dashboard/progress");
  return response.data || [];
}
