export interface AccountState {
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
