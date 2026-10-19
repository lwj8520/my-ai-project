"use client";

import React, { useState } from "react";
import { Category, ChecklistItem as ChecklistItemType } from "@/types";
import { CATEGORY_INFO } from "@/lib/constants";
import { ChecklistItem } from "./ChecklistItem";
import { ChevronDown, Plus } from "lucide-react";

interface ChecklistSectionProps {
  category: Category;
  items: ChecklistItemType[];
  onToggle: (id: number, nextStatus: boolean) => void;
  onEdit: (item: ChecklistItemType) => void;
  onDelete: (id: number) => void;
  onAddInThisCategory: (category: Category) => void;
}

export function ChecklistSection({
  category,
  items,
  onToggle,
  onEdit,
  onDelete,
  onAddInThisCategory,
}: ChecklistSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const info = CATEGORY_INFO[category];

  const total = items.length;
  const completed = items.filter((i) => i.is_completed).length;

  return (
    <div className="rounded-2xl bg-white shadow-xs border border-gray-100 overflow-hidden transition-all">
      <div className="flex items-center justify-between p-4 bg-gray-50/40 border-b border-gray-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.badge}`}
          >
            {info.label}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {completed}/{total}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <button
          onClick={() => onAddInThisCategory(category)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50/80 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">추가</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              해당 카테고리에 할 일이 없습니다.
            </p>
          ) : (
            items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
