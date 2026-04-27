"use client";

import { useMemo, useState } from "react";

type Priority = "High" | "Medium" | "Low";
type Status = "Todo" | "In Progress" | "Done";

type RoadmapItem = {
  day: number;
  subject: string;
  topic: string;
  duration: string;
  priority: Priority;
  status: Status;
};

const initialRoadmap: RoadmapItem[] = [
  {
    day: 1,
    subject: "Math",
    topic: "Algebra basics",
    duration: "2h",
    priority: "High",
    status: "Todo",
  },
  {
    day: 2,
    subject: "Physics",
    topic: "Kinematics fundamentals",
    duration: "1.5h",
    priority: "High",
    status: "Todo",
  },
  {
    day: 3,
    subject: "Chemistry",
    topic: "Atomic structure and bonding",
    duration: "2h",
    priority: "Medium",
    status: "Todo",
  },
  {
    day: 4,
    subject: "Math",
    topic: "Linear equations practice",
    duration: "1.5h",
    priority: "Medium",
    status: "Todo",
  },
  {
    day: 5,
    subject: "Physics",
    topic: "Forces and Newton's laws",
    duration: "2h",
    priority: "High",
    status: "Todo",
  },
  {
    day: 6,
    subject: "Chemistry",
    topic: "Mole concept exercises",
    duration: "1h",
    priority: "Low",
    status: "Todo",
  },
  {
    day: 7,
    subject: "Mixed Review",
    topic: "Weekly recap and mini quiz",
    duration: "2h",
    priority: "Low",
    status: "Todo",
  },
];

const priorityClassMap: Record<Priority, string> = {
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const statusClassMap: Record<Status, string> = {
  Todo: "bg-slate-100 text-slate-700 border-slate-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Done: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function RoadmapPage() {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(initialRoadmap);
  const currentDay = 3;

  const completedCount = useMemo(
    () => roadmapItems.filter((item) => item.status === "Done").length,
    [roadmapItems]
  );

  const completionPercent = useMemo(() => {
    if (roadmapItems.length === 0) return 0;
    return Math.round((completedCount / roadmapItems.length) * 100);
  }, [completedCount, roadmapItems.length]);

  const updateStatus = (day: number, status: Status) => {
    setRoadmapItems((prev) =>
      prev.map((item) => (item.day === day ? { ...item, status } : item))
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-500">Learning Roadmap</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              Your AI-Generated Plan
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track your daily tasks and move each study day from Todo to Done.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {completionPercent}% completed
          </p>
        </div>

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
          const isDone = item.status === "Done";
          const isInProgress = item.status === "In Progress";

          return (
            <article
              key={item.day}
              className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                isCurrentDay
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Day {item.day}
                  </h2>
                  {isCurrentDay && (
                    <p className="mt-1 text-xs font-medium text-blue-600">
                      Current day
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priorityClassMap[item.priority]}`}
                  >
                    {item.priority} Priority
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassMap[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Subject</dt>
                  <dd className="font-medium text-slate-900">{item.subject}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Topic</dt>
                  <dd className="font-medium text-slate-900">{item.topic}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="font-medium text-slate-900">{item.duration}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isDone}
                  onClick={() => updateStatus(item.day, "In Progress")}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  Start
                </button>
                <button
                  type="button"
                  disabled={isDone || !isInProgress}
                  onClick={() => updateStatus(item.day, "Done")}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Mark as Done
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
