"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;
const durations = ["7 days", "1 month", "3 months"] as const;
const subjects = ["Math", "Physics", "Chemistry"] as const;

export default function GoalsPage() {
  const router = useRouter();
  const [targetScore, setTargetScore] = useState("");
  const [level, setLevel] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      targetScore.trim().length > 0 &&
      level.length > 0 &&
      Number(hoursPerDay) > 0 &&
      duration.length > 0 &&
      selectedSubjects.length > 0
    );
  }, [targetScore, level, hoursPerDay, duration, selectedSubjects]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((item) => item !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);

    if (!isFormValid) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push("/roadmap");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center py-4 md:min-h-[calc(100vh-9rem)]">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-blue-500">Goal Setting</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Build Your Study Plan
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Tell us your target and study preferences to generate a roadmap
            that matches your current level.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="target-score"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Target score
              </label>
              <input
                id="target-score"
                type="text"
                placeholder='e.g. "Math 8+"'
                value={targetScore}
                onChange={(event) => setTargetScore(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {showErrors && targetScore.trim().length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Please enter your target score.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="current-level"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Current level
              </label>
              <select
                id="current-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select level</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {showErrors && level.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Please choose your current level.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="study-hours"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Study time per day (hours)
              </label>
              <input
                id="study-hours"
                type="number"
                min="1"
                step="0.5"
                placeholder="e.g. 2"
                value={hoursPerDay}
                onChange={(event) => setHoursPerDay(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {showErrors && !(Number(hoursPerDay) > 0) && (
                <p className="mt-1 text-xs text-red-600">
                  Please enter a valid study duration.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="duration"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Study duration
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select duration</option>
                {durations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {showErrors && duration.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Please choose a study duration.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => {
                const active = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
            {showErrors && selectedSubjects.length === 0 && (
              <p className="mt-1 text-xs text-red-600">
                Please select at least one subject.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Generating Study Plan..." : "Generate Study Plan"}
          </button>
        </form>
      </section>
    </div>
  );
}
