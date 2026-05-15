"use client";

/** Renders basic Markdown (headings, lists, bold) for AI tutor replies. */
export function AiMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={index} className="mt-3 text-base font-bold text-slate-900">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={index} className="mt-2 font-semibold text-slate-800">
              {trimmed.slice(4)}
            </h4>
          );
        }
        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <li key={index} className="ml-4 list-disc text-slate-700">
              <InlineBold text={trimmed.replace(/^[-*]\s+/, "")} />
            </li>
          );
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          return (
            <li key={index} className="ml-4 list-decimal text-slate-700">
              <InlineBold text={trimmed.replace(/^\d+\.\s+/, "")} />
            </li>
          );
        }
        if (trimmed === "") {
          return <div key={index} className="h-1" />;
        }

        return (
          <p key={index} className="text-slate-800">
            <InlineBold text={line} />
          </p>
        );
      })}
    </div>
  );
}

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
