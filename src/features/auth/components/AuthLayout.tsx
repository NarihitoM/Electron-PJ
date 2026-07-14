import { Moon, Sun } from "lucide-react";
import Multimate from "@/shared/assets/Multimate.png";
import { AiWaveformScene } from "@/shared/components/layout/animatedscreen";
import { useTheme } from "@/shared/components/ui/themeprovider";
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const AuthLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const toggletheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const location = useLocation();

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      toast.success("Logged out successfully");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-0 h-full w-full">
            <AiWaveformScene theme={theme} />
          </div>
          <div className="absolute bottom-10 left-10 z-10 text-white p-6 max-w-sm">
            <img src={Multimate} className="w-17 h-14 mr-5"></img>
            <h1 className="text-4xl font-bold text-cyan-500 dark:text-white tracking-tighter">
              {title}
            </h1>
            <h1 className="text-3xl font-bold text-cyan-500 dark:text-white tracking-tighter mt-3">
              MultimateAi
            </h1>
            <p className="text-muted-foreground dark:text-white mt-2 opacity-80">
              Your all in one agentic orchestration software.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-10">
          <div className="flex justify-between gap-2">
            <a href="#" className="flex items-center gap-2 font-medium">
              <img src={Multimate} className="w-12 h-10"></img>
              <span className="font-medium">MultimateAi</span>
            </a>
            <button onClick={toggletheme} className="p-2 rounded-md border bg-background">
              {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};
