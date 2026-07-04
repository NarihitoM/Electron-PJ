import { create } from "zustand"
import type { DashboardClientState } from "../types/type"

const DASHBOARD_INITIAL = {} as const;

export const dashboardstore = create<DashboardClientState>((set) => ({
    ...DASHBOARD_INITIAL,
    resetDashboard: () => set({ ...DASHBOARD_INITIAL }),
}))
