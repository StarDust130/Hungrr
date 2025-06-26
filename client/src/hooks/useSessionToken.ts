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
      sessionToken = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, sessionToken);
    }

    setToken(sessionToken);
  }, []);

  return token;
};
