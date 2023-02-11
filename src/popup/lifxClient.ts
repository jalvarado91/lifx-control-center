export async function getLights(token: string): Promise<ILight[]> {
  return fetch("https://api.lifx.com/v1/lights/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<ILight[]>);
}

export async function toggleLightPower(lightId: string, token: string) {
  return fetch(`https://api.lifx.com/v1/lights/id:${lightId}/toggle`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<ILight[]>);
}

export interface IGroup {
  id: string;
  name: string;
}

export interface ILocation {
  id: string;
  name: string;
}

export interface IProduct {
  name: string;
  identifier: string;
  company: string;
  vendor_id: number;
  product_id: number;
  capabilities: {
    has_color: boolean;
    has_variable_color_temp: boolean;
    has_ir: boolean;
    has_hev: boolean;
    has_chain: boolean;
    has_matrix: boolean;
    has_multizone: boolean;
    min_kelvin: number;
    max_kelvin: number;
  };
}

export interface IColor {
  hue: number;
  saturation: number;
  kelvin: number;
}

export interface ILight {
  id: string;
  uuid: string;
  label: string;
  connected: true;
  power: "on" | "off";
  color: IColor;
  brightness: number;
  group: IGroup;
  location: ILocation;
  product: IProduct;
  last_seen: string;
  seconds_since_seen: number;
}
