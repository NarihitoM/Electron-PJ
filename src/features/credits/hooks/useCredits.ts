import { useQuery } from "@tanstack/react-query";
import { creditApi } from "../api/api";

export const useCreditBalance = () => {
  return useQuery({
    queryKey: ["creditBalance"],
    queryFn: () => creditApi.getBalance(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5, // auto-refetch every 5 min
  });
};

export const useCreditHistory = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["creditHistory", page, limit],
    queryFn: () => creditApi.getHistory(page, limit),
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,
  });
};
