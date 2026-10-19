"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { WeddingMemo, MemoCreate } from "@/types";
import { getTodayKSTString } from "@/lib/date";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { Eye, Edit3, Tag, Plus, Check } from "lucide-react";

const DEFAULT_RECOMMENDED_TAGS = [
  "예식장",
  "스드메",
  "드레스투어",
  "신혼여행",
  "예물/예단",
  "혼수/신혼집",
  "청첩장",
  "견적비교",
];

interface MemoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMemo?: WeddingMemo | null;
  existingTags?: string[];
  onSubmit: (data: MemoCreate) => Promise<any>;
  isLoading: boolean;
}

export function MemoFormModal({
  isOpen,
  onClose,
  initialMemo,
  existingTags = [],
  onSubmit,
  isLoading,
}: MemoFormModalProps) {
  const [title, setTitle] = useState("");
  const [memoDate, setMemoDate] = useState(getTodayKSTString());
  const [tagInput, setTagInput] = useState("");
  const [groomContent, setGroomContent] = useState("");
  const [brideContent, setBrideContent] = useState("");
  const [previewGroom, setPreviewGroom] = useState(false);
  const [previewBride, setPreviewBride] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; memoDate?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialMemo) {
        setTitle(initialMemo.title);
        setMemoDate(initialMemo.memo_date);
        setTagInput(initialMemo.tags.join(", "));
        setGroomContent(initialMemo.groom_content || "");
        setBrideContent(initialMemo.bride_content || "");
      } else {
        setTitle("");
        setMemoDate(getTodayKSTString());
        setTagInput("");
        setGroomContent("");
        setBrideContent("");
      }
      setPreviewGroom(false);
      setPreviewBride(false);
      setErrors({});
    }
  }, [isOpen, initialMemo]);

  // 현재 입력된 태그 파싱
  const currentTags = tagInput
    .split(",")
    .map((t) => t.trim().replace(/^#+/, ""))
    .filter(Boolean);

  // 추천 후보 태그 목록 (기본 추천 + 기존 등록된 태그들의 합집합)
  const candidateTags = Array.from(
    new Set([...DEFAULT_RECOMMENDED_TAGS, ...existingTags])
  );

  // 태그 칩 클릭 토글
  const handleToggleTag = (tag: string) => {
    const isAlreadySelected = currentTags.includes(tag);
    let nextTags: string[];

    if (isAlreadySelected) {
      nextTags = currentTags.filter((t) => t !== tag);
    } else {
      nextTags = [...currentTags, tag];
    }

    setTagInput(nextTags.join(", "));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const newErrors: { title?: string; memoDate?: string } = {};

    if (!trimmedTitle) {
      newErrors.title = "제목을 입력해 주세요.";
    }
    if (!memoDate) {
      newErrors.memoDate = "날짜를 선택해 주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        memo_date: memoDate,
        tags: currentTags,
        groom_content: groomContent.trim() ? groomContent : null,
        bride_content: brideContent.trim() ? brideContent : null,
      });
      onClose();
    } catch {
      // toast is fired in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialMemo ? "웨딩 메모 수정" : "새 웨딩 메모 작성"}
      description="신랑과 신부의 소중한 생각과 정보를 자유롭게 기록해 보세요 (툴바로 간편하게 서식 지정)."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* 날짜 & 제목 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="memo-date"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              날짜 <span className="text-rose-500">*</span>
            </label>
            <input
              id="memo-date"
              type="date"
              value={memoDate}
              onChange={(e) => setMemoDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              required
            />
            {errors.memoDate && (
              <p className="text-xs text-red-500 mt-1">{errors.memoDate}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="memo-title"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              제목 <span className="text-rose-500">*</span>
            </label>
            <input
              id="memo-title"
              type="text"
              placeholder="예: 강남 아펠가모 투어 솔직 후기"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              maxLength={150}
              className={`w-full px-3 py-2 rounded-xl border text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                errors.title ? "border-red-400" : "border-gray-200"
              }`}
              required
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
        </div>

        {/* 태그 입력 및 후보 태그 칩 */}
        <div className="space-y-1.5">
          <label
            htmlFor="memo-tags"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            태그 (쉼표로 구분하거나 아래 후보를 클릭하세요)
          </label>
          <input
            id="memo-tags"
            type="text"
            placeholder="직접 입력하거나 아래 추천 태그를 눌러보세요"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          {/* 태그 후보 칩 목록 */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" /> 추천 태그:
            </span>
            {candidateTags.map((tag) => {
              const isSelected = currentTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                    isSelected
                      ? "bg-rose-500 text-white font-semibold shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border border-gray-200/60"
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <Plus className="w-2.5 h-2.5" />
                  )}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 신랑 메모 작성 영역 (MarkdownEditor 장착) */}
        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
              <span className="text-base">🤵</span> 신랑 메모
              <span className="text-[11px] font-normal text-sky-600">
                (툴바를 눌러 서식을 쉽게 넣어보세요)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setPreviewGroom(!previewGroom)}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-sky-100 transition cursor-pointer"
            >
              {previewGroom ? (
                <>
                  <Edit3 className="w-3 h-3" /> 편집 모드
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" /> 미리보기
                </>
              )}
            </button>
          </div>

          {previewGroom ? (
            <div className="min-h-[140px] p-3.5 rounded-xl bg-white border border-sky-200">
              {groomContent.trim() ? (
                <MarkdownRenderer content={groomContent} />
              ) : (
                <p className="text-gray-400 text-xs italic py-2">
                  작성된 신랑 메모가 없습니다.
                </p>
              )}
            </div>
          ) : (
            <MarkdownEditor
              value={groomContent}
              onChange={setGroomContent}
              placeholder="신랑 의견: 예) 주차 편리함, 식대 65,000원선 확인. 보증인원 250명 가능."
              rows={5}
              accentColor="sky"
            />
          )}
        </div>

        {/* 신부 메모 작성 영역 (MarkdownEditor 장착) */}
        <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
              <span className="text-base">👰</span> 신부 메모
              <span className="text-[11px] font-normal text-pink-600">
                (툴바를 눌러 서식을 쉽게 넣어보세요)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setPreviewBride(!previewBride)}
              className="text-xs font-semibold text-pink-700 hover:text-pink-900 inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-pink-100 transition cursor-pointer"
            >
              {previewBride ? (
                <>
                  <Edit3 className="w-3 h-3" /> 편집 모드
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" /> 미리보기
                </>
              )}
            </button>
          </div>

          {previewBride ? (
            <div className="min-h-[140px] p-3.5 rounded-xl bg-white border border-pink-200">
              {brideContent.trim() ? (
                <MarkdownRenderer content={brideContent} />
              ) : (
                <p className="text-gray-400 text-xs italic py-2">
                  작성된 신부 메모가 없습니다.
                </p>
              )}
            </div>
          ) : (
            <MarkdownEditor
              value={brideContent}
              onChange={setBrideContent}
              placeholder="신부 의견: 예) 신부대기실이 넓고 생화 향이 좋았음! 당일 계약 혜택 확인 필요."
              rows={5}
              accentColor="pink"
            />
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
          >
            {initialMemo ? "수정 완료" : "메모 저장"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
