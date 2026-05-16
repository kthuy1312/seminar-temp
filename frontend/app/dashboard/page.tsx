"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  RocketLaunchIcon, 
  SparklesIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

import { getDashboardOverview, getRecentActivities } from "@/lib/api/dashboard.api";
import { DashboardOverview } from "@/types/dashboard";

const defaultOverview: DashboardOverview = {
  progressPercent: 0,
  stats: [],
  nextTasks: [],
  suggestions: [],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview>(defaultOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [overview, activities] = await Promise.all([
          getDashboardOverview(),
          getRecentActivities(),
        ]);

        const nextTasks = activities.slice(0, 3).map((item) => ({
          id: item.id,
          subject: "Hoạt động gần đây",
          topic: item.action,
        }));

        setData({
          ...overview,
          nextTasks,
          suggestions: overview.suggestions.length > 0 
            ? overview.suggestions 
            : ["Tạo mục tiêu tiếng Anh và tải tài liệu để nhận gợi ý từ AI."],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải bảng điều khiển");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Tổng quan học tập
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Xem thống kê, tiến độ và nhận gợi ý học tập từ AI.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.stats.length > 0 ? data.stats.map((stat, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {idx === 0 ? <DocumentTextIcon className="h-4 w-4" /> : 
                   idx === 1 ? <AcademicCapIcon className="h-4 w-4" /> : 
                   idx === 2 ? <ClockIcon className="h-4 w-4" /> : 
                   <ChartBarIcon className="h-4 w-4" />}
                </div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            )) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse" />
              ))
            )}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-slate-900">Hoạt động gần đây</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {data.nextTasks.length > 0 ? data.nextTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/documents"
                  className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-white"
                >
                  <CheckCircleIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{task.topic}</p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                </Link>
              )) : (
                <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-400">Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">Gợi Ý Từ AI</h2>
            </div>
            
            <div className="space-y-3">
              {data.suggestions.map((suggestion, idx) => (
                <div key={idx} className="rounded-xl bg-indigo-50 p-4 text-sm font-medium leading-relaxed text-indigo-900 border border-indigo-100">
                  {suggestion}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Thao Tác Nhanh</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/documents" className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-3 transition hover:bg-blue-50 hover:text-blue-600 border border-slate-100">
                <DocumentTextIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold">Tài liệu</span>
              </Link>
              <Link href="/practice" className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-3 transition hover:bg-orange-50 hover:text-orange-600 border border-slate-100">
                <PencilSquareIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold">Làm Quiz</span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}