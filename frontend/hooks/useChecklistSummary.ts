"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { KEYS } from "@/lib/queryKeys";
import { ChecklistSummaryResponse } from "@/types";

export function useChecklistSummary() {
  return useQuery<ChecklistSummaryResponse>({
    queryKey: KEYS.summary,
    queryFn: () => api.get<ChecklistSummaryResponse>("/checklists/summary"),
  });
}
