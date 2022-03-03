import React from "react";
import { useEffect, useState } from "react";
import { storage } from "webextension-polyfill";

const AuthContext = React.createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
});
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    storage.local.get("token").then((data) => {
      setToken(data.token);
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
      value={{ token, setToken: setTokenLocal, clearToken }}
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
  };
}
