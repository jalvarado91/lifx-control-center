export async function getLights(token: string): Promise<Light[]> {
  return fetch("https://api.lifx.com/v1/lights/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<Light[]>);
}

export interface Group {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Product {
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

export interface Color {
  hue: number;
  saturation: number;
  kelvin: number;
}

export interface Light {
  id: string;
  uuid: string;
  label: string;
  connected: true;
  power: "on" | "off";
  color: Color;
  brightness: number;
  group: Group;
  location: Location;
  product: Product;
  last_seen: string;
  seconds_since_seen: number;
}
