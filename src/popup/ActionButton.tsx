import classNames from "classnames";
import React from "react";

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

function OvalSpinner() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="3">
          <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  );
}
