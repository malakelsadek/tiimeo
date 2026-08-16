"use client";

// Thin wrapper around Google Identity Services' OAuth2 token client.
// Runs entirely in the browser: no server, no stored client secret.
// The access token lives only in memory for this tab's session.

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export interface TokenState {
  accessToken: string;
  expiresAt: number; // epoch ms
}

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function requestToken(
  clientId: string,
  opts: { silent: boolean }
): Promise<TokenState> {
  await loadGisScript();
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services unavailable");
  }

  return new Promise<TokenState>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error || "No access token returned"));
          return;
        }
        const expiresIn = resp.expires_in ?? 3600;
        resolve({
          accessToken: resp.access_token,
          expiresAt: Date.now() + expiresIn * 1000,
        });
      },
      error_callback: (err) => {
        reject(new Error(err.message || err.type || "Sign-in failed"));
      },
    });
    client.requestAccessToken(opts.silent ? { prompt: "" } : undefined);
  });
}

export function revokeToken(accessToken: string) {
  if (window.google?.accounts && "oauth2" in window.google.accounts) {
    const revoke = (
      window.google.accounts.oauth2 as unknown as {
        revoke?: (token: string, cb?: () => void) => void;
      }
    ).revoke;
    revoke?.(accessToken, () => {});
  }
}
