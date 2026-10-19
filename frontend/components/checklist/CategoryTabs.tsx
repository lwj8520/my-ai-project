"use client";

import React from "react";
import { Category } from "@/types";
import { CATEGORIES, CATEGORY_INFO } from "@/lib/constants";

interface CategoryTabsProps {
  selectedCategory: Category | "ALL";
  onSelect: (category: Category | "ALL") => void;
}

export function CategoryTabs({ selectedCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 min-w-max" role="tablist">
        <button
          role="tab"
          aria-selected={selectedCategory === "ALL"}
          onClick={() => onSelect("ALL")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            selectedCategory === "ALL"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-white text-gray-600 hover:bg-rose-50/60 hover:text-rose-600 border border-gray-200/80"
          }`}
        >
          전체
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-rose-50/60 hover:text-rose-600 border border-gray-200/80"
              }`}
            >
              {CATEGORY_INFO[cat].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
