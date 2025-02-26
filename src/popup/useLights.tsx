import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { getLights, IGroup, ILight, ILocation } from "./lifxClient";

export const LIGHTS_QUERY_KEY = "lights";

export function useLights() {
  const { token } = useAuth();
  return useQuery(
    [
      LIGHTS_QUERY_KEY,
      {
        token: token,
      },
    ],
    fetchLights,
    {
      onError: (error) => {
        console.log(error);
      },
      select: (data) => {
        return indexLightsData(data);
      },
      keepPreviousData: true,
    }
  );
}

export function indexLightsData(data: ILight[]) {
  const lights = data;
  const allLocations = lights.map((light) => light.location);
  const locations: ILocation[] = [];
  allLocations.forEach((location) => {
    if (!locations.find((l) => l.id === location.id)) {
      locations.push(location);
    }
  });

  const allGroups = lights.map((light) => light.group);
  const groups: IGroup[] = [];
  allGroups.forEach((group) => {
    if (!groups.find((g) => g.id === group.id)) {
      groups.push(group);
    }
  });

  const groupsByLocation: Record<string, IGroup> = {};
  const lightsByGroup: Record<string, ILight[]> = {};

  lights.forEach((light) => {
    const group = light.group;
    const location = light.location;

    if (!groupsByLocation[location.id]) {
      groupsByLocation[location.id] = group;
    }

    let existingGroup = lightsByGroup[group.id];
    if (!existingGroup) {
      lightsByGroup[group.id] = [light];
    } else {
      lightsByGroup[group.id] = [...existingGroup, light];
    }
  });

  return {
    lights,
    locations,
    groups,
    groupsByLocation,
    lightsByGroup,
  };
}

export function useGroup(id: string) {
  const { data } = useLights();
  const groups = data?.groups ?? [];
  return groups.find((g) => g.id === id);
}

async function fetchLights({ queryKey }: any) {
  const [_key, { token }] = queryKey;

  return getLights(token);
}
