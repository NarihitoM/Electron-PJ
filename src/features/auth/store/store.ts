import { create } from "zustand"

interface AuthClientState {
    email: string;
    setEmail: (email: string) => void;
    resetemail: () => void;
}

export const authservicestore = create<AuthClientState>((set) => ({
    email: "",
    setEmail: (email) => set({ email }),
    resetemail: () => set({ email: "" }),
}))
