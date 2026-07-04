import { create } from "zustand"

const DASHBOARD_INITIAL = {} as const;

export const dashboardstore = create<{
    resetDashboard: () => void;
}>((set) => ({
    ...DASHBOARD_INITIAL,
    resetDashboard: () => set({ ...DASHBOARD_INITIAL }),
}))
