import classNames from "classnames";
import { useState } from "react";

export const Popup = () => {
  return (
    <Screen>
      <App />
    </Screen>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "main" | "settings"
  >("login");

  return <LoginScreen />;
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-[600px] p-5 antialiased">{children}</div>;
}

function LoginScreen() {
  return (
    <div className="flex flex-col text-base space-y-12 h-full justify-center items-center">
      <div className="text-center flex flex-col items-center justify-center">
        <div className="text-xl font-bold">
          <span role="img" aria-label="light">
            💡
          </span>
          LIFX <br /> Control Center
        </div>
      </div>
      <div className="flex flex-col space-y-14 justify-between">
        <div className="space-y-6">
          <p>
            To get started generate a Token in your LIFX account settings and
            paste it below
          </p>
          <div className="text-center space-y-3">
            <ActionButton
              onClick={() => window.open("https://cloud.lifx.com/settings")}
            >
              Open LIFX Account Settings
            </ActionButton>
            <div className="text-xs text-gray-300">
              and press the 'Generate New Token' button
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>Enter the token generated above</div>
          <textarea className="w-full bg-zinc-800 font-mono text-xs p-4 pb-6 rounded-lg"></textarea>
          <ActionButton variant="secondary" onClick={() => console.log("main")}>
            Authorize
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={classNames(
        "w-full rounded-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4",
        variant === "primary" && "bg-sky-500 hover:bg-sky-600",
        variant === "secondary" && "bg-green-500 hover:bg-green-600",
        variant === "danger" && "bg-red-500 hover:bg-red-600"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
