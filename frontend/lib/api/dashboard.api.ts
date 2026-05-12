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
  const completedGoals = Number(totals.completedGoals || 0);
  const totalGoals = Number(totals.totalGoals || 0);
  const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const overview: DashboardOverview = {
    progressPercent,
    stats: [
      { label: "Hours studied", value: String(totals.totalDocuments || 0) },
      { label: "Tasks completed", value: String(completedGoals) },
      { label: "Current streak", value: `${averages.avgStudyStreak || 0} days` },
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
