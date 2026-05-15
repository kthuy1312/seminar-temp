"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

import { getDashboardOverview, getDashboardProgress } from "@/lib/api/dashboard.api";

const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ProgressPage() {
  const [chartData, setChartData] = useState<Array<{ day: string; hours: number }>>([]);
  const [completion, setCompletion] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [overview, progress] = await Promise.all([
          getDashboardOverview(),
          getDashboardProgress(),
        ]);

        setCompletion(overview.progressPercent);
        setTasksDone(Number(overview.stats.find((item) => item.label === "Nhiệm vụ hoàn thành")?.value || 0));
        setStreakDays(Number((overview.stats.find((item) => item.label === "Chuỗi ngày học")?.value || "0").split(" ")[0]));
        setChartData(
          progress.map((item) => ({
            day: weekDays[new Date(item.date).getDay()] || "N/A",
            hours: item.completedGoals,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải tiến độ");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const totalHours = useMemo(
    () => chartData.reduce((sum, item) => sum + item.hours, 0),
    [chartData]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-medium text-blue-500">Theo dõi tiến độ</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Tổng Quan Tiến Độ Học Tập
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Theo dõi giờ học hàng tuần, tỷ lệ hoàn thành và sự kiên trì của bạn tại một nơi duy nhất.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Giờ học (Biểu đồ cột)
            </h2>
            <span className="text-sm text-slate-500">Tuần này</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="h-64 min-w-[520px] md:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "#dbeafe" }}
                    contentStyle={{
                      borderRadius: "0.75rem",
                      borderColor: "#bfdbfe",
                    }}
                  />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {!loading && chartData.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu tiến độ.</p>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Tỷ Lệ Hoàn Thành</h2>
          <p className="mt-2 text-sm text-slate-600">
            Bạn đã hoàn thành {completion}% lộ trình.
          </p>
          <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-green-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">
            Cố gắng lên, bạn đang tiến bộ rất ổn định.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold text-slate-900">Thống Kê Học Tập</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Tổng giờ học</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalHours} giờ
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Nhiệm vụ hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{tasksDone}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Chuỗi ngày học</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {streakDays} ngày 🔥
              </p>
            </div>
          </div>
        </article>
      </div>
      {loading && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Đang tải tiến độ...
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
