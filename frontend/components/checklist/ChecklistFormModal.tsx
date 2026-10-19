"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Category, ChecklistItem } from "@/types";
import { CATEGORIES, CATEGORY_INFO } from "@/lib/constants";

interface ChecklistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: ChecklistItem | null;
  defaultCategory?: Category;
  onSubmit: (data: {
    title: string;
    category: Category;
    due_date?: string | null;
    memo?: string | null;
  }) => Promise<any>;
  isLoading: boolean;
}

export function ChecklistFormModal({
  isOpen,
  onClose,
  initialItem,
  defaultCategory = "VENUE",
  onSubmit,
  isLoading,
}: ChecklistFormModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [dueDate, setDueDate] = useState<string>("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<{ title?: string; memo?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setTitle(initialItem.title);
        setCategory(initialItem.category);
        setDueDate(initialItem.due_date || "");
        setMemo(initialItem.memo || "");
      } else {
        setTitle("");
        setCategory(defaultCategory);
        setDueDate("");
        setMemo("");
      }
      setErrors({});
    }
  }, [isOpen, initialItem, defaultCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const newErrors: { title?: string; memo?: string } = {};

    if (!trimmedTitle) {
      newErrors.title = "제목을 입력해 주세요.";
    } else if (trimmedTitle.length > 100) {
      newErrors.title = "제목은 100자 이하여야 합니다.";
    }

    if (memo && memo.length > 500) {
      newErrors.memo = "메모는 500자 이하여야 합니다.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        category,
        due_date: dueDate ? dueDate : null,
        memo: memo.trim() ? memo.trim() : null,
      });
      onClose();
    } catch {
      // toast in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? "할 일 수정" : "새 할 일 추가"}
      description="결혼 준비에 필요한 체크리스트 항목을 입력해 주세요."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="checklist-title"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            할 일 제목 <span className="text-rose-500">*</span>
          </label>
          <input
            id="checklist-title"
            type="text"
            placeholder="예: 웨딩홀 투어 예약하기"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            maxLength={100}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition ${
              errors.title ? "border-red-400" : "border-gray-200"
            }`}
            required
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="checklist-category"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            카테고리 <span className="text-rose-500">*</span>
          </label>
          <select
            id="checklist-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_INFO[cat].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="checklist-due-date"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            마감일 (선택)
          </label>
          <input
            id="checklist-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition"
          />
        </div>

        <div>
          <label
            htmlFor="checklist-memo"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            메모 (선택)
          </label>
          <textarea
            id="checklist-memo"
            rows={3}
            placeholder="예: 예산 한도 3,000만원, 토요일 점심 예식 위주로 확인"
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
              setErrors((prev) => ({ ...prev, memo: undefined }));
            }}
            maxLength={500}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition ${
              errors.memo ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.memo && (
            <p className="text-xs text-red-500 mt-1">{errors.memo}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
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
            {initialItem ? "저장" : "추가"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
