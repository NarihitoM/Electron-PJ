import { create } from "zustand"

interface TelegramClientState {
    provider: string;
    model: string;
    mode: string;
    selectedGroupId: string;
    selectedContactId: string;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    setmode: (mode: string) => void;
    setSelectedGroupId: (id: string) => void;
    setSelectedContactId: (id: string) => void;
    resettelegram: () => void;
}

export const telegramauthstore = create<TelegramClientState>((set) => ({
    provider: "",
    model: "",
    mode: "group",
    selectedGroupId: "",
    selectedContactId: "",
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    setmode: (mode) => set({ mode }),
    setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
    setSelectedContactId: (selectedContactId) => set({ selectedContactId }),
    resettelegram: () => set({ provider: "", model: "", mode: "group", selectedGroupId: "", selectedContactId: "" }),
}))
