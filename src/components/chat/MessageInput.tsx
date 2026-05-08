"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useState } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { PromptValidator, type ValidationResult } from "@/lib/promptValidator";

const validator = new PromptValidator({ maxChars: 2000, warnAtPercent: 85 });

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
  const [validation, setValidation] = useState<ValidationResult>({
    valid: true,
    errors: [],
    warnings: [],
    charCount: 0,
    estimatedTokens: 0,
  });

  useEffect(() => {
    setValidation(validator.validate(input));
  }, [input]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!validation.valid || isLoading) return;
        const form = e.currentTarget.form;
        form?.requestSubmit();
      }
    },
    [validation.valid, isLoading]
  );

  const hasError = validation.errors.length > 0;
  const hasWarning = validation.warnings.length > 0;
  const isDisabled = isLoading || hasError || !input.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="relative p-4 bg-white border-t border-neutral-200/60"
      data-testid="message-form"
    >
      <div className="relative max-w-4xl mx-auto">
        <textarea
          data-testid="message-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the React component you want to create..."
          disabled={isLoading}
          aria-label="Message input"
          aria-invalid={hasError}
          aria-describedby="input-footer"
          className={`w-full min-h-[80px] max-h-[200px] pl-4 pr-14 py-3.5 rounded-xl border bg-neutral-50/50 text-neutral-900 resize-none focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder:text-neutral-400 text-[15px] font-normal shadow-sm ${
            hasError
              ? "border-red-400 focus:ring-red-500/10 focus:border-red-500/50"
              : hasWarning
              ? "border-amber-300 focus:ring-amber-400/10 focus:border-amber-400/50"
              : "border-neutral-200 focus:ring-blue-500/10 focus:border-blue-500/50"
          }`}
          rows={3}
        />

        <button
          data-testid="send-button"
          type="submit"
          disabled={isDisabled}
          aria-label={isLoading ? "Sending…" : "Send message"}
          className="absolute right-3 bottom-3 p-2.5 rounded-lg transition-all hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent group"
        >
          {isLoading ? (
            <Loader2
              data-testid="send-spinner"
              className="h-4 w-4 text-blue-600 animate-spin"
            />
          ) : (
            <Send
              data-testid="send-icon"
              className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isDisabled ? "text-neutral-300" : "text-blue-600"
              }`}
            />
          )}
        </button>
      </div>

      <div
        id="input-footer"
        className="flex items-center justify-between max-w-4xl mx-auto mt-2 px-1"
      >
        <span className="text-xs text-neutral-400">
          {isLoading
            ? "Generating response…"
            : hasError
            ? ""
            : "↵ Enter to send · Shift+Enter for new line"}
        </span>

        <div className="flex items-center gap-2">
          {hasError && (
            <span
              data-testid="validation-error"
              className="flex items-center gap-1 text-xs text-red-500"
            >
              <AlertCircle className="h-3 w-3" />
              {validation.errors[0]}
            </span>
          )}
          {!hasError && hasWarning && (
            <span
              data-testid="validation-warning"
              className="text-xs text-amber-500"
            >
              {validation.warnings[0]}
            </span>
          )}
          <span
            data-testid="char-counter"
            className={`text-xs tabular-nums transition-colors ${
              hasError
                ? "text-red-500 font-medium"
                : hasWarning
                ? "text-amber-500"
                : "text-neutral-400"
            }`}
          >
            {validation.charCount}/2000
          </span>
        </div>
      </div>
    </form>
  );
}
