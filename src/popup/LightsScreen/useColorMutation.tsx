import { useAuth } from "../AuthContext";
import { ILight, IColor, setColor } from "../lifxClient";
import { LIGHTS_QUERY_KEY } from "../useLights";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function updateLightColor(lights: ILight[], lightId: string, color: IColor) {
  return lights.map((light) => {
    if (light.id === lightId) {
      return {
        ...light,
        color: {
          ...light.color,
          ...color,
        },
      } satisfies ILight;
    }
    return light;
  });
}

export function useColorMutation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ lightId, color }: { lightId: string; color: IColor }) =>
      setColor(lightId, color, token ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LIGHTS_QUERY_KEY, { token }],
      });

      setTimeout(async () => {
        await queryClient.refetchQueries([LIGHTS_QUERY_KEY, { token }]);
      }, 1000);
    },
    onMutate: async ({ lightId, color }) => {
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
          updateLightColor(previousLights, lightId, color)
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