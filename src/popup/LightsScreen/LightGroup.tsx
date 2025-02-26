import { useGroup, useLights } from "../useLights";
import { Light } from "./Light";
import { useToggleLightMutation } from "./useToggleLightMutation";
import { ILight } from "../lifxClient";

interface LightGroupProps {
  groupId: string;
  onLightDetail: (light: ILight) => void;
}

export function LightGroup({ groupId, onLightDetail }: LightGroupProps) {
  const group = useGroup(groupId);
  const { data, isFetching } = useLights();

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
            onDetailClick={() => onLightDetail(light)}
            isRefreshing={isFetching}
          />
        ))}
      </div>
    </div>
  );
}
