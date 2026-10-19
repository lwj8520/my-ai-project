"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export type StatusFilter = "ALL" | "INCOMPLETE" | "COMPLETED";

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  onAddNew: () => void;
}

export function FilterBar({
  statusFilter,
  onStatusChange,
  onAddNew,
}: FilterBarProps) {
  const options: { value: StatusFilter; label: string }[] = [
    { value: "ALL", label: "전체" },
    { value: "INCOMPLETE", label: "미완료" },
    { value: "COMPLETED", label: "완료" },
  ];

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <div className="inline-flex p-1 bg-gray-100/80 rounded-xl">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === opt.value
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Button
        onClick={onAddNew}
        variant="primary"
        size="sm"
        className="font-semibold shadow-xs"
      >
        <Plus className="w-4 h-4" />
        <span>항목 추가</span>
      </Button>
    </div>
  );
}
