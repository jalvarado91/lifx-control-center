import { IGroup } from "../lifxClient";
import { LocationControls } from "./LocationControls";
import { useLights } from "../useLights";
import { LightsScreenSkeleton } from "./LightsScreenSkeleton";
import { motion } from "framer-motion";
import { LightGroup } from "./LightGroup";

interface LightScreenProps {
  onSettingsClick: () => void;
}
export function LightsScreen({ onSettingsClick }: LightScreenProps) {
  const { isLoading, data } = useLights();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col text-base h-full justify-center items-center"
    >
      {isLoading ? (
        <div className="flex flex-col w-full h-full">
          <LightsScreenSkeleton />
        </div>
      ) : (
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-grow-0 px-5 py-5">
            <LocationControls onSettingsClick={onSettingsClick} />
          </div>

          <div className="flex h-full flex-col space-y-12 px-5 pt-4 pb-6 overflow-y-auto">
            {data?.groups.map((group: IGroup) => (
              <LightGroup key={group.id} groupId={group.id} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
