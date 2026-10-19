"use client";

import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  id: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  id,
  disabled,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`w-5 h-5 rounded-lg border transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
            checked
              ? "bg-rose-500 border-rose-500 text-white shadow-xs"
              : "border-gray-300 bg-white hover:border-gray-400 peer-focus:ring-2 peer-focus:ring-rose-300 peer-focus:ring-offset-1"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm cursor-pointer select-none ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
