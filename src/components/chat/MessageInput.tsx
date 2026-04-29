"use client";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

const MAX_CHARS = 2000;

interface MessageInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > MAX_CHARS * 0.85;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && !isOverLimit) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative p-4 bg-white border-t border-neutral-200/60">
      <div className="relative max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the React component you want to create..."
          disabled={isLoading}
          className={`w-full min-h-[80px] max-h-[200px] pl-4 pr-14 py-3.5 rounded-xl border bg-neutral-50/50 text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder:text-neutral-400 text-[15px] font-normal shadow-sm ${
            isOverLimit
              ? "border-red-400 focus:ring-red-500/10 focus:border-red-500/50"
              : "border-neutral-200 focus:ring-blue-500/10 focus:border-blue-500/50"
          }`}
          rows={3}
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim() || isOverLimit}
          className="absolute right-3 bottom-3 p-2.5 rounded-lg transition-all hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent group"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <Send
              className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                !input.trim() || isOverLimit ? "text-neutral-300" : "text-blue-600"
              }`}
            />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between max-w-4xl mx-auto mt-2 px-1">
        <span className="text-xs text-neutral-400">
          {isLoading ? "Generating response…" : "↵ Enter to send · Shift+Enter for new line"}
        </span>
        <span
          className={`text-xs tabular-nums transition-colors ${
            isOverLimit
              ? "text-red-500 font-medium"
              : isNearLimit
              ? "text-amber-500"
              : "text-neutral-400"
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>
    </form>
  );
}
