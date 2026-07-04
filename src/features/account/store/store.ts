import { create } from "zustand"

interface AccountState {
    username: string;
    currentpassword: string;
    newpassword: string;
    code: string;
    openverify: boolean;
    stateid: string;
    timer: number;
    preview: string | null;
    loadingupdate: boolean;
    loadingpassword: boolean;
    loadingpasswordverify: boolean;
    loadingpasswordresend: boolean;
    loadingpasswordchange: boolean;
    dialogService: string | null;
    search: string;

    setUsername: (v: string) => void;
    setCurrentpassword: (v: string) => void;
    setNewpassword: (v: string) => void;
    setCode: (v: string) => void;
    setOpenverify: (v: boolean) => void;
    setStateid: (v: string) => void;
    setTimer: (v: number) => void;
    setPreview: (v: string | null) => void;
    setLoadingupdate: (v: boolean) => void;
    setLoadingpassword: (v: boolean) => void;
    setLoadingpasswordverify: (v: boolean) => void;
    setLoadingpasswordresend: (v: boolean) => void;
    setLoadingpasswordchange: (v: boolean) => void;
    setDialogService: (v: string | null) => void;
    setSearch: (v: string) => void;
}

export const accountstore = create<AccountState>((set) => ({
    username: "",
    currentpassword: "",
    newpassword: "",
    code: "",
    openverify: false,
    stateid: "",
    timer: 0,
    preview: null,
    loadingupdate: false,
    loadingpassword: false,
    loadingpasswordverify: false,
    loadingpasswordresend: false,
    loadingpasswordchange: false,
    dialogService: null,
    search: "",

    setUsername: (v) => set({ username: v }),
    setCurrentpassword: (v) => set({ currentpassword: v }),
    setNewpassword: (v) => set({ newpassword: v }),
    setCode: (v) => set({ code: v }),
    setOpenverify: (v) => set({ openverify: v }),
    setStateid: (v) => set({ stateid: v }),
    setTimer: (v) => set({ timer: v }),
    setPreview: (v) => set({ preview: v }),
    setLoadingupdate: (v) => set({ loadingupdate: v }),
    setLoadingpassword: (v) => set({ loadingpassword: v }),
    setLoadingpasswordverify: (v) => set({ loadingpasswordverify: v }),
    setLoadingpasswordresend: (v) => set({ loadingpasswordresend: v }),
    setLoadingpasswordchange: (v) => set({ loadingpasswordchange: v }),
    setDialogService: (v) => set({ dialogService: v }),
    setSearch: (v) => set({ search: v }),
}))