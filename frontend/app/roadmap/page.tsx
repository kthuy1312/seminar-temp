"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getGoals, getRoadmap, toggleRoadmapItem } from "@/lib/api/goal.api";
import type { GoalItem } from "@/types/goal";

type Status = "Chưa làm" | "Đang học" | "Hoàn thành";

type RoadmapRow = {
  id: string;
  day: number;
  skill: string;
  topic: string;
  activity: string;
  duration: string;
  priority: string;
  status: Status;
};

const priorityClassMap: Record<string, string> = {
  Cao: "bg-orange-100 text-orange-700 border-orange-200",
  "Trung bình": "bg-amber-100 text-amber-700 border-amber-200",
  Thấp: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const statusClassMap: Record<Status, string> = {
  "Chưa làm": "bg-slate-100 text-slate-700 border-slate-200",
  "Đang học": "bg-blue-100 text-blue-700 border-blue-200",
  "Hoàn thành": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function mapPriority(p?: string | null): string {
  if (!p) return "Trung bình";
  const lower = p.toLowerCase();
  if (lower.includes("cao") || lower === "high") return "Cao";
  if (lower.includes("thấp") || lower === "low") return "Thấp";
  return "Trung bình";
}

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmapItems, setRoadmapItems] = useState<RoadmapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<GoalItem["ai_analysis"]>(null);
  const currentDay = 1;

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const goals = await getGoals();
        if (goals && goals.length > 0) {
          const latestGoal = goals[0] as GoalItem;
          setGoalTitle(latestGoal.title);
          setAiAnalysis(latestGoal.ai_analysis ?? null);

          const roadmap = await getRoadmap(latestGoal.id);
          const mapped: RoadmapRow[] = roadmap.map((item) => ({
            id: item.id,
            day: item.day,
            skill: item.skill || latestGoal.subjects?.[0] || "Vocabulary",
            topic: item.topic,
            activity: item.activity || "",
            duration: item.duration || "45 phút",
            priority: mapPriority(item.priority),
            status: item.is_completed ? "Hoàn thành" : "Chưa làm",
          }));
          setRoadmapItems(mapped);
        } else {
          setRoadmapItems([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải lộ trình");
      } finally {
        setLoading(false);
      }
    };
    loadRoadmap();
  }, []);

  const completedCount = useMemo(
    () => roadmapItems.filter((item) => item.status === "Hoàn thành").length,
    [roadmapItems]
  );

  const completionPercent = useMemo(() => {
    if (roadmapItems.length === 0) return 0;
    return Math.round((completedCount / roadmapItems.length) * 100);
  }, [completedCount, roadmapItems.length]);

  const updateStatus = async (itemId: string, status: Status) => {
    setRoadmapItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status } : item))
    );

    try {
      await toggleRoadmapItem(itemId, status === "Hoàn thành");
    } catch {
      /* optimistic UI */
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-500">
              Lộ trình học tiếng Anh: {goalTitle || "—"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              Kế Hoạch 7 Ngày Từ AI
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Mỗi ngày tập trung một kỹ năng: nghe, nói, đọc, viết, từ vựng hoặc ngữ pháp.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              {completionPercent}% hoàn thành lộ trình
            </p>
            <p className="text-xs text-slate-500">
              {completedCount}/{roadmapItems.length} nhiệm vụ
            </p>
          </div>
        </div>

        {aiAnalysis && (
          <div className="mt-4 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900">
            {aiAnalysis.learning_strategy && (
              <p className="mb-2">
                <strong>Chiến lược:</strong> {aiAnalysis.learning_strategy}
              </p>
            )}
            {aiAnalysis.feasibility && (
              <p>
                <strong>Khả thi:</strong> {aiAnalysis.feasibility}
                {aiAnalysis.feasibility_note ? ` — ${aiAnalysis.feasibility_note}` : ""}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </section>

      <section className="max-h-[calc(100vh-14rem)] space-y-4 overflow-y-auto pr-1">
        {roadmapItems.map((item) => {
          const isCurrentDay = item.day === currentDay;
          const isDone = item.status === "Hoàn thành";
          const isInProgress = item.status === "Đang học";

          return (
            <article
              key={item.id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                isCurrentDay ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Ngày {item.day}</h2>
                  {isCurrentDay && (
                    <p className="mt-1 text-xs font-medium text-blue-600">Hôm nay</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      priorityClassMap[item.priority] || priorityClassMap["Trung bình"]
                    }`}
                  >
                    Ưu tiên {item.priority}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassMap[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Kỹ năng</dt>
                  <dd className="font-medium text-slate-900">{item.skill}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Chủ đề</dt>
                  <dd className="font-medium text-slate-900">{item.topic}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-slate-500">Nhiệm vụ</dt>
                  <dd className="font-medium text-slate-900">{item.activity || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Thời lượng</dt>
                  <dd className="font-medium text-slate-900">{item.duration}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isDone}
                  onClick={() => updateStatus(item.id, "Đang học")}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Bắt đầu
                </button>
                <button
                  type="button"
                  disabled={isDone || !isInProgress}
                  onClick={() => updateStatus(item.id, "Hoàn thành")}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Hoàn thành
                </button>
              </div>
            </article>
          );
        })}
        {!loading && roadmapItems.length === 0 && (
          <article className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
            <p>Chưa có lộ trình tiếng Anh.</p>
            <button
              type="button"
              onClick={() => router.push("/goals")}
              className="mt-3 font-medium text-blue-500 hover:underline"
            >
              Tạo mục tiêu tiếng Anh
            </button>
          </article>
        )}
      </section>
      {loading && (
        <section className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600 shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
          Đang tạo lộ trình từ AI...
        </section>
      )}
      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </section>
      )}
    </div>
  );
}
