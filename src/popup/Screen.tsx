import React from "react";

export function Screen({ children }: { children: React.ReactNode; }) {
  return (
    <div className="w-full h-[600px] p-5 antialiased overflow-auto">
      {children}
    </div>
  );
}
