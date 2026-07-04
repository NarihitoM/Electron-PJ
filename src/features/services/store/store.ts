import { create } from "zustand"

export const authservicestore = create<{
    resetservice: () => void;
}>(() => ({
    resetservice: () => {},
}))
