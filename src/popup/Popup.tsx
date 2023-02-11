import { useState } from "react";
import { QueryClientProvider } from "react-query";
import { AuthProvider, useAuth } from "./AuthContext";
import { LightsScreen } from "./LightsScreen/LightsScreen";
import { LoginScreen } from "./LoginScreen";
import { OvalSpinner } from "./OvalSpinner";
import { popupQueryClient } from "./popupQueryClient";
import { Screen } from "./Screen";
import { ToastProvider } from "./ToastContext";
import { SettingsScreen } from "./SettingsScreen";

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

function AuthedScreens() {
  const [activeScreen, setActiveScreen] = useState<"lights" | "settings">(
    "lights"
  );

  return (
    <>
      {activeScreen === "lights" && (
        <LightsScreen onSettingsClick={() => setActiveScreen("settings")} />
      )}
      {activeScreen === "settings" && (
        <SettingsScreen onClose={() => setActiveScreen("lights")} />
      )}
    </>
  );
}
