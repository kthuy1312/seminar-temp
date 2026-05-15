import { apiRequest } from "@/lib/api/client";
import { getGoals } from "@/lib/api/goal.api";
import { getFlashcards } from "@/lib/api/quiz.api";
import { DashboardActivity, DashboardOverview } from "@/types/dashboard";
import type { AiAnalysis, GoalItem } from "@/types/goal";

type DashboardStatsResponse = {
  success: boolean;
  data: {
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
    totalGoals?: number;
    completedGoals?: number;
    totalDocuments?: number;
    totalQuizzes?: number;
    studyStreak?: number;
    avgQuizScore?: number;
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

function buildSuggestions(analysis: AiAnalysis | null | undefined): string[] {
  if (!analysis) {
    return ["Tạo mục tiêu tiếng Anh để nhận gợi ý cá nhân hóa từ AI."];
  }
  const suggestions: string[] = [];
  if (analysis.priority_skills?.length) {
    const skills = analysis.priority_skills.map((s) => s.skill).join(", ");
    suggestions.push(`Nên ưu tiên luyện: ${skills}.`);
  } else if (analysis.priority_subjects?.length) {
    suggestions.push(`Ưu tiên: ${analysis.priority_subjects.join(", ")}.`);
  }
  if (analysis.suggestions?.length) {
    suggestions.push(...analysis.suggestions.slice(0, 2));
  }
  if (analysis.learning_strategy) {
    suggestions.push(analysis.learning_strategy);
  }
  return suggestions.length > 0 ? suggestions.slice(0, 3) : ["Tiếp tục luyện tập đều mỗi ngày."];
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [statsRaw, goals, flashcards] = await Promise.all([
    apiRequest<DashboardStatsResponse["data"]>("/api/dashboard/stats").catch(
      () => ({}) as DashboardStatsResponse["data"]
    ),
    getGoals().catch(() => [] as GoalItem[]),
    getFlashcards().catch(() => []),
  ]);

  const d = statsRaw || {};
  const totalQuizzes = Number(d.totalQuizzes ?? d.totals?.totalQuizzes ?? 0);
  const totalDocuments = Number(d.totalDocuments ?? d.totals?.totalDocuments ?? 0);
  const studyStreak = Number(d.studyStreak ?? d.averages?.avgStudyStreak ?? 0);
  const avgQuizScore = Number(d.avgQuizScore ?? d.averages?.avgQuizScore ?? 0);

  const latestGoal = goals[0] as GoalItem | undefined;
  const roadmapItems = latestGoal?.roadmap_items ?? [];
  const roadmapDone = roadmapItems.filter((r) => r.is_completed).length;
  const roadmapPercent =
    roadmapItems.length > 0 ? Math.round((roadmapDone / roadmapItems.length) * 100) : 0;

  const skillSet = new Set(latestGoal?.subjects ?? []);
  const skillProgress = ["Listening", "Speaking", "Reading", "Writing", "Vocabulary", "Grammar"]
    .filter((s) => skillSet.has(s))
    .join(", ") || "Chưa thiết lập";

  const overview: DashboardOverview = {
    progressPercent: roadmapPercent,
    stats: [
      { label: "Từ vựng (flashcard)", value: String(flashcards.length) },
      { label: "Quiz đã làm", value: String(totalQuizzes) },
      { label: "Chuỗi học tập", value: `${studyStreak} ngày` },
      { label: "Lộ trình hoàn thành", value: `${roadmapPercent}%` },
    ],
    skillProgress,
    avgQuizScore,
    nextTasks: [],
    suggestions: buildSuggestions(latestGoal?.ai_analysis),
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
