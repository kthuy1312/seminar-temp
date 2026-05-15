"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createGoal } from "@/lib/api/goal.api";

const englishGoals = [
  "IELTS 6.5",
  "TOEIC 700",
  "Giao tiếp cơ bản",
  "Cải thiện ngữ pháp",
  "Tăng vốn từ vựng",
] as const;

const levels = ["Beginner", "Elementary", "Intermediate", "Advanced"] as const;
const durations = ["7 ngày", "1 tháng", "3 tháng"] as const;
const skills = [
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
  "Vocabulary",
  "Grammar",
] as const;

const durationToDays: Record<string, number> = {
  "7 ngày": 7,
  "1 tháng": 30,
  "3 tháng": 90,
};

export default function GoalsPage() {
  const router = useRouter();
  const [targetGoal, setTargetGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [level, setLevel] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [difficultyNotes, setDifficultyNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolvedGoal = customGoal.trim() || targetGoal;

  const isFormValid = useMemo(() => {
    return (
      resolvedGoal.length > 0 &&
      level.length > 0 &&
      Number(hoursPerDay) > 0 &&
      duration.length > 0 &&
      selectedSkills.length > 0
    );
  }, [resolvedGoal, level, hoursPerDay, duration, selectedSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);

    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const days = durationToDays[duration] ?? 30;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      await createGoal({
        title: resolvedGoal,
        target_score: resolvedGoal,
        current_level: level,
        daily_hours: Number(hoursPerDay),
        subjects: selectedSkills,
        category: "Tiếng Anh",
        description: difficultyNotes.trim() || undefined,
        target_date: targetDate.toISOString().split("T")[0],
      });
      router.push("/roadmap");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể tạo mục tiêu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center py-4 md:min-h-[calc(100vh-9rem)]">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-blue-500">Thiết lập mục tiêu tiếng Anh</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Mục Tiêu Học Tiếng Anh
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Chọn mục tiêu, trình độ và kỹ năng cần cải thiện — AI sẽ phân tích và tạo lộ trình học
            tiếng Anh phù hợp.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Mục tiêu học</p>
              <div className="flex flex-wrap gap-2">
                {englishGoals.map((goal) => {
                  const active = targetGoal === goal && !customGoal.trim();
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => {
                        setTargetGoal(goal);
                        setCustomGoal("");
                      }}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Hoặc nhập mục tiêu khác (VD: IELTS 7.0)"
                value={customGoal}
                onChange={(e) => {
                  setCustomGoal(e.target.value);
                  if (e.target.value) setTargetGoal("");
                }}
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {showErrors && resolvedGoal.length === 0 && (
                <p className="mt-1 text-xs text-red-600">Vui lòng chọn hoặc nhập mục tiêu.</p>
              )}
            </div>

            <div>
              <label htmlFor="current-level" className="mb-2 block text-sm font-medium text-slate-700">
                Trình độ hiện tại
              </label>
              <select
                id="current-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Chọn trình độ</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {showErrors && level.length === 0 && (
                <p className="mt-1 text-xs text-red-600">Vui lòng chọn trình độ.</p>
              )}
            </div>

            <div>
              <label htmlFor="study-hours" className="mb-2 block text-sm font-medium text-slate-700">
                Thời gian học mỗi ngày (giờ)
              </label>
              <input
                id="study-hours"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="VD: 1.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {showErrors && !(Number(hoursPerDay) > 0) && (
                <p className="mt-1 text-xs text-red-600">Nhập thời gian học hợp lệ (&gt; 0).</p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="mb-2 block text-sm font-medium text-slate-700">
                Thời hạn mục tiêu
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Chọn thời hạn</option>
                {durations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {showErrors && duration.length === 0 && (
                <p className="mt-1 text-xs text-red-600">Vui lòng chọn thời hạn.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Kỹ năng cần cải thiện</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            {showErrors && selectedSkills.length === 0 && (
              <p className="mt-1 text-xs text-red-600">Chọn ít nhất một kỹ năng.</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-700">
              Ghi chú khó khăn hiện tại
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="VD: Nghe không bắt kịp, ngại nói, yếu thì hiện tại hoàn thành..."
              value={difficultyNotes}
              onChange={(e) => setDifficultyNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Đang phân tích mục tiêu..." : "Tạo mục tiêu & lộ trình AI"}
          </button>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </form>
      </section>
    </div>
  );
}
