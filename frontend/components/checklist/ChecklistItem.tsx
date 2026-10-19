"use client";

import React from "react";
import { ChecklistItem as ChecklistItemType } from "@/types";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatShortDate } from "@/lib/date";
import { Calendar, MoreVertical, Edit2, Trash2 } from "lucide-react";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: number, nextStatus: boolean) => void;
  onEdit: (item: ChecklistItemType) => void;
  onDelete: (id: number) => void;
}

export function ChecklistItem({
  item,
  onToggle,
  onEdit,
  onDelete,
}: ChecklistItemProps) {
  return (
    <div
      className={`group flex items-start justify-between p-3.5 rounded-xl border transition-all duration-150 ${
        item.is_completed
          ? "bg-gray-50/60 border-gray-100/80"
          : "bg-white border-gray-100 hover:border-rose-200/80 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
        <div className="pt-0.5 flex-shrink-0">
          <Checkbox
            id={`chk-${item.id}`}
            checked={item.is_completed}
            onChange={(checked) => onToggle(item.id, checked)}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <label
            htmlFor={`chk-${item.id}`}
            className={`text-sm font-medium leading-snug cursor-pointer select-none break-all transition-all ${
              item.is_completed
                ? "line-through text-gray-400"
                : "text-gray-800 group-hover:text-gray-900"
            }`}
          >
            {item.title}
          </label>

          {item.memo && (
            <p
              className={`text-xs break-all ${
                item.is_completed ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {item.memo}
            </p>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            {item.due_date && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  item.is_completed
                    ? "text-gray-300"
                    : item.is_overdue
                    ? "text-red-500 font-semibold"
                    : "text-gray-400"
                }`}
              >
                <Calendar className="w-3 h-3" />
                {formatShortDate(item.due_date)}
              </span>
            )}

            {item.is_overdue && !item.is_completed && (
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
                기한 초과
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          aria-label="항목 수정"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
          aria-label="항목 삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
