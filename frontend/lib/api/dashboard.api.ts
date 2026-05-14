import { apiRequest } from "@/lib/api/client";
import { DashboardActivity, DashboardOverview } from "@/types/dashboard";

// Matches the actual response shape from dashboard-service getStats()
// Per-user response: flat UserStats object inside data
// Global (no userId) response: nested totals/averages
type DashboardStatsResponse = {
  success: boolean;
  data: {
    // Nested global shape
    totals?: {
      totalGoals?: number;
      completedGoals?: number;
      totalDocuments?: number;
      totalQuizzes?: number;
    };
    averages?: {
      avgQuizScore?: number;
      avgStudyStreak?: number;
    };
    // Flat per-user shape (UserStats entity)
    totalGoals?: number;
    completedGoals?: number;
    totalDocuments?: number;
    totalQuizzes?: number;
    studyStreak?: number;
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
  const d = stats.data || {};

  // Backend returns nested (global) or flat (per-user) shape
  const completedGoals = Number(
    d.completedGoals ?? d.totals?.completedGoals ?? 0,
  );
  const totalGoals = Number(d.totalGoals ?? d.totals?.totalGoals ?? 0);
  const totalDocuments = Number(
    d.totalDocuments ?? d.totals?.totalDocuments ?? 0,
  );
  const avgStudyStreak = Number(
    d.studyStreak ?? d.averages?.avgStudyStreak ?? 0,
  );
  const progressPercent =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const overview: DashboardOverview = {
    progressPercent,
    stats: [
      { label: "Documents uploaded", value: String(totalDocuments) },
      { label: "Tasks completed", value: String(completedGoals) },
      { label: "Current streak", value: `${avgStudyStreak} days` },
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
