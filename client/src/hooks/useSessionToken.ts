"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "hungrr_session_token";

/**
 * A simple hook to get or create a unique, anonymous session token
 * for the user's device.
 */
export const useSessionToken = (): string | null => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let sessionToken = localStorage.getItem(TOKEN_KEY);

    if (!sessionToken) {
      sessionToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
      localStorage.setItem(TOKEN_KEY, sessionToken);
    }

    setToken(sessionToken);
  }, []);

  return token;
};
