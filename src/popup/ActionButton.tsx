import classNames from "classnames";
import React from "react";
import { OvalSpinner } from "./OvalSpinner";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
}: ActionButtonProps) {
  const onClickHandler = disabled || loading ? undefined : onClick;

  return (
    <button
      className={classNames(
        "w-full rounded-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 flex items-center justify-center space-x-3",
        "transition-colors duration-200 ease-in-out",
        disabled && "opacity-50 cursor-not-allowed",
        variant === "primary" && "bg-sky-500 hover:bg-sky-600",
        variant === "secondary" && "bg-green-500 hover:bg-green-600",
        variant === "danger" && "bg-red-500 hover:bg-red-600"
      )}
      onClick={onClickHandler}
    >
      {loading ? (
        <>
          <OvalSpinner />
          <div>{children}</div>
        </>
      ) : (
        children
      )}
    </button>
  );
}


