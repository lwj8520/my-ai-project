"use client";

import React from "react";
import { Heart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 border-b border-rose-100/60 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base md:text-lg">
            웨딩 플래너
          </span>
        </div>
        <div className="text-xs text-rose-500 font-medium px-2.5 py-1 bg-rose-50 rounded-full border border-rose-100">
          D-Day & 체크리스트
        </div>
      </div>
    </header>
  );
}
