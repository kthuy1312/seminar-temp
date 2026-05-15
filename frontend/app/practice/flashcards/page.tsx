"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getFlashcards, generateFlashcards, deleteFlashcard } from "@/lib/api/quiz.api";
import { SparklesIcon, TrashIcon, ArrowPathIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

function FlashcardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [documentId]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await getFlashcards(documentId || undefined);
      setCards(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!documentId) return;
    setIsGenerating(true);
    try {
      await generateFlashcards(documentId);
      await fetchCards();
      setCurrentIndex(0);
    } catch (err) {
      alert("Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa flashcard này?")) return;
    try {
      await deleteFlashcard(id);
      setCards(prev => prev.filter(c => c.id !== id));
      if (currentIndex >= cards.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const nextCard = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-medium">Đang tải bộ thẻ ghi nhớ...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6 px-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button 
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Quay lại
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thẻ Ghi Nhớ (Flashcards)</h1>
          <p className="text-slate-600">Luyện tập trí nhớ với phương pháp Active Recall.</p>
        </div>
        {documentId && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isGenerating ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5" />}
            Tạo thêm bằng AI
          </button>
        )}
      </header>

      {cards.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          {/* Card Container */}
          <div 
            className="perspective-1000 h-96 w-full max-w-lg cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative h-full w-full transition-all duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-blue-100 bg-white p-12 text-center backface-hidden">
                <span className="absolute top-6 left-6 rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">Câu hỏi</span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                  {cards[currentIndex].front}
                </h3>
                <p className="absolute bottom-8 text-xs text-slate-400 font-medium italic">Click để xem đáp án</p>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-100 bg-emerald-50 p-12 text-center backface-hidden rotate-y-180">
                <span className="absolute top-6 left-6 rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Đáp án</span>
                <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed">
                  {cards[currentIndex].back}
                </p>
                <p className="absolute bottom-8 text-xs text-emerald-600/60 font-medium italic">Click để quay lại câu hỏi</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full max-w-lg">
            <button 
              onClick={prevCard} 
              className="flex items-center justify-center h-14 w-14 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition active:scale-90"
            >
              <ChevronLeftIcon className="h-6 w-6" strokeWidth={2.5} />
            </button>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-black text-slate-900">{currentIndex + 1} / {cards.length}</span>
              <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            <button 
              onClick={nextCard}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition active:scale-90"
            >
              <ChevronLeftIcon className="h-6 w-6 rotate-180" strokeWidth={2.5} />
            </button>
          </div>

          <button 
            onClick={() => handleDelete(cards[currentIndex].id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <TrashIcon className="h-4.5 w-4.5" /> Xóa thẻ này
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <ArrowPathIcon className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Chưa có thẻ ghi nhớ</h3>
          <p className="mt-2 text-slate-500 max-w-xs text-center px-4">
            Bạn có thể tạo bộ thẻ học tập tự động từ tài liệu bằng sức mạnh của AI.
          </p>
          {!documentId && (
            <button 
              onClick={() => router.push('/documents')}
              className="mt-6 font-bold text-blue-600 hover:underline"
            >
              Chọn tài liệu ngay &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <FlashcardsContent />
    </Suspense>
  );
}
