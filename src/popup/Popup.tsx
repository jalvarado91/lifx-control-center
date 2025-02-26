import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./AuthContext";
import { LightsScreen } from "./LightsScreen/LightsScreen";
import { LoginScreen } from "./LoginScreen";
import { OvalSpinner } from "./OvalSpinner";
import { popupQueryClient } from "./popupQueryClient";
import { Screen } from "./Screen";
import { ToastProvider } from "./ToastContext";
import { SettingsScreen } from "./SettingsScreen";
import { AnimatePresence } from "framer-motion";
import { LightDetail } from "./LightsScreen/LightDetail";
import { ILight } from "./lifxClient";

export const Popup = () => {
  return (
    <Screen>
      <QueryClientProvider client={popupQueryClient}>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Screen>
  );
};

function App() {
  const { token, status } = useAuth();
  if (status === "loading") {
    return <OvalSpinner />;
  }
  return !token ? <LoginScreen /> : <AuthedScreens />;
}

type Screen = "lights" | "settings" | { type: "light-detail"; light: ILight };

function AuthedScreens() {
  const [activeScreen, setActiveScreen] = useState<Screen>("lights");

  return (
    <AnimatePresence mode="wait">
      {activeScreen === "lights" && (
        <LightsScreen 
          onSettingsClick={() => setActiveScreen("settings")}
          onLightDetail={(light) => setActiveScreen({ type: "light-detail", light })}
        />
      )}
      {activeScreen === "settings" && (
        <SettingsScreen onClose={() => setActiveScreen("lights")} />
      )}
      {typeof activeScreen !== "string" && activeScreen.type === "light-detail" && (
        <LightDetail 
          light={activeScreen.light}
          onBack={() => setActiveScreen("lights")}
        />
      )}
    </AnimatePresence>
  );
}
