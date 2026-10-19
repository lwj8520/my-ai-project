"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KEYS } from "@/lib/queryKeys";
import { WeddingMemo, MemoCreate, MemoUpdate } from "@/types";
import { useToast } from "@/components/ui/Toast";

export function useMemos(tag?: string, q?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const queryKey = [...KEYS.memos, { tag, q }] as const;

  const query = useQuery<WeddingMemo[]>({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (tag) params.append("tag", tag);
      if (q) params.append("q", q);
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      return api.get<WeddingMemo[]>(`/memos${queryStr}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: MemoCreate) => api.post<WeddingMemo>("/memos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.memos });
      toast.success("메모가 등록되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "메모 등록에 실패했습니다.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MemoUpdate }) =>
      api.patch<WeddingMemo>(`/memos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.memos });
      toast.success("메모가 수정되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "메모 수정에 실패했습니다.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/memos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.memos });
      toast.success("메모가 삭제되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "메모 삭제에 실패했습니다.");
    },
  });

  return {
    ...query,
    createMemo: createMutation.mutateAsync,
    updateMemo: updateMutation.mutateAsync,
    deleteMemo: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
