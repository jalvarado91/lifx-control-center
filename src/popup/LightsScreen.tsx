import { useAuth } from "./AuthContext";
import { Group } from "./lifxClient";
import { OvalSpinner } from "./OvalSpinner";
import { useLights } from "./useLights";

export function LightsScreen() {
  const { clearToken } = useAuth();
  const { isLoading, data } = useLights();

  const locations = data?.locations ?? [];

  return (
    <div className="flex flex-col text-base space-y-12 h-full justify-center items-center">
      {isLoading ? (
        <div className="text-center">
          <OvalSpinner />
        </div>
      ) : (
        <div className="flex flex-col space-y-12">
          {locations.map((location) => (
            <div key={location.id} className="flex flex-col space-y-4">
              <div className="text-xl font-bold">{location.name}</div>
            </div>
          ))}

          <div className="text-center">
            <h1 className="text-2xl font-bold">Lights</h1>
          </div>

          <div className="flex flex-col space-y-12">
            {data?.groups.map((group: Group) => (
              <div key={group.id} className="flex flex-col space-y-4">
                <div className="text-xl font-bold">{group.name}</div>
              </div>
            ))}
          </div>

          <button onClick={() => clearToken()}>Remove token</button>
        </div>
      )}
    </div>
  );
}
