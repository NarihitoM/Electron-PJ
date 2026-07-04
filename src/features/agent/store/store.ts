import { create } from "zustand"

interface AgentClientState {
    type: string;
    setType: (type: string) => void;
    resetagent: () => void;
}

export const useagentstore = create<AgentClientState>((set) => ({
    type: "All",
    setType: (type) => set({ type }),
    resetagent: () => set({ type: "All" }),
}))
