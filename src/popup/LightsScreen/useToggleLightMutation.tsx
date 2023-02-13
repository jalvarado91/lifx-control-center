import { useAuth } from "../AuthContext";
import { ILight, toggleLightPower } from "../lifxClient";
import { LIGHTS_QUERY_KEY } from "../useLights";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function toggleLightInLights(lights: ILight[], lightId: string) {
  return lights.map((light) => {
    if (light.id === lightId) {
      return {
        ...light,
        power: light.power === "on" ? "off" : "on",
      } satisfies ILight;
    }
    return light;
  });
}

export function useToggleLightMutation() {
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
