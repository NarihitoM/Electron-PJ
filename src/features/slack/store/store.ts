import { create } from "zustand"

interface SlackClientState {
    provider: string;
    model: string;
    selectedChannelId: string;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setSelectedChannelId: (id: string) => void;
    resetslack: () => void;
}

export const slackauthstore = create<SlackClientState>((set) => ({
    provider: "",
    model: "",
    selectedChannelId: "",
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setSelectedChannelId: (selectedChannelId) => set({ selectedChannelId }),
    resetslack: () => set({ provider: "", model: "", selectedChannelId: "" }),
}))
