export type Category =
  | "VENUE"
  | "SDM"
  | "HONEYMOON"
  | "GIFT"
  | "HOME"
  | "INVITATION"
  | "ETC";

export type DDayStatus = "NOT_SET" | "UPCOMING" | "TODAY" | "PASSED";

export interface DDayResponse {
  wedding_date: string | null;
  d_day: number | null;
  label: string | null;
  status: DDayStatus;
  updated_at: string | null;
}

export interface WeddingDateUpdate {
  wedding_date: string;
}

export interface ChecklistItem {
  id: number;
  title: string;
  category: Category;
  due_date: string | null;
  memo: string | null;
  is_completed: boolean;
  completed_at: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItemCreate {
  title: string;
  category: Category;
  due_date?: string | null;
  memo?: string | null;
}

export interface ChecklistItemUpdate {
  title?: string;
  category?: Category;
  due_date?: string | null;
  memo?: string | null;
  is_completed?: boolean;
}

export interface CategoryProgress {
  category: Category;
  label: string;
  total: number;
  completed: number;
  progress_rate: number;
}

export interface ChecklistSummaryResponse {
  total: number;
  completed: number;
  progress_rate: number;
  by_category: CategoryProgress[];
}

export interface ApiError {
  code: string;
  message: string;
}

export interface WeddingMemo {
  id: number;
  title: string;
  memo_date: string;
  tags: string[];
  groom_content: string | null;
  bride_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoCreate {
  title: string;
  memo_date: string;
  tags?: string[];
  groom_content?: string | null;
  bride_content?: string | null;
}

export interface MemoUpdate {
  title?: string;
  memo_date?: string;
  tags?: string[];
  groom_content?: string | null;
  bride_content?: string | null;
}
