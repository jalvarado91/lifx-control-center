import React from "react";

export function Screen({ children }: { children: React.ReactNode; }) {
  return (
    <div className="w-full h-[600px] antialiased overflow-auto">
      {children}
    </div>
  );
}
