import { useAuth } from "../AuthContext";
import { IColor, IGroup, ILight, toggleLightPower } from "../lifxClient";
import { LocationControls } from "./LocationControls";
import { OvalSpinner } from "../OvalSpinner";
import { LIGHTS_QUERY_KEY, useLights } from "../useLights";
import classNames from "classnames";
import { useQueryClient } from "react-query";

function useGroup(id: string) {
  const { data } = useLights();
  const groups = data?.groups ?? [];

  return groups.find((g) => g.id === id);
}

export function LightsScreen() {
  const { clearToken } = useAuth();
  const { isLoading, data } = useLights();

  return (
    <div className="flex flex-col text-base space-y-12 h-full justify-center items-center">
      {isLoading ? (
        <div className="text-center">
          <OvalSpinner />
        </div>
      ) : (
        <div className="flex flex-col w-full h-full space-y-12">
          <LocationControls />

          <div className="flex flex-col space-y-12">
            {data?.groups.map((group: IGroup) => (
              <LightGroup key={group.id} groupId={group.id} />
            ))}
          </div>

          <button onClick={() => clearToken()}>Remove token</button>
        </div>
      )}
    </div>
  );
}

interface LightGroupProps {
  groupId: string;
}

function LightGroup({ groupId }: LightGroupProps) {
  const group = useGroup(groupId);
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { data } = useLights();

  const groupLights = data?.lightsByGroup[groupId] ?? [];

  async function onLightClick(lightId: string) {
    await toggleLightPower(lightId, token ?? "");

    // Wait for lifx api to catch up before
    // syncing light state
    setTimeout(async () => {
      await queryClient.refetchQueries(LIGHTS_QUERY_KEY);
    }, 1000);
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
          <div
            style={{
              background: hslColor,
            }}
            justify-items-stretch
            className={classNames(
              "absolute inline-block border-2 border-white rounded-full h-8 w-8 m-2",
              isOn ? "right-0" : "left-0"
            )}
          ></div>
          {isOff && (
            <div className="absolute hover:opacity-60 transotion transition-opacity inset-0 bg-black opacity-70 rounded-full"></div>
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