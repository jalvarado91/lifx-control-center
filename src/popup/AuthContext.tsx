import React from "react";
import { useEffect, useState } from "react";
import { storage } from "webextension-polyfill";

const AuthContext = React.createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  status: "loading" | "idle";
}>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
  status: "loading",
});
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading">("loading");

  useEffect(() => {
    setState("loading");
    storage.local.get("token").then((data) => {
      setToken(data.token);
      setState("idle");
    });
  }, []);

  function setTokenLocal(token: string | null) {
    setToken(token);
    storage.local.set({ token });
  }

  function clearToken() {
    setTokenLocal(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, setToken: setTokenLocal, clearToken, status: state }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return {
    token: context.token,
    setToken: context.setToken,
    clearToken: context.clearToken,
    status: context.status,
  };
}
