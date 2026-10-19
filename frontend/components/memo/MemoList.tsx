"use client";

import React, { useState } from "react";
import { useMemos } from "@/hooks/useMemos";
import { WeddingMemo, MemoCreate } from "@/types";
import { MemoCard, MemoViewMode } from "./MemoCard";
import { MemoFormModal } from "./MemoFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Plus, Search, BookOpen, Sparkles, X, Users, User } from "lucide-react";

export function MemoList() {
  const [viewMode, setViewMode] = useState<MemoViewMode>("BOTH");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<WeddingMemo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: memos,
    isLoading,
    createMemo,
    updateMemo,
    deleteMemo,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMemos(selectedTag, debouncedSearch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchKeyword.trim());
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    setDebouncedSearch("");
  };

  // 모든 등록된 태그 수집
  const allTags = Array.from(
    new Set((memos || []).flatMap((m) => m.tags))
  );

  return (
    <div className="space-y-4">
      {/* 1. 상단 컨트롤 바 (검색창 + 메모 작성 버튼) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="제목, 신랑·신부 메모 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs md:text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-xs"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="md"
          className="font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          메모 작성
        </Button>
      </div>

      {/* 2. 전역 보기 모드 스위치 (함께 보기 / 신랑 이야기만 / 신부 이야기만) */}
      <div className="flex items-center justify-between p-1.5 bg-gray-100/90 rounded-2xl gap-1">
        <button
          onClick={() => setViewMode("BOTH")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === "BOTH"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>함께 보기 (좌우 배치)</span>
        </button>

        <button
          onClick={() => setViewMode("GROOM")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === "GROOM"
              ? "bg-sky-600 text-white shadow-xs"
              : "text-sky-800 hover:bg-sky-50"
          }`}
        >
          <span>🤵 신랑 이야기만</span>
        </button>

        <button
          onClick={() => setViewMode("BRIDE")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === "BRIDE"
              ? "bg-rose-500 text-white shadow-xs"
              : "text-rose-800 hover:bg-pink-50"
          }`}
        >
          <span>👰 신부 이야기만</span>
        </button>
      </div>

      {/* 3. 활성 태그 필터 바 */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0 mr-1">
            태그 필터:
          </span>
          <button
            onClick={() => setSelectedTag(undefined)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              selectedTag === undefined
                ? "bg-rose-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            전체
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTag(selectedTag === tag ? undefined : tag)
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedTag === tag
                  ? "bg-rose-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 4. 메모 카드 목록 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-white p-5 border border-gray-100 space-y-3"
            >
              <Skeleton className="w-32 h-6 rounded-full" />
              <Skeleton className="w-48 h-7 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="w-full h-24 rounded-xl" />
                <Skeleton className="w-full h-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : !memos || memos.length === 0 ? (
        <div className="rounded-3xl bg-white border border-rose-100 p-8 md:p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-500 shadow-xs">
            <BookOpen className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900">
              {debouncedSearch || selectedTag
                ? "조건에 맞는 메모가 없어요"
                : "우리만의 첫 웨딩 메모를 남겨보세요!"}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 max-w-sm mx-auto mt-1">
              {debouncedSearch || selectedTag
                ? "검색어 또는 태그 필터를 해제해 보세요."
                : "웨딩홀 투어, 스드메 상담, 예산 회의 등 신랑과 신부의 생각을 함께 기록하고 공유할 수 있어요."}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="md"
            className="mx-auto"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />새 메모 작성하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {memos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              viewMode={viewMode}
              onEdit={(m) => setEditingMemo(m)}
              onDelete={(id) => setDeletingId(id)}
              onSelectTag={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}

      {/* 작성 모달 (기존 태그 후보 전달) */}
      <MemoFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        existingTags={allTags}
        onSubmit={async (data) => {
          await createMemo(data);
        }}
        isLoading={isCreating}
      />

      {/* 수정 모달 (기존 태그 후보 전달) */}
      <MemoFormModal
        isOpen={!!editingMemo}
        onClose={() => setEditingMemo(null)}
        initialMemo={editingMemo}
        existingTags={allTags}
        onSubmit={async (data) => {
          if (editingMemo) {
            await updateMemo({ id: editingMemo.id, data });
          }
        }}
        isLoading={isUpdating}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="메모 삭제"
        message="이 웨딩 메모를 삭제하시겠습니까? 작성된 신랑과 신부의 소중한 기록이 영구 삭제됩니다."
        confirmText="삭제"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={async () => {
          if (deletingId !== null) {
            await deleteMemo(deletingId);
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
}
