"use client";

import React from "react";
import { WeddingMemo } from "@/types";
import { formatDate } from "@/lib/date";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Calendar, Tag, Edit2, Trash2 } from "lucide-react";

export type MemoViewMode = "BOTH" | "GROOM" | "BRIDE";

interface MemoCardProps {
  memo: WeddingMemo;
  viewMode: MemoViewMode;
  onEdit: (memo: WeddingMemo) => void;
  onDelete: (id: number) => void;
  onSelectTag?: (tag: string) => void;
}

export function MemoCard({
  memo,
  viewMode,
  onEdit,
  onDelete,
  onSelectTag,
}: MemoCardProps) {
  const hasGroom = Boolean(memo.groom_content?.trim());
  const hasBride = Boolean(memo.bride_content?.trim());

  const showGroom = (viewMode === "BOTH" || viewMode === "GROOM");
  const showBride = (viewMode === "BOTH" || viewMode === "BRIDE");

  // 좌우 2열 그리드 조건: 둘 다 보여주는 모드일 때
  const isBothView = viewMode === "BOTH";

  return (
    <article className="rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* 카드 헤더 */}
      <div className="p-4 md:p-5 border-b border-gray-50 bg-gray-50/40">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                <Calendar className="w-3 h-3" />
                {formatDate(memo.memo_date)}
              </span>

              {memo.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag && onSelectTag(tag)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-500 bg-white border border-gray-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 px-2 py-0.5 rounded-md transition cursor-pointer"
                >
                  <Tag className="w-2.5 h-2.5" />#{tag}
                </button>
              ))}
            </div>

            <h3 className="text-base md:text-lg font-bold text-gray-900 break-words">
              {memo.title}
            </h3>
          </div>

          {/* 수정 / 삭제 버튼 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(memo)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              aria-label="메모 수정"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(memo.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              aria-label="메모 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 카드 본문: 좌우 배치 그리드 */}
      <div className="p-4 md:p-5">
        <div
          className={`grid gap-4 ${
            isBothView ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* 좌측: 신랑 이야기 */}
          {showGroom && (
            <div
              className={`flex flex-col rounded-xl border p-4 transition-all ${
                hasGroom
                  ? "bg-sky-50/40 border-sky-100/90 text-sky-950"
                  : "bg-gray-50/40 border-dashed border-gray-200 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-sky-100">
                <span className="text-lg">🤵</span>
                <span className="text-xs font-bold text-sky-800 tracking-wide">
                  신랑의 한마디
                </span>
              </div>
              <div className="flex-1">
                {hasGroom ? (
                  <MarkdownRenderer content={memo.groom_content || ""} />
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">
                    아직 신랑이 작성한 내용이 없어요.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 우측: 신부 이야기 */}
          {showBride && (
            <div
              className={`flex flex-col rounded-xl border p-4 transition-all ${
                hasBride
                  ? "bg-pink-50/40 border-pink-100/90 text-pink-950"
                  : "bg-gray-50/40 border-dashed border-gray-200 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-pink-100">
                <span className="text-lg">👰</span>
                <span className="text-xs font-bold text-pink-800 tracking-wide">
                  신부의 한마디
                </span>
              </div>
              <div className="flex-1">
                {hasBride ? (
                  <MarkdownRenderer content={memo.bride_content || ""} />
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">
                    아직 신부가 작성한 내용이 없어요.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
