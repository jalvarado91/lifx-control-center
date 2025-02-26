import { IColor, ILight } from "../lifxClient";
import classNames from "classnames";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useBrightnessMutation } from "./useBrightnessMutation";
import { useRef, useEffect } from "react";

interface LightProps {
  light: ILight;
  onToggle: () => void;
  onDetailClick?: () => void;
  showLabel?: boolean;
  isRefreshing?: boolean;
}

function lightColorToHslString(lightColor: IColor) {
  const kelvin = lightColor.kelvin;
  const colorLightness = 100 * (1 - 1 / (kelvin / 4000 + 1));

  const hslColor = `hsl(${lightColor.hue.toFixed(0)},${
    lightColor.saturation * 100
  }%,${colorLightness}%)`;

  return hslColor;
}

export function Light({ light, onToggle, onDetailClick, showLabel = true, isRefreshing = false }: LightProps) {
  const hslColor = lightColorToHslString(light.color);
  const isOn = light.power === "on";
  const isOff = light.power === "off";
  const brightness = light.brightness;
  const brightnessMutation = useBrightnessMutation();
  const containerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastBrightnessRef = useRef(brightness);
  const isUserInteraction = useRef(false);

  const x = useMotionValue(0);
  const constrainedX = useTransform(x, value => {
    if (!containerRef.current) return value;
    const maxX = containerRef.current.clientWidth - 48;
    return Math.max(0, Math.min(maxX, value));
  });
  const normalizedBrightness = useTransform(x, 
    [0, containerRef.current?.clientWidth ? containerRef.current.clientWidth - 48 : 100], 
    [0, 1]
  );
  const backgroundWidth = useTransform(constrainedX, x => `${(x + 48) / (containerRef.current?.clientWidth || 1) * 100}%`);

  // Handle power state changes
  useEffect(() => {
    if (!containerRef.current || !isUserInteraction.current) return;
    const width = containerRef.current.clientWidth;
    
    if (isOn) {
      // Animate to the last known brightness position
      animate(x, (width - 48) * lastBrightnessRef.current, {
        type: "spring",
        damping: 25,
        stiffness: 200,
      });
    } else {
      // Store the current brightness before going to zero
      lastBrightnessRef.current = normalizedBrightness.get();
      animate(x, 0, {
        type: "spring",
        damping: 25,
        stiffness: 200,
      });
    }
    isUserInteraction.current = false;
  }, [isOn, normalizedBrightness, x]);

  // Handle resize and initial position
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updatePosition = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (isOn) {
        x.set((width - 48) * brightness);
      } else {
        x.set(0);
      }
    };

    // Update position initially and on resize
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [brightness, x, isOn]);

  return (
    <div
      key={light.id}
      className="flex flex-col space-y-1 w-full justify-between"
    >
      {showLabel && (
        <div className="flex justify-between items-center">
          <div className="text-sm font-semibold">{light.label}</div>
          {onDetailClick && (
            <button
              onClick={onDetailClick}
              className="p-1 hover:bg-zinc-700 rounded transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M13 8H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
      {/* <div className="text-sm">
            Toggle is {light.power === "on" ? "on" : "off"} /{" "}
            {light.color.hue}, {light.color.saturation},{" "}
            {light.color.kelvin} / {brightness}
          </div> */}
      {/* Container */}
      <div className="relative flex w-full">
        <div className="absolute inset-0 rounded-full bg-[#121116]"></div>
        <div
          ref={containerRef}
          className={classNames(
            "min-w-fit h-11 rounded-full flex items-center px-2 relative w-full overflow-hidden"
          )}
        >
          {/* on-part background */}
          <motion.div 
            className="absolute inset-0 rounded-full" 
            style={{
              background: hslColor,
              width: backgroundWidth,
            }}
            animate={isRefreshing ? {
              opacity: [1, 0.7, 1],
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }
            } : {
              opacity: 1
            }}
          />
          {isOn && (
            <div className="absolute inset-0 bg-black hover:shadow-inner transition-opacity opacity-25 hover:opacity-30 rounded-full"></div>
          )}
          {/* Drag constraints container */}
          <div 
            ref={constraintsRef} 
            className="absolute inset-x-2 inset-y-0"
          >
            {/* Knob */}
            <motion.div
              drag="x"
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={constraintsRef}
              style={{
                background: hslColor,
                x: constrainedX,
              }}
              onDragStart={() => {
                isDragging.current = true;
              }}
              onDrag={(event, info) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const newX = info.point.x - rect.left - 24;
                x.set(newX);
              }}
              onDragEnd={() => {
                const newBrightness = normalizedBrightness.get();
                brightnessMutation.mutate({ lightId: light.id, brightness: newBrightness });
                // Reset drag state after a short delay to allow the click event to check it
                setTimeout(() => {
                  isDragging.current = false;
                }, 0);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDragging.current) {
                  isUserInteraction.current = true;
                  onToggle();
                }
              }}
              className={classNames(
                "absolute inline-block border-2 border-white rounded-full h-8 w-8 my-2 cursor-grab active:cursor-grabbing z-10"
              )}
            ></motion.div>
          </div>
          {isOff && (
            <div className="absolute hover:opacity-60 transition-opacity inset-0 bg-black opacity-70 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}
