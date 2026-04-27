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

const chartData = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 1 },
  { day: "Thu", hours: 4 },
  { day: "Fri", hours: 2 },
];

const completion = 60;
const streakDays = 4;
const tasksDone = 8;
const totalHours = chartData.reduce((sum, item) => sum + item.hours, 0);

export default function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-medium text-blue-500">Progress Tracking</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Learning Progress Overview
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track your weekly study hours, completion rate, and consistency in one
          place.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Study Hours (Bar Chart)
            </h2>
            <span className="text-sm text-slate-500">This week</span>
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
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Completion Rate</h2>
          <p className="mt-2 text-sm text-slate-600">
            {completion}% of your roadmap is completed.
          </p>
          <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-green-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">
            Keep going, you are making steady progress.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold text-slate-900">Study Stats</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total hours studied</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalHours}h
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Tasks completed</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{tasksDone}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Study streak</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {streakDays}-day streak 🔥
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
