import { IColor, ILight } from "../lifxClient";
import classNames from "classnames";
import { motion } from "framer-motion";

interface LightProps {
  light: ILight;
  onToggle: () => void;
}

function lightColorToHslString(lightColor: IColor) {
  const kelvin = lightColor.kelvin;
  const colorLightness = 100 * (1 - 1 / (kelvin / 4000 + 1));

  const hslColor = `hsl(${lightColor.hue.toFixed(0)},${
    lightColor.saturation * 100
  }%,${colorLightness}%)`;

  return hslColor;
}

export function Light({ light, onToggle }: LightProps) {
  const hslColor = lightColorToHslString(light.color);
  const isOn = light.power === "on";
  const isOff = light.power === "off";

  const brightness = light.brightness;

  return (
    <div
      key={light.id}
      className="flex flex-col space-y-1 w-full justify-between"
    >
      <div className="text-sm font-semibold">{light.label}</div>
      {/* <div className="text-sm">
                      Toggle is {light.power === "on" ? "on" : "off"} /{" "}
                      {light.color.hue}, {light.color.saturation},{" "}
                      {light.color.kelvin} / {brightness}
                    </div> */}
      <div className="relative flex w-full">
        <div className="absolute inset-0 rounded-full bg-[#121116]"></div>
        <button
          onClick={() => onToggle()}
          className={classNames(
            "min-w-fit h-11 rounded-full flex items-center px-2 relative"
            // isOn && "justify-end"
          )}
          style={{
            background: hslColor,
            width: `${brightness * 100}%`,
          }}
        >
          {isOn && (
            <div className="absolute inset-0 bg-black hover:shadow-inner transition-opacity opacity-25 hover:opacity-30 rounded-full"></div>
          )}
          <motion.div
            layout
            transition={{ ease: "easeInOut" }}
            style={{
              background: hslColor,
            }}
            className={classNames(
              "absolute inline-block border-2 border-white rounded-full h-8 w-8 m-2",
              isOn ? "right-0" : "left-0"
            )}
          ></motion.div>
          {isOff && (
            <div className="absolute hover:opacity-60 transition-opacity inset-0 bg-black opacity-70 rounded-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}
