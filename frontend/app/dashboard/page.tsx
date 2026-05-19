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
  ChartBarIcon,
  PencilSquareIcon,
  ArrowRightIcon,
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

        const nextTasks = activities.slice(0, 4).map((item) => ({
          id: item.id,
          subject: item.createdAt
            ? new Date(item.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Hoạt động gần đây",
          topic: item.action,
        }));

        setData({
          ...overview,
          nextTasks,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải bảng điều khiển");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const tasksContent = useMemo(() => {
    if (data.nextTasks.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Chưa có hoạt động gần đây. Bắt đầu bằng cách tạo mục tiêu hoặc tải tài liệu.
        </div>
      );
    }

    return data.nextTasks.map((task) => (
      <Link
        key={task.id}
        href="/documents"
        className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
      >
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <CheckCircleIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{task.topic}</p>
          <p className="mt-1 text-xs text-slate-500">{task.subject}</p>
        </div>
        <ChevronRightIcon className="mt-1 h-4 w-4 text-slate-300 transition group-hover:text-blue-500" />
      </Link>
    ));
  }, [data.nextTasks]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-10">
        <div className="absolute -right-12 top-1/2 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -left-12 -top-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr,1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Bảng điều khiển</p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Tổng quan học tập của bạn</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Xem tiến độ và hoạt động gần đây để giữ nhịp học hiệu quả.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lộ trình hoàn thành</p>
              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">{data.progressPercent}%</p>
                  <p className="mt-1 text-xs text-slate-300">Lộ trình hiện tại</p>
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-950/70 text-lg font-bold text-white">
                  {data.progressPercent}%
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Điểm trung bình</p>
              <p className="mt-6 text-3xl font-semibold">{data.avgQuizScore ? `${data.avgQuizScore}%` : "Chưa có"}</p>
              <p className="mt-2 text-xs text-slate-300">Hiệu suất quiz</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.stats.length > 0 ? data.stats.map((stat, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {idx === 0 ? <DocumentTextIcon className="h-5 w-5" /> :
                   idx === 1 ? <AcademicCapIcon className="h-5 w-5" /> :
                   idx === 2 ? <ClockIcon className="h-5 w-5" /> :
                   <ChartBarIcon className="h-5 w-5" />}
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            )) : Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5 text-orange-500" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h2>
                  <p className="text-sm text-slate-500">Xem lại những bước học mới nhất.</p>
                </div>
              </div>
              <Link href="/documents" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                Xem tất cả <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-3">{tasksContent}</div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Tiếp tục hành trình</p>
                <p className="mt-1 text-sm text-slate-500">Các bước nhanh để giữ nhịp học.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Link href="/goals" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Tạo mục tiêu mới</p>
                    <p className="mt-1 text-xs text-slate-500">Xây dựng lộ trình học phù hợp.</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
              <Link href="/documents" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Tải tài liệu</p>
                    <p className="mt-1 text-xs text-slate-500">Nâng cao kiến thức với tài liệu mới.</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
              <Link href="/practice" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Làm quiz</p>
                    <p className="mt-1 text-xs text-slate-500">Kiểm tra lại kiến thức đã học.</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}