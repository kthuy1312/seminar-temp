"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type MessageRole = "user" | "ai";

type Message = {
  id: number;
  role: MessageRole;
  content: string;
};

const quickPrompts = [
  "Giải thích dễ hơn",
  "Cho ví dụ",
  "Tạo câu hỏi ôn tập",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content: "Hi! I'm your AI tutor. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: "Here is a simple explanation for your question...",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1400);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-12">
      <section className="flex h-[calc(100vh-9rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
        <header className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-medium text-blue-500">AI Tutor</p>
          <h1 className="text-xl font-semibold text-slate-900">Chat Assistant</h1>
        </header>

        <div
          ref={messageListRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-5"
        >
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                    AI
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-6 ${
                    isUser
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.content}
                </div>
                {isUser && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    U
                  </span>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                AI
              </span>
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                AI is typing...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 p-4 md:p-5"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your question..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Send
            </button>
          </div>
        </form>
      </section>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
        <h2 className="text-base font-semibold text-slate-900">Context Panel</h2>

        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="font-medium text-slate-800">Related documents</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>Algebra Notes - Chapter 1</li>
              <li>Physics Formula Sheet</li>
              <li>Chemistry Quick Summary</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-slate-800">Current topic</p>
            <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
              Algebra basics and equation solving
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-800">Quick prompts</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
