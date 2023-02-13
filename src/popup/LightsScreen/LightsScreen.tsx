import { useAuth } from "../AuthContext";
import { IColor, IGroup, ILight, toggleLightPower } from "../lifxClient";
import { LocationControls } from "./LocationControls";
import { LIGHTS_QUERY_KEY, toggleLightInLights, useLights } from "../useLights";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LightsScreenSkeleton } from "./LightsScreenSkeleton";
import { motion } from "framer-motion";

function useGroup(id: string) {
  const { data } = useLights();
  const groups = data?.groups ?? [];
  return groups.find((g) => g.id === id);
}

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

interface LightGroupProps {
  groupId: string;
}

function LightGroup({ groupId }: LightGroupProps) {
  const group = useGroup(groupId);
  const { data } = useLights();

  const groupLights = data?.lightsByGroup[groupId] ?? [];

  const toggleLightMutation = useToggleLightMutation();

  async function onLightClick(lightId: string) {
    toggleLightMutation.mutate(lightId);
  }

  if (!group) {
    return <></>;
  }

  return (
    <div className="relative flex flex-col px-4 pb-4 pt-8 w-full bg-zinc-900 rounded-xl">
      <div className="inline-block bg-zinc-700 px-4 py-[5px] font-bold absolute -translate-y-12 rounded-full">
        {group.name}
      </div>
      <div className="flex flex-col space-y-4">
        {groupLights.map((light) => (
          <Light
            light={light}
            key={light.id}
            onToggle={() => onLightClick(light.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface LightProps {
  light: ILight;
  onToggle: () => void;
}

function useToggleLightMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (lightId: string) => toggleLightPower(lightId, token ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LIGHTS_QUERY_KEY, { token }],
      });

      setTimeout(async () => {
        await queryClient.refetchQueries([LIGHTS_QUERY_KEY, { token }]);
      }, 1000);
    },
    onMutate: async (lightId: string) => {
      await queryClient.cancelQueries({
        queryKey: [LIGHTS_QUERY_KEY, { token }],
      });

      const previousLights = queryClient.getQueryData<ILight[]>([
        LIGHTS_QUERY_KEY,
        { token },
      ]);

      if (previousLights) {
        queryClient.setQueryData<ILight[]>(
          [LIGHTS_QUERY_KEY, { token }],
          toggleLightInLights(previousLights, lightId)
        );
      }

      return { previousLights };
    },
    onError: (err, variables, context) => {
      if (context?.previousLights) {
        queryClient.setQueryData<ILight[]>(
          [LIGHTS_QUERY_KEY, { token }],
          context.previousLights
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [LIGHTS_QUERY_KEY, { token }],
      });
    },
  });
  return mutation;
}

function Light({ light, onToggle }: LightProps) {
  const hslColor = lightColorToHslString(light.color);
  const isOn = light.power === "on";
  const isOff = light.power === "off";

  const brightness = light.brightness;

  return (
    <div
      key={light.id}
      className="flex flex-col space-y-1 w-full justify-between"
    >
      <div className="text-sm font-semibold">{light.label}</div>
      {/* <div className="text-sm">
                Toggle is {light.power === "on" ? "on" : "off"} /{" "}
                {light.color.hue}, {light.color.saturation},{" "}
                {light.color.kelvin} / {brightness}
              </div> */}
      <div className="relative flex w-full">
        <div className="absolute inset-0 rounded-full bg-[#121116]"></div>
        <button
          onClick={() => onToggle()}
          className={classNames(
            "min-w-fit h-11 rounded-full flex items-center px-2 relative"
            // isOn && "justify-end"
          )}
          style={{
            background: hslColor,
            width: `${brightness * 100}%`,
          }}
        >
          {isOn && (
            <div className="absolute inset-0 bg-black hover:shadow-inner transition-opacity opacity-25 hover:opacity-30 rounded-full"></div>
          )}
          <motion.div
            layout
            transition={{ ease: "easeInOut" }}
            style={{
              background: hslColor,
            }}
            className={classNames(
              "absolute inline-block border-2 border-white rounded-full h-8 w-8 m-2",
              isOn ? "right-0" : "left-0"
            )}
          ></motion.div>
          {isOff && (
            <div className="absolute hover:opacity-60 transition-opacity inset-0 bg-black opacity-70 rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}

function lightColorToHslString(lightColor: IColor) {
  const kelvin = lightColor.kelvin;
  const colorLightness = 100 * (1 - 1 / (kelvin / 4000 + 1));

  const hslColor = `hsl(${lightColor.hue.toFixed(0)},${
    lightColor.saturation * 100
  }%,${colorLightness}%)`;

  return hslColor;
}
