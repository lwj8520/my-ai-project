"use client";

import React, { useState } from "react";
import { Category, ChecklistItem } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { useChecklists } from "@/hooks/useChecklists";
import { ChecklistSection } from "./ChecklistSection";
import { ChecklistFormModal } from "./ChecklistFormModal";
import { EmptyState } from "./EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusFilter } from "./FilterBar";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChecklistBoardProps {
  selectedCategory: Category | "ALL";
  statusFilter: StatusFilter;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  defaultAddCategory: Category;
  onOpenAddModal: (category?: Category) => void;
}

export function ChecklistBoard({
  selectedCategory,
  statusFilter,
  isAddModalOpen,
  onCloseAddModal,
  defaultAddCategory,
  onOpenAddModal,
}: ChecklistBoardProps) {
  const {
    data: allItems,
    isLoading,
    isError,
    refetch,
    toggleComplete,
    createItem,
    updateItem,
    deleteItem,
    seedItems,
    isCreating,
    isUpdating,
    isDeleting,
    isSeeding,
  } = useChecklists();

  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-2xl bg-white p-4 border border-gray-100 space-y-3"
          >
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-white border border-rose-100 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-gray-800">
          체크리스트를 불러오지 못했습니다
        </h3>
        <p className="text-xs text-gray-400">네트워크 연결 상태를 확인해 주세요.</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          다시 시도
        </Button>
      </div>
    );
  }

  const items = allItems || [];

  // 데이터가 아예 없는 경우
  if (items.length === 0) {
    return (
      <>
        <EmptyState
          onAddNew={() => onOpenAddModal()}
          onSeed={() => seedItems()}
          isSeeding={isSeeding}
        />
        <ChecklistFormModal
          isOpen={isAddModalOpen}
          onClose={onCloseAddModal}
          defaultCategory={defaultAddCategory}
          onSubmit={async (data) => {
            await createItem(data);
          }}
          isLoading={isCreating}
        />
      </>
    );
  }

  // 클라이언트 필터링
  const filteredItems = items.filter((item) => {
    // 카테고리 필터
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
      return false;
    }
    // 상태 필터
    if (statusFilter === "INCOMPLETE" && item.is_completed) {
      return false;
    }
    if (statusFilter === "COMPLETED" && !item.is_completed) {
      return false;
    }
    return true;
  });

  // 필터링 결과가 없는 경우
  if (filteredItems.length === 0) {
    return (
      <>
        <EmptyState
          isFiltered={true}
          onAddNew={() => onOpenAddModal()}
        />
        <ChecklistFormModal
          isOpen={isAddModalOpen}
          onClose={onCloseAddModal}
          defaultCategory={defaultAddCategory}
          onSubmit={async (data) => {
            await createItem(data);
          }}
          isLoading={isCreating}
        />
      </>
    );
  }

  // 섹션 분할
  const categoriesToRender: Category[] =
    selectedCategory === "ALL" ? CATEGORIES : [selectedCategory];

  return (
    <>
      <div className="space-y-4">
        {categoriesToRender.map((cat) => {
          const sectionItems = filteredItems.filter((i) => i.category === cat);
          if (sectionItems.length === 0 && selectedCategory === "ALL") {
            return null; // 전체 보기 시 빈 섹션은 숨김
          }
          return (
            <ChecklistSection
              key={cat}
              category={cat}
              items={sectionItems}
              onToggle={(id, next) => toggleComplete({ id, is_completed: next })}
              onEdit={(item) => setEditingItem(item)}
              onDelete={(id) => setDeletingId(id)}
              onAddInThisCategory={(category) => onOpenAddModal(category)}
            />
          );
        })}
      </div>

      {/* 추가 모달 */}
      <ChecklistFormModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        defaultCategory={defaultAddCategory}
        onSubmit={async (data) => {
          await createItem(data);
        }}
        isLoading={isCreating}
      />

      {/* 수정 모달 */}
      <ChecklistFormModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        initialItem={editingItem}
        onSubmit={async (data) => {
          if (editingItem) {
            await updateItem({ id: editingItem.id, data });
          }
        }}
        isLoading={isUpdating}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="할 일 삭제"
        message="이 체크리스트 항목을 삭제하시겠습니까? 삭제된 항목은 복구할 수 없습니다."
        confirmText="삭제"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={async () => {
          if (deletingId !== null) {
            await deleteItem(deletingId);
            setDeletingId(null);
          }
        }}
      />
    </>
  );
}
