"use client";

import React, { useState } from "react";
import { useDDay } from "@/hooks/useDDay";
import { WeddingDateModal } from "./WeddingDateModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/date";
import { Calendar, Sparkles, Heart } from "lucide-react";

export function DDayBanner() {
  const {
    data: ddayData,
    isLoading,
    updateWeddingDate,
    deleteWeddingDate,
    isUpdating,
    isDeleting,
  } = useDDay();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-44 rounded-3xl bg-white/70 p-6 shadow-sm border border-rose-100 flex flex-col items-center justify-center gap-3">
        <Skeleton className="w-40 h-8 rounded-full" />
        <Skeleton className="w-56 h-12 rounded-xl" />
        <Skeleton className="w-32 h-6 rounded-lg" />
      </div>
    );
  }

  const isNotSet = !ddayData || ddayData.status === "NOT_SET" || !ddayData.wedding_date;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 text-white p-7 md:p-8 text-center shadow-lg shadow-rose-200/50 transition-all">
        {/* 은은한 배경 데코 */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 rounded-full bg-pink-300/20 blur-xl pointer-events-none" />

        {isNotSet ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-1 shadow-inner">
              <Calendar className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                결혼식 날짜를 설정해 주세요
              </h2>
              <p className="text-rose-100 text-xs md:text-sm mt-1">
                D-Day 카운트와 남은 일정을 체계적으로 관리해 드립니다.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="md"
              className="bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold border-none shadow-md mt-2"
            >
              날짜 설정하기
            </Button>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-rose-50">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(ddayData.wedding_date)}</span>
            </div>

            <div className="py-1">
              {ddayData.status === "TODAY" ? (
                <div className="flex items-center gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xs">
                    D-Day
                  </span>
                  <span className="text-4xl animate-bounce">🎉</span>
                </div>
              ) : (
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xs">
                  {ddayData.label}
                </h1>
              )}
            </div>

            <p className="text-xs md:text-sm text-rose-100 font-medium">
              {ddayData.status === "UPCOMING" && "소중한 그 날까지 차근차근 준비해 보아요 ✨"}
              {ddayData.status === "TODAY" && "오늘 세상에서 가장 행복한 주인공이 되세요! 💍"}
              {ddayData.status === "PASSED" && "행복한 결혼 생활을 진심으로 축하합니다 💐"}
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs text-rose-100 hover:text-white underline underline-offset-4 transition font-medium cursor-pointer"
            >
              날짜 변경
            </button>
          </div>
        )}
      </div>

      <WeddingDateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentDate={ddayData?.wedding_date || null}
        onSave={(newDate) => updateWeddingDate({ wedding_date: newDate })}
        onClear={() => deleteWeddingDate()}
        isSaving={isUpdating}
        isDeleting={isDeleting}
      />
    </>
  );
}
