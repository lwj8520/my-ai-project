"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KEYS } from "@/lib/queryKeys";
import { DDayResponse, WeddingDateUpdate } from "@/types";
import { useToast } from "@/components/ui/Toast";

export function useDDay() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const query = useQuery<DDayResponse>({
    queryKey: KEYS.dDay,
    queryFn: () => api.get<DDayResponse>("/settings/d-day"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: WeddingDateUpdate) =>
      api.put<DDayResponse>("/settings/wedding-date", data),
    onSuccess: (updated) => {
      queryClient.setQueryData(KEYS.dDay, updated);
      toast.success("결혼식 날짜가 저장되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "날짜 저장에 실패했습니다.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete("/settings/wedding-date"),
    onSuccess: () => {
      queryClient.setQueryData<DDayResponse>(KEYS.dDay, {
        wedding_date: null,
        d_day: null,
        label: null,
        status: "NOT_SET",
        updated_at: null,
      });
      toast.success("결혼식 날짜가 초기화되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "날짜 초기화에 실패했습니다.");
    },
  });

  return {
    ...query,
    updateWeddingDate: updateMutation.mutateAsync,
    deleteWeddingDate: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
