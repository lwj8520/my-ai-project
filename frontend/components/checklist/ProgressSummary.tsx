"use client";

import React from "react";
import { useChecklistSummary } from "@/hooks/useChecklistSummary";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { CheckCircle2 } from "lucide-react";

export function ProgressSummary() {
  const { data: summary, isLoading } = useChecklistSummary();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-xs border border-rose-100/80 space-y-3">
        <Skeleton className="w-28 h-5" />
        <Skeleton className="w-full h-3" />
      </div>
    );
  }

  if (!summary || summary.total === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs border border-rose-100/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 text-rose-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-gray-900">전체 준비 진행률</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-rose-600">
            {summary.progress_rate}%
          </span>
          <span className="text-xs text-gray-400 font-medium">
            ({summary.completed}/{summary.total})
          </span>
        </div>
      </div>

      <ProgressBar progress={summary.progress_rate} height="h-3" />
    </div>
  );
}
