"use client";

import React, { useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  CheckSquare,
  Quote,
  Code,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  accentColor?: "sky" | "pink";
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
  className = "",
  accentColor = "sky",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSyntax = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const nextValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(nextValue);

    // 포커스 복원 및 커서 이동
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const nextValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 10);
  };

  const focusRing =
    accentColor === "pink"
      ? "focus-within:ring-2 focus-within:ring-pink-400 focus-within:border-pink-400"
      : "focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400";

  const btnHover =
    accentColor === "pink"
      ? "hover:bg-pink-100/70 text-pink-700"
      : "hover:bg-sky-100/70 text-sky-700";

  return (
    <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden transition-all shadow-xs ${focusRing} ${className}`}>
      {/* 마크다운 퀵 툴바 */}
      <div className="flex items-center gap-0.5 p-1.5 bg-gray-50/80 border-b border-gray-100 flex-wrap">
        <button
          type="button"
          onClick={() => insertLinePrefix("### ")}
          className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${btnHover}`}
          title="소제목 (H3)"
        >
          <Heading3 className="w-3.5 h-3.5" />
          <span>제목</span>
        </button>

        <div className="w-[1px] h-3.5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => insertSyntax("**", "**", "텍스트")}
          className={`p-1.5 rounded text-xs font-bold transition cursor-pointer ${btnHover}`}
          title="굵게 (Bold)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax("*", "*", "텍스트")}
          className={`p-1.5 rounded text-xs transition cursor-pointer ${btnHover}`}
          title="기울임 (Italic)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => insertLinePrefix("- ")}
          className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 ${btnHover}`}
          title="글머리 기호 목록"
        >
          <List className="w-3.5 h-3.5" />
          <span>목록</span>
        </button>

        <button
          type="button"
          onClick={() => insertLinePrefix("- [ ] ")}
          className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 ${btnHover}`}
          title="체크박스 목록"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>체크</span>
        </button>

        <button
          type="button"
          onClick={() => insertLinePrefix("> ")}
          className={`p-1.5 rounded text-xs transition cursor-pointer ${btnHover}`}
          title="인용문"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax("`", "`", "코드")}
          className={`p-1.5 rounded text-xs transition cursor-pointer font-mono ${btnHover}`}
          title="인라인 코드"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 text-xs md:text-sm text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed font-sans placeholder:text-gray-400"
      />
    </div>
  );
}
