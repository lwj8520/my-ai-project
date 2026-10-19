"use client";

import React from "react";

interface ProgressBarProps {
  progress: number; // 0 ~ 100
  height?: string;
  className?: string;
  color?: string;
}

export function ProgressBar({
  progress,
  height = "h-2.5",
  className = "",
  color = "bg-gradient-to-r from-rose-400 to-pink-500",
}: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(safeProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="진행률"
      className={`w-full bg-rose-100/60 rounded-full overflow-hidden ${height} ${className}`}
    >
      <div
        className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}
