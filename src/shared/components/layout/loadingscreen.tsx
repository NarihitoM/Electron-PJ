import { Spinner } from "../ui/spinner";
import Multimate from "../../assets/Multimate.png";

export const Loadingscreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex gap-2 justify-center items-center">
          <img src={Multimate} className="w-25 mb-2" />
          <h1 className="text-xl font-semibold text-cyan-500 dark:text-white">MultimateAi</h1>
        </div>

        <div className="flex gap-2 justify-center items-center text-xs">
          <Spinner className="h-6 w-6 text-cyan-500 dark:text-white" />
        </div>
      </div>
    </div>
  );
};
