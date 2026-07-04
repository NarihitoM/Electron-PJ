import { create } from "zustand"
import type { UsageClientState } from "../types/type"

const RECENT_LIMIT = 8;

const INITIAL_STATE = {
    period: "day" as "day" | "week" | "month" | "year",
    selectedYear: new Date().getFullYear(),
    recentPage: 1,
    recentLimit: RECENT_LIMIT,
};

export const usagestore = create<UsageClientState>((set) => ({
    ...INITIAL_STATE,
    setPeriod: (period) => set({ period, recentPage: 1 }),
    setSelectedYear: (selectedYear) => set({ selectedYear, recentPage: 1 }),
    setRecentPage: (recentPage) => set({ recentPage }),
    resetUsage: () => set({ ...INITIAL_STATE }),
}))
