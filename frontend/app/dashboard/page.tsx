import Link from "next/link";

type Task = {
  id: number;
  subject: string;
  topic: string;
};

const progressPercent = 40;

const nextTasks: Task[] = [
  { id: 1, subject: "Math", topic: "Algebra basics" },
  { id: 2, subject: "Physics", topic: "Motion" },
  { id: 3, subject: "Chemistry", topic: "Atomic structure" },
];

const aiSuggestions = [
  "You should review Algebra basics today.",
  "Focus more on Physics this week.",
  "Take a short quiz after each study session.",
];

const studyStats = [
  { label: "Hours studied", value: "10" },
  { label: "Tasks completed", value: "5" },
  { label: "Current streak", value: "3 days" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-medium text-blue-500">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
          Learning Overview
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track progress, continue upcoming tasks, and follow AI suggestions to
          keep your study plan on track.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Progress
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {progressPercent}% completed
              </p>
            </div>
            <Link
              href="/roadmap"
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              View roadmap
            </Link>
          </div>
          <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-blue-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/documents"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Upload Material
            </Link>
            <Link
              href="/tutor"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Ask AI Tutor
            </Link>
            <Link
              href="/practice"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Start Quiz
            </Link>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Study Stats</h2>
          <div className="mt-4 space-y-3">
            {studyStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Next Tasks</h2>
            <Link
              href="/roadmap"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              See all
            </Link>
          </div>

          <ul className="mt-4 space-y-3">
            {nextTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href="/roadmap"
                  className="block rounded-lg border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <p className="text-xs font-medium text-slate-500">{task.subject}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {task.topic}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">AI Suggestions</h2>
          <ul className="mt-4 space-y-3">
            {aiSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {suggestion}
              </li>
            ))}
          </ul>
          <Link
            href="/tutor"
            className="mt-4 inline-flex rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Ask AI
          </Link>
        </article>
      </div>
    </div>
  );
}
