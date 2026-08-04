import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { googleauth } from "../api/api";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
].join(" ");

export const useGoogleConnect = () => {
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();

  const connect = async () => {
    const response = await googleauth.googlestate();
    const stateId = response.stateId;
    const clientid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientid) {
      throw new Error("Google Client ID not configured.");
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://multimate-server.vercel.app";
    const redirecturi = encodeURIComponent(`${backendUrl}/google/api/callback`);
    const scopes = encodeURIComponent(GOOGLE_SCOPES);
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientid}&scope=${scopes}&redirect_uri=${redirecturi}&response_type=code&access_type=offline&prompt=consent&state=${stateId}`;
    (window.ipcRenderer as any).openInBrowser(url);
    setIsChecking(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let fallbackTimeout: ReturnType<typeof setTimeout> | undefined;

    if (isChecking) {
      fallbackTimeout = setTimeout(() => {
        setIsChecking(false);
        if (interval) clearInterval(interval);
      }, 180000);

      interval = setInterval(async () => {
        try {
          const response = await googleauth.googlecheckstatus();
          if (response.success) {
            setIsChecking(false);
            await queryClient.invalidateQueries({ queryKey: ["google"] });
            if (interval) clearInterval(interval);
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(fallbackTimeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking]);

  return { connect, isChecking };
};
