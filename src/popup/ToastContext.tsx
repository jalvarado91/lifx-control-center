import classNames from "classnames";
import React from "react";
import { useState } from "react";

interface ToastProps {
  onClose: () => void;
  contents: string;
  color: "green" | "red" | "blue";
}
function Toast({ contents, onClose, color }: ToastProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 p-4 text-sm transition-opacity duration-200 ease-in-out">
      <div
        className={classNames(
          "flex items-center justify-between px-4 py-4 bg-zinc-800 rounded-lg",
          {
            "bg-green-600": color === "green",
            "bg-red-600": color === "red",
            "bg-blue-600": color === "blue",
          }
        )}
      >
        <div>{contents}</div>
        <button
          onClick={onClose}
          className="text-white font-bold px-3 rounded-lg hover:bg-black/30"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export const ToastContext = React.createContext<{
  showToast: (contents: string, color: "green" | "red" | "blue") => void;
}>({
  showToast: () => { },
});

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastContext");
  }
  return {
    showToast: context.showToast,
  };
}

export function ToastProvider({ children }: { children: React.ReactNode; }) {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (contents: string, color: "green" | "red" | "blue") => {
    setToast({ contents, onClose: () => setToast(null), color });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
}
