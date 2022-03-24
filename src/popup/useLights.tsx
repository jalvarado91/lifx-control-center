import { useQuery } from "react-query";
import { useAuth } from "./AuthContext";
import { getLights, Group, Light, Location } from "./lifxClient";

export function useLights() {
  const { token } = useAuth();
  return useQuery(
    [
      "lights",
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
        const lights = data;
        const allLocations = lights.map((light) => light.location);
        const locations: Location[] = [];
        allLocations.forEach((location) => {
          if (!locations.find((l) => l.id === location.id)) {
            locations.push(location);
          }
        });

        const allGroups = lights.map((light) => light.group);
        const groups: Group[] = [];
        allGroups.forEach((group) => {
          if (!groups.find((g) => g.id === group.id)) {
            groups.push(group);
          }
        });

        const groupsByLocation: Record<string, Group> = {};
        const lightsByGroup: Record<string, Light> = {};

        lights.forEach((light) => {
          const location = light.location;
          const group = light.group;

          if (!groupsByLocation[location.id]) {
            groupsByLocation[location.id] = group;
          }

          if (!lightsByGroup[group.id]) {
            lightsByGroup[group.id] = light;
          }
        });

        return {
          lights,
          locations,
          groups,
          groupsByLocation,
          lightsByGroup,
        };
      },
    }
  );
}

async function fetchLights({ queryKey }: any) {
  const [_key, { token }] = queryKey;

  return getLights(token);
}
