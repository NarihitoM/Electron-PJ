import { Loadingscreen } from "@/components/layout/loadingscreen";
import { userauthstore } from "@/store/userauthstore"
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom"
import { Navigate } from "react-router-dom";

export const Protectedroute = () => {
    //Store
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
    const token = await (window as any).api.getToken();
            
            if (!token) {
                resetuser();
                setischeck(true);
                return;
            }

            try {
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
      return <Loadingscreen/>
    }

    //If there is no user go to "/"
    if (!userdata) {
        return (
            <Navigate to="/" replace />
        )
    }

    return <Outlet />;
}