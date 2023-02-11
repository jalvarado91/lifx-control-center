import { useAuth } from "./AuthContext";
import { CloseIcon } from "./LightsScreen/Icons";
import { ActionButton } from "./ActionButton";

interface SettingScreenProps {
  onClose: () => void;
}
export function SettingsScreen({ onClose }: SettingScreenProps) {
  const { clearToken } = useAuth();

  function onClearToken() {
    clearToken();
  }

  return (
    <div className="flex flex-col text-base h-full p-5 justify-center items-center">
      <div className="flex flex-col w-full h-full">
        <div className="flex space-x-3 w-full justify-between">
          <div className="flex w-full justify-between">
            <div className="font-bold">
              <span role="img" aria-label="light">
                💡
              </span>
              LIFX <br /> Control Center
            </div>
          </div>
          <button
            onClick={() => onClose()}
            title="Close Settings"
            className="px-4 transition-colors flex-grow-0 flex-1 h-14 py-4 bg-zinc-900 rounded-xl w-full flex items-center justify-center hover:bg-zinc-700"
          >
            <CloseIcon className="stroke-current w-6 h-6" />
          </button>
        </div>
        <div className="py-8 space-y-12">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Account</h2>
            <ActionButton onClick={() => onClearToken()} variant="danger">
              Clear Your Access Token
            </ActionButton>
            <p className="text-xs opacity-85 pt-1 text-center">
              This will log you our of the extension
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-sm">
              Source code on{" "}
              <a
                className="text-blue-300"
                href="https://github.com/jalvarado91/lifx-control-center"
              >
                GitHub
              </a>
              . Built by{" "}
              <a
                className="text-blue-300"
                href="https://twitter.com/Jalvarado91"
              >
                @jalvarado91
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}