import { create } from "zustand"
import type { AuthClientState } from "../types/type"

export const authservicestore = create<AuthClientState>((set) => ({
    email: "",
    setEmail: (email) => set({ email }),
    resetemail: () => set({ email: "" }),
}))
