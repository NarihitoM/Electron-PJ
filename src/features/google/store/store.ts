import { create } from "zustand"

interface GoogleClientState {
    provider: string;
    model: string;
    sheeturl: string;
    docsurl: string;
    setsheeturl: (url: string) => void;
    setdocsurl: (url: string) => void;
    setProvider: (provider: string) => void;
    setModel: (model: string) => void;
    resetgoogle: () => void;
}

export const googleauthstore = create<GoogleClientState>((set) => ({
    provider: "",
    model: "",
    sheeturl: "",
    docsurl: "",
    setsheeturl: (sheeturl) => set({ sheeturl }),
    setdocsurl: (docsurl) => set({ docsurl }),
    setProvider: (provider) => set({ provider, model: "" }),
    setModel: (model) => set({ model }),
    resetgoogle: () => set({ provider: "", model: "", sheeturl: "", docsurl: "" }),
}))
