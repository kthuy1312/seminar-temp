"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  RocketLaunchIcon, 
  SparklesIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
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

  const isEmpty = useMemo(
    () =>
      data.stats.length === 0 &&
      data.nextTasks.length === 0 &&
      data.suggestions.length === 0,
    [data]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      {/* Premium Hero Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-blue-400 uppercase">
              <SparklesIcon className="h-4 w-4" />
              Sẵn sàng cho ngày mới
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              Học <span className="text-blue-400">Tiếng Anh</span> Cùng AI
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              Lộ trình 7 ngày, tài liệu IELTS/TOEIC, gia sư AI và quiz từ vựng — tất cả trong một nơi.
              {data.skillProgress && data.skillProgress !== "Chưa thiết lập" && (
                <span className="mt-2 block text-blue-300">Kỹ năng đang tập trung: {data.skillProgress}</span>
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95"
              >
                Tiếp tục học ngay
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/tutor"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
              >
                Hỏi Gia Sư Tiếng Anh
              </Link>
            </div>
          </div>

          {/* Circular Progress Gauge */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  className="fill-none stroke-slate-800"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  className="fill-none stroke-blue-500 transition-all duration-1000"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - data.progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">{data.progressPercent}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Stats & Next Tasks */}
        <div className="space-y-8 lg:col-span-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.stats.length > 0 ? data.stats.map((stat, idx) => (
              <div key={idx} className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-blue-100">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {idx === 0 ? <DocumentTextIcon className="h-5 w-5" /> : 
                   idx === 1 ? <AcademicCapIcon className="h-5 w-5" /> : 
                   idx === 2 ? <ClockIcon className="h-5 w-5" /> : 
                   <ChartBarIcon className="h-5 w-5" />}
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            )) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
              ))
            )}
          </div>

          {/* Next Tasks */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <RocketLaunchIcon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Thử Thách Tiếp Theo</h2>
              </div>
              <Link href="/roadmap" className="text-sm font-bold text-blue-600 hover:underline">Xem lộ trình &rarr;</Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.nextTasks.length > 0 ? data.nextTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/roadmap"
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-blue-200 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <CheckCircleIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.subject}</p>
                    <p className="truncate text-sm font-bold text-slate-900">{task.topic}</p>
                  </div>
                  <ChevronRightIcon className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              )) : (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-400">Bạn đã hoàn thành tất cả nhiệm vụ hiện tại!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-8 lg:col-span-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Gợi Ý Từ AI</h2>
            </div>
            
            <div className="mt-8 space-y-4">
              {data.suggestions.map((suggestion, idx) => (
                <div key={idx} className="relative rounded-2xl bg-indigo-50/50 p-5 text-sm font-medium leading-relaxed text-indigo-900">
                  <div className="absolute -left-1 top-4 h-8 w-1 rounded-full bg-indigo-500" />
                  {suggestion}
                </div>
              ))}
              
              <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Trạng thái hiện tại</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-black">Xuất sắc</span>
                  <div className="mb-1 flex gap-1">
                    <div className="h-3 w-1.5 rounded-full bg-green-500" />
                    <div className="h-3 w-1.5 rounded-full bg-green-500" />
                    <div className="h-3 w-1.5 rounded-full bg-green-500" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {data.avgQuizScore ? `Điểm quiz trung bình: ${Math.round(data.avgQuizScore)}%` : "Tiếp tục luyện quiz và flashcard mỗi ngày."}
                </p>
                <button className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100">
                  Xem báo cáo chi tiết
                </button>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Thao Tác Nhanh</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/documents" className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50 hover:text-blue-600">
                <DocumentTextIcon className="h-6 w-6" />
                <span className="text-xs font-bold">Tải lên</span>
              </Link>
              <Link href="/practice" className="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 transition hover:bg-orange-50 hover:text-orange-600">
                <PencilSquareIcon className="h-6 w-6" />
                <span className="text-xs font-bold">Làm Quiz</span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-bold text-slate-900">Đang tối ưu hóa dữ liệu học tập...</p>
          </div>
        </div>
      )}
    </div>
  );
}