"use client";

import { FormEvent, useEffect, useRef, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendTutorMessage } from "@/lib/api/tutor.api";
import { getDocuments } from "@/lib/api/document.api";
import { DocumentItem } from "@/types/document";
import { AiMessageContent } from "@/components/ai-message-content";
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  UserCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

type MessageRole = "user" | "ai";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
};

const quickPrompts = [
  "Giải thích ngữ pháp trong tài liệu",
  "Sửa câu tiếng Anh của tôi",
  "Dịch và giải nghĩa từ vựng chính",
  "Gợi ý cách diễn đạt tự nhiên hơn",
];

function TutorContent() {
  const searchParams = useSearchParams();
  const urlDocumentId = searchParams.get("documentId");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "ai",
      content: "Xin chào! Tôi là Gia sư Tiếng Anh AI. Chọn tài liệu đã upload và hỏi về ngữ pháp, từ vựng hoặc nhờ sửa câu tiếng Anh nhé.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [loadingDocs, setLoadingDocs] = useState(true);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (urlDocumentId && docs.some(d => d.id === urlDocumentId)) {
          setSelectedDocId(urlDocumentId);
        } else if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      })
      .catch((err) => console.error("Failed to load documents:", err))
      .finally(() => setLoadingDocs(false));
  }, [urlDocumentId]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading || !selectedDocId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendTutorMessage({
        question: trimmed,
        documentId: selectedDocId,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: error instanceof Error ? `Lỗi Gia sư: ${error.message}` : "Tôi gặp lỗi kỹ thuật. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row h-[calc(100vh-8rem)]">
      {/* Sidebar: Context & Documents */}
      <aside className="w-full shrink-0 space-y-4 lg:w-80 h-full overflow-y-auto pr-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Tài liệu tiếng Anh</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400">Chọn Tài Liệu</label>
              {loadingDocs ? (
                <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-slate-100"></div>
              ) : documents.length === 0 ? (
                <div className="mt-2 rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">Không tìm thấy tài liệu nào.</p>
                  <Link href="/documents" className="mt-2 block text-xs font-bold text-blue-600">Tải lên ngay</Link>
                </div>
              ) : (
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none ring-blue-100 transition focus:border-blue-500 focus:ring-4"
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.fileName}</option>
                  ))}
                </select>
              )}
            </div>

            {selectedDoc && (
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase">Đang dùng nội dung file</p>
                <p className="mt-1 text-sm font-bold text-slate-900 truncate">{selectedDoc.fileName}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-blue-600">
                  <span className="uppercase">{selectedDoc.fileType}</span>
                  <span>&bull;</span>
                  <span>{selectedDoc.fileSizeFormatted}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <h2 className="font-bold text-slate-900">Thao Tác Nhanh</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading || !selectedDocId}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-full">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Gia sư Tiếng Anh AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trực tuyến & Sẵn sàng</span>
              </div>
            </div>
          </div>
        </header>

        {/* Message List */}
        <div 
          ref={messageListRef}
          className="flex-1 space-y-6 overflow-y-auto bg-slate-50/30 p-6"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'}`}>
                  {msg.role === 'user' ? <UserCircleIcon className="h-5 w-5" /> : <AcademicCapIcon className="h-5 w-5" />}
                </div>
                <div className={`rounded-2xl px-5 py-3.5 text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 font-medium text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.role === "ai" ? (
                    <AiMessageContent content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                  <AcademicCapIcon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-100 px-5 py-4 shadow-sm rounded-tl-none">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <footer className="border-t border-slate-100 p-4 md:p-6 bg-white">
          {!selectedDocId && !loadingDocs && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-50 p-3 text-xs font-bold text-orange-700">
              <InformationCircleIcon className="h-4 w-4" />
              Vui lòng chọn hoặc tải lên tài liệu để bắt đầu trò chuyện với AI.
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedDocId ? "Nhập câu hỏi của bạn tại đây..." : "Vui lòng chọn tài liệu trước..."}
              disabled={!selectedDocId || isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-5 pr-14 text-sm font-medium outline-none ring-blue-100 transition focus:bg-white focus:border-blue-500 focus:ring-4"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !selectedDocId}
              className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:bg-slate-300 active:scale-95 flex items-center justify-center"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Hỗ trợ bởi Gemini 1.5 Pro &bull; Nội dung do AI tạo ra
          </p>
        </footer>
      </section>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div>Đang tải Gia sư Tiếng Anh AI...</div>}>
      <TutorContent />
    </Suspense>
  );
}
