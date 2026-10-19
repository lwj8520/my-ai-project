"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { ClipboardList, Plus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  isFiltered?: boolean;
  onAddNew: () => void;
  onSeed?: () => void;
  isSeeding?: boolean;
}

export function EmptyState({
  isFiltered = false,
  onAddNew,
  onSeed,
  isSeeding = false,
}: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="rounded-2xl bg-white/80 border border-dashed border-gray-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
          <ClipboardList className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            조건에 맞는 항목이 없어요
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            필터 조건을 변경하거나 새 항목을 추가해 보세요.
          </p>
        </div>
        <Button
          onClick={onAddNew}
          variant="outline"
          size="sm"
          className="mx-auto"
        >
          <Plus className="w-4 h-4 mr-1" />
          항목 추가
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-rose-100 p-8 md:p-10 text-center space-y-4 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-500 shadow-xs">
        <Sparkles className="w-7 h-7 stroke-[1.8]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base md:text-lg font-bold text-gray-900">
          아직 등록된 체크리스트가 없어요
        </h3>
        <p className="text-xs md:text-sm text-gray-500 max-w-sm mx-auto">
          예비 부부를 위해 준비된 필수 체크리스트 20종을 한 번에 불러오거나 직접
          원하는 항목을 추가할 수 있어요.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        {onSeed && (
          <Button
            onClick={onSeed}
            variant="primary"
            size="md"
            isLoading={isSeeding}
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            기본 체크리스트 불러오기
          </Button>
        )}
        <Button
          onClick={onAddNew}
          variant="outline"
          size="md"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          직접 추가하기
        </Button>
      </div>
    </div>
  );
}
