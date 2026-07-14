import { Loadingscreen } from "../components/layout/loadingscreen";
import { userauthapi } from "../../features/auth/api/api";
import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { Button } from "../components/ui/button";

export const Protectedroute = () => {
  const [userdata, setUserdata] = useState<any>(null);
  const [loadinginitial, setLoadingInitial] = useState(true);

  const [ischeck, setischeck] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);

  const checkAuth = useCallback(async () => {
    const token = await (window as any).api.getToken();

    if (!token) {
      setUserdata(null);
      setischeck(true);
      setLoadingInitial(false);
      return;
    }

    try {
      setNetworkError(false);
      const response = await userauthapi.fetchuser();
      if (response.success) {
        setUserdata(response.data ?? null);
      } else {
        setUserdata(null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        await (window as any).api.logout();
        setUserdata(null);
        return;
      }
      setNetworkError(true);
    } finally {
      setischeck(true);
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loadinginitial || !ischeck) {
    return <Loadingscreen />;
  }

  if (networkError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <WifiOff className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold">Network connection error</h1>
        <p className="max-w-md text-muted-foreground">
          We couldn't fetch your user information. Please check your internet connection and try
          again.
        </p>
        <Button onClick={checkAuth} className="bg-cyan-500 dark:bg-white">
          Retry
        </Button>
      </div>
    );
  }

  if (!userdata) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
