import { Navigate, Outlet } from "react-router-dom";
import { userauthstore } from "@/store/userauthstore";
import { useEffect, useState } from "react";
import { Loadingscreen } from "@/components/layout/loadingscreen";

export const PublicRoute = () => {
    const {
        userfetch,
        userdata,
        loadinginitial,
        resetuser
    } = userauthstore();

    //States
    const [ischeck, setischeck] = useState<boolean>(false);

    //Functions
    useEffect(() => {
        const checkAuth = async () => {
            if (!window || !(window as any).api) {
                console.warn("Electron Bridge not found");
                setischeck(true);
                return;
            }


            try {
                const token = await (window as any).api.getToken();

                if (!token) {
                    resetuser();
                    setischeck(true);
                    return;
                }
                await userfetch();
            }
            catch (err: unknown) {
                resetuser();
                throw err;
            }
            finally {
                setischeck(true);
            }
        };
        checkAuth();
    }, [userfetch, resetuser]);


    //Loading
    if (loadinginitial || !ischeck) {
        return <Loadingscreen />
    }

    //if there is userdata go to app
    if (userdata) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
};