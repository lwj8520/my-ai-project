"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KEYS } from "@/lib/queryKeys";
import {
  ChecklistItem,
  ChecklistItemCreate,
  ChecklistItemUpdate,
} from "@/types";
import { useToast } from "@/components/ui/Toast";

export function useChecklists() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const query = useQuery<ChecklistItem[]>({
    queryKey: KEYS.checklists,
    queryFn: () => api.get<ChecklistItem[]>("/checklists"),
  });

  // 토글 뮤테이션 (Optimistic UI)
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_completed }: { id: number; is_completed: boolean }) =>
      api.patch<ChecklistItem>(`/checklists/${id}`, { is_completed }),
    onMutate: async ({ id, is_completed }) => {
      await queryClient.cancelQueries({ queryKey: KEYS.checklists });

      const prevChecklists = queryClient.getQueryData<ChecklistItem[]>(
        KEYS.checklists
      );

      if (prevChecklists) {
        queryClient.setQueryData<ChecklistItem[]>(
          KEYS.checklists,
          prevChecklists.map((item) =>
            item.id === id
              ? {
                  ...item,
                  is_completed,
                  completed_at: is_completed ? new Date().toISOString() : null,
                }
              : item
          )
        );
      }

      return { prevChecklists };
    },
    onError: (err: any, _vars, context) => {
      if (context?.prevChecklists) {
        queryClient.setQueryData(KEYS.checklists, context.prevChecklists);
      }
      toast.error(err.message || "완료 상태 변경에 실패했습니다.");
    },
    onSuccess: (updatedItem) => {
      // 서버에서 반환된 정확한 item으로 동기화
      queryClient.setQueryData<ChecklistItem[]>(KEYS.checklists, (old) =>
        old ? old.map((i) => (i.id === updatedItem.id ? updatedItem : i)) : []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.summary });
    },
  });

  // 항목 생성
  const createMutation = useMutation({
    mutationFn: (data: ChecklistItemCreate) =>
      api.post<ChecklistItem>("/checklists", data),
    onSuccess: (newItem) => {
      queryClient.setQueryData<ChecklistItem[]>(KEYS.checklists, (old) =>
        old ? [...old, newItem] : [newItem]
      );
      queryClient.invalidateQueries({ queryKey: KEYS.checklists });
      queryClient.invalidateQueries({ queryKey: KEYS.summary });
      toast.success("할 일이 추가되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "항목 추가에 실패했습니다.");
    },
  });

  // 항목 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChecklistItemUpdate }) =>
      api.patch<ChecklistItem>(`/checklists/${id}`, data),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<ChecklistItem[]>(KEYS.checklists, (old) =>
        old ? old.map((i) => (i.id === updatedItem.id ? updatedItem : i)) : []
      );
      queryClient.invalidateQueries({ queryKey: KEYS.checklists });
      queryClient.invalidateQueries({ queryKey: KEYS.summary });
      toast.success("할 일이 수정되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "항목 수정에 실패했습니다.");
    },
  });

  // 항목 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/checklists/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData<ChecklistItem[]>(KEYS.checklists, (old) =>
        old ? old.filter((i) => i.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: KEYS.summary });
      toast.success("할 일이 삭제되었습니다.");
    },
    onError: (err: any) => {
      toast.error(err.message || "항목 삭제에 실패했습니다.");
    },
  });

  // 시드 삽입
  const seedMutation = useMutation({
    mutationFn: () => api.post<{ inserted: number }>("/checklists/seed"),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: KEYS.checklists });
      queryClient.invalidateQueries({ queryKey: KEYS.summary });
      toast.success(`기본 체크리스트 ${res.inserted}개가 등록되었습니다.`);
    },
    onError: (err: any) => {
      toast.error(err.message || "기본 체크리스트 등록에 실패했습니다.");
    },
  });

  return {
    ...query,
    toggleComplete: toggleMutation.mutateAsync,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    seedItems: seedMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSeeding: seedMutation.isPending,
  };
}
