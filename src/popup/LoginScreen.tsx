import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { useAuth } from "./AuthContext";
import { popupQueryClient } from "./popupQueryClient";
import { useToast } from "./ToastContext";

export function LoginScreen() {
  const [accessToken, setAccessToken] = useState("");

  const { verifyToken, verificationState } = useLoginScreen();

  const canSubmit = accessToken.length > 0;

  async function onAuthorize() {
    verifyToken(accessToken.trim());
  }

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
          <textarea
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full bg-zinc-800 font-mono text-xs p-4 pb-6 rounded-lg"
          ></textarea>
          <ActionButton
            disabled={!canSubmit}
            loading={verificationState === "pending"}
            variant="secondary"
            onClick={onAuthorize}
          >
            Authorize
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
function useLoginScreen() {
  const { showToast } = useToast();
  const { setToken } = useAuth();
  const [verificationState, setVerificationState] = useState<
    "pending" | "success" | "idle"
  >("idle");

  function verifyToken(token: string) {
    setVerificationState("pending");
    fetch(`https://api.lifx.com/v1/lights/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          popupQueryClient.setQueriesData(["lights", { token }], data);
          setToken(token);
          setVerificationState("success");
        } else {
          setVerificationState("idle");
          showToast("Invalid token", "red");
        }
      })
      .catch(() => {
        setVerificationState("idle");
      });
  }

  return {
    verificationState,
    verifyToken,
  };
}
