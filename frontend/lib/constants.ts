import { Category } from "@/types";

export const CATEGORIES: Category[] = [
  "VENUE",
  "SDM",
  "HONEYMOON",
  "GIFT",
  "HOME",
  "INVITATION",
  "ETC",
];

export const CATEGORY_INFO: Record<
  Category,
  { label: string; bg: string; text: string; border: string; badge: string; icon: string }
> = {
  VENUE: {
    label: "예식장",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "Building2",
  },
  SDM: {
    label: "스드메",
    bg: "bg-pink-50",
    text: "text-pink-800",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    icon: "Sparkles",
  },
  HONEYMOON: {
    label: "신혼여행",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    badge: "bg-sky-100 text-sky-700",
    icon: "Plane",
  },
  GIFT: {
    label: "예물/예단",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    icon: "Gift",
  },
  HOME: {
    label: "혼수/신혼집",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "Home",
  },
  INVITATION: {
    label: "청첩장/하객",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    icon: "Mail",
  },
  ETC: {
    label: "기타",
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    icon: "MoreHorizontal",
  },
};
