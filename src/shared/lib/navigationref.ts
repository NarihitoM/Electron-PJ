import type { NavigateFunction } from "react-router-dom";

export const navigationRef: { navigate: NavigateFunction | null } = {
  navigate: null,
};
