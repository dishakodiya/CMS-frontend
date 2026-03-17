"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getAuthServerSnapshot,
  getAuthSnapshot,
  subscribeAuth,
  type CmsUser,
} from "./auth-storage";

type AuthState = { token: string | null; user: CmsUser | null };

export function useAuth() {
  const snapshot = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  return useMemo(() => {
    try {
      return JSON.parse(snapshot) as AuthState;
    } catch {
      return { token: null, user: null } as AuthState;
    }
  }, [snapshot]);
}
