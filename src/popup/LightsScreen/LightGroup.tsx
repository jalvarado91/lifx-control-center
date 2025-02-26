import { useGroup, useLights } from "../useLights";
import { Light } from "./Light";
import { useToggleLightMutation } from "./useToggleLightMutation";
import { ILight } from "../lifxClient";
import { useState } from "react";

interface LightGroupProps {
  groupId: string;
}

export function LightGroup({ groupId }: LightGroupProps) {
  const group = useGroup(groupId);
  const { data, isFetching } = useLights();
  const [expandedLights, setExpandedLights] = useState<Set<string>>(new Set());

  const groupLights = data?.lightsByGroup[groupId] ?? [];

  const toggleLightMutation = useToggleLightMutation();

  async function onLightClick(lightId: string) {
    toggleLightMutation.mutate(lightId);
  }

  function onLightExpand(lightId: string, isExpanded: boolean) {
    setExpandedLights(prev => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(lightId);
      } else {
        next.delete(lightId);
      }
      return next;
    });
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
        {groupLights.map((light, index) => (
          <Light
            light={light}
            key={light.id}
            onToggle={() => onLightClick(light.id)}
            isRefreshing={isFetching}
            showDivider={
              expandedLights.has(light.id) && 
              index < groupLights.length - 1 && 
              expandedLights.has(groupLights[index + 1].id)
            }
            onExpand={(isExpanded) => onLightExpand(light.id, isExpanded)}
          />
        ))}
      </div>
    </div>
  );
}
