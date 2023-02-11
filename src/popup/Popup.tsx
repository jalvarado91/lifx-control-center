import { QueryClientProvider } from "react-query";
import { AuthProvider, useAuth } from "./AuthContext";
import { LightsScreen } from "./LightsScreen/LightsScreen";
import { LoginScreen } from "./LoginScreen";
import { OvalSpinner } from "./OvalSpinner";
import { popupQueryClient } from "./popupQueryClient";
import { Screen } from "./Screen";
import { ToastProvider } from "./ToastContext";

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
  return !token ? <LoginScreen /> : <LightsScreen />;
}
