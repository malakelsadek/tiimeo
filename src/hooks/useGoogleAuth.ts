"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { requestToken, revokeToken, type TokenState } from "@/lib/google-auth";

const STORAGE_KEY = "tiimeo.gcal.token";
const REFRESH_MARGIN_MS = 60_000;

function loadStoredToken(): TokenState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TokenState;
    if (!parsed.accessToken || parsed.expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeToken(token: TokenState | null) {
  if (token) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(token));
  else sessionStorage.removeItem(STORAGE_KEY);
}

export function useGoogleAuth(clientId: string | undefined) {
  const [token, setToken] = useState<TokenState | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the latest scheduler so the recursive re-schedule below reads a
  // fresh closure over `clientId` without referencing `scheduleRefresh`
  // (a useCallback-memoized value) from inside its own factory. Written in
  // an effect (not during render) since ref writes during render aren't safe.
  const scheduleRefreshRef = useRef<(t: TokenState) => void>(() => {});

  useEffect(() => {
    scheduleRefreshRef.current = (t: TokenState) => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      const delay = Math.max(0, t.expiresAt - Date.now() - REFRESH_MARGIN_MS);
      refreshTimer.current = setTimeout(async () => {
        if (!clientId) return;
        try {
          const fresh = await requestToken(clientId, { silent: true });
          storeToken(fresh);
          setToken(fresh);
          scheduleRefreshRef.current(fresh);
        } catch {
          // Silent refresh failed (e.g. consent expired) — fall back to sign-in screen.
          storeToken(null);
          setToken(null);
        }
      }, delay);
    };
  }, [clientId]);

  const scheduleRefresh = useCallback((t: TokenState) => scheduleRefreshRef.current(t), []);

  useEffect(() => {
    // Hydrate from sessionStorage post-mount only — the server can't see
    // sessionStorage, so doing this during render would mismatch hydration.
    const stored = loadStoredToken();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(stored);
      setStatus("ready");
      scheduleRefresh(stored);
    }
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(async () => {
    if (!clientId) {
      setError("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const t = await requestToken(clientId, { silent: false });
      storeToken(t);
      setToken(t);
      setStatus("ready");
      scheduleRefresh(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setStatus("error");
    }
  }, [clientId, scheduleRefresh]);

  const signOut = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (token) revokeToken(token.accessToken);
    storeToken(null);
    setToken(null);
    setStatus("idle");
  }, [token]);

  return { token, status, error, signIn, signOut };
}
