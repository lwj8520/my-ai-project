"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getTodayKSTString } from "@/lib/date";
import { AlertCircle, Calendar } from "lucide-react";

interface WeddingDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string | null;
  onSave: (date: string) => Promise<any>;
  onClear?: () => Promise<any>;
  isSaving: boolean;
  isDeleting?: boolean;
}

export function WeddingDateModal({
  isOpen,
  onClose,
  currentDate,
  onSave,
  onClear,
  isSaving,
  isDeleting = false,
}: WeddingDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPastDate, setIsPastDate] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentDate || "");
      setError(null);
      setIsPastDate(false);
    }
  }, [isOpen, currentDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    setError(null);

    if (val) {
      const today = getTodayKSTString();
      setIsPastDate(val < today);
    } else {
      setIsPastDate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("결혼식 날짜를 선택해 주세요.");
      return;
    }

    try {
      await onSave(selectedDate);
      onClose();
    } catch {
      // toast is already fired in hook
    }
  };

  const handleClear = async () => {
    if (onClear) {
      try {
        await onClear();
        onClose();
      } catch {}
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentDate ? "결혼식 날짜 변경" : "결혼식 날짜 설정"}
      description="특별한 그 날까지 남은 D-Day를 자동으로 계산해 드려요."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="wedding-date-input"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            결혼식 날짜
          </label>
          <div className="relative">
            <input
              id="wedding-date-input"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition ${
                error ? "border-red-400" : "border-gray-200"
              }`}
              required
            />
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {isPastDate && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">선택하신 날짜가 이미 지났습니다.</p>
              <p className="text-amber-700 mt-0.5">
                과거 날짜를 설정하면 경과일(D+n)로 표시됩니다. 계속 진행하시겠습니까?
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {currentDate && onClear ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={isDeleting || isSaving}
              className="text-xs text-gray-400 hover:text-red-500 transition"
            >
              날짜 초기화
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving || isDeleting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={!selectedDate || isDeleting}
            >
              저장
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
