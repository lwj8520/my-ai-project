"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DDayBanner } from "@/components/dday/DDayBanner";
import { ProgressSummary } from "@/components/checklist/ProgressSummary";
import { CategoryTabs } from "@/components/checklist/CategoryTabs";
import { FilterBar, StatusFilter } from "@/components/checklist/FilterBar";
import { ChecklistBoard } from "@/components/checklist/ChecklistBoard";
import { MemoList } from "@/components/memo/MemoList";
import { Category } from "@/types";
import { CheckSquare, BookOpen, Plus } from "lucide-react";

type MainView = "CHECKLIST" | "MEMO";

export default function Home() {
  const [currentView, setCurrentView] = useState<MainView>("CHECKLIST");

  // 체크리스트 상태
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isAddChecklistOpen, setIsAddChecklistOpen] = useState(false);
  const [defaultAddCategory, setDefaultAddCategory] = useState<Category>("VENUE");

  const handleOpenAddChecklist = (category?: Category) => {
    if (category) {
      setDefaultAddCategory(category);
    } else if (selectedCategory !== "ALL") {
      setDefaultAddCategory(selectedCategory);
    } else {
      setDefaultAddCategory("VENUE");
    }
    setIsAddChecklistOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 상단 D-Day 배너 (모든 탭 공통) */}
        <section aria-label="D-Day 카운터">
          <DDayBanner />
        </section>

        {/* 메인 뷰 탭 전환 바 (체크리스트 vs 우리들의 메모장) */}
        <div className="flex items-center p-1.5 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <button
            onClick={() => setCurrentView("CHECKLIST")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              currentView === "CHECKLIST"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>체크리스트</span>
          </button>
          <button
            onClick={() => setCurrentView("MEMO")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              currentView === "MEMO"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>신랑 & 신부 메모장</span>
          </button>
        </div>

        {/* 1. 체크리스트 뷰 */}
        {currentView === "CHECKLIST" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 진행률 요약 */}
            <section aria-label="체크리스트 진행률">
              <ProgressSummary />
            </section>

            {/* 체크리스트 관리 */}
            <section aria-label="체크리스트 목록" className="space-y-4">
              <div className="space-y-2">
                <CategoryTabs
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
                <FilterBar
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  onAddNew={() => handleOpenAddChecklist()}
                />
              </div>

              <ChecklistBoard
                selectedCategory={selectedCategory}
                statusFilter={statusFilter}
                isAddModalOpen={isAddChecklistOpen}
                onCloseAddModal={() => setIsAddChecklistOpen(false)}
                defaultAddCategory={defaultAddCategory}
                onOpenAddModal={handleOpenAddChecklist}
              />
            </section>
          </div>
        )}

        {/* 2. 신랑 & 신부 메모장 뷰 */}
        {currentView === "MEMO" && (
          <section
            aria-label="신랑 & 신부 메모 목록"
            className="animate-in fade-in duration-150"
          >
            <MemoList />
          </section>
        )}
      </main>

      {/* 모바일 플로팅 액션 버튼 (체크리스트 탭에서 열기) */}
      {currentView === "CHECKLIST" && (
        <button
          onClick={() => handleOpenAddChecklist()}
          className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xl shadow-rose-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-300"
          aria-label="새 체크리스트 항목 추가"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
