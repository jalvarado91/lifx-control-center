import { useAuth } from "../AuthContext";
import { ILight, setBrightness } from "../lifxClient";
import { LIGHTS_QUERY_KEY } from "../useLights";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function updateLightBrightness(lights: ILight[], lightId: string, brightness: number) {
  return lights.map((light) => {
    if (light.id === lightId) {
      return {
        ...light,
        brightness,
      } satisfies ILight;
    }
    return light;
  });
}

export function useBrightnessMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ lightId, brightness }: { lightId: string; brightness: number }) =>
      setBrightness(lightId, brightness, token ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LIGHTS_QUERY_KEY, { token }],
      });

      setTimeout(async () => {
        await queryClient.refetchQueries([LIGHTS_QUERY_KEY, { token }]);
      }, 1000);
    },
    onMutate: async ({ lightId, brightness }) => {
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
          updateLightBrightness(previousLights, lightId, brightness)
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