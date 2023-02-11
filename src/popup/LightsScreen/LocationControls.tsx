import { useLights } from "../useLights";
import { GearIcon } from "./Icons";

interface LocationControlsProps {
  onSettingsClick: () => void;
}
export function LocationControls({ onSettingsClick }: LocationControlsProps) {
  const { data } = useLights();

  const locations = data?.locations ?? [];
  const firstLocation = locations.length > 0 ? locations[0] : null;

  const isAnyLightOn = data?.lights.some((l) => l.power === "on");

  return (
    <div className="flex space-x-3 w-full justify-between">
      <div className="flex px-4 py-4 w-full justify-between bg-zinc-900 rounded-xl">
        {firstLocation ? (
          <div className="text-md font-semibold">{firstLocation.name}</div>
        ) : (
          <div>All Lights</div>
        )}
        {/* <div>Toggle is {isAnyLightOn ? "on" : "off"}</div> */}
      </div>
      <div className="">
        <button
          onClick={() => onSettingsClick()}
          title="Open Settings"
          className="px-4 transition-colors flex-grow-0 flex-1 py-4 bg-zinc-900 rounded-xl w-full h-full flex items-center justify-center hover:bg-zinc-700"
        >
          <GearIcon className="stroke-current w-6 h-6" />
        </button>
      </div>
    </div>
  );
}


