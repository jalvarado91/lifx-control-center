import { IColor, ILight } from "../lifxClient";
import classNames from "classnames";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useBrightnessMutation } from "./useBrightnessMutation";
import { useColorMutation } from "./useColorMutation";
import { useRef, useEffect, useState } from "react";
import { useToggleLightMutation } from "./useToggleLightMutation";

interface LightProps {
  light: ILight;
  onToggle: () => void;
  showLabel?: boolean;
  isRefreshing?: boolean;
}

function kelvinToColor(kelvin: number): string {
  // Approximation of black body radiation colors
  if (kelvin < 2000) return '#FF3800';
  if (kelvin < 2500) return '#FF5300';
  if (kelvin < 3000) return '#FF7B00';
  if (kelvin < 3500) return '#FFA238';
  if (kelvin < 4000) return '#FFC184';
  if (kelvin < 4500) return '#FFD4B1';
  if (kelvin < 5000) return '#FFE1CD';
  if (kelvin < 5500) return '#FFF1E8';
  if (kelvin < 6000) return '#FFF9F5';
  if (kelvin < 6500) return '#F5F3FF';
  if (kelvin < 7000) return '#E5E7FF';
  if (kelvin < 7500) return '#D2D9FF';
  if (kelvin < 8000) return '#C5D1FF';
  if (kelvin < 8500) return '#BDD0FF';
  return '#B5CFFF';
}

function lightColorToHslString(lightColor: IColor) {
  // For saturated colors, we want a base lightness of 50%
  // For desaturated colors, we want to blend towards white based on kelvin
  const kelvinFactor = Math.min(1, lightColor.kelvin / 6500);
  const baseLight = 50;
  const whiteness = (1 - lightColor.saturation) * (100 - baseLight);
  const lightness = baseLight + whiteness * kelvinFactor;

  const hslColor = `hsl(${lightColor.hue.toFixed(0)},${
    lightColor.saturation * 100
  }%,${lightness}%)`;

  return hslColor;
}

export function Light({ light, onToggle, showLabel = true, isRefreshing = false }: LightProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hslColor = lightColorToHslString(light.color);
  const isOn = light.power === "on";
  const isOff = light.power === "off";
  const brightness = light.brightness;
  const brightnessMutation = useBrightnessMutation();
  const colorMutation = useColorMutation();
  const toggleMutation = useToggleLightMutation();
  const containerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const kelvinSliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isColorDragging = useRef(false);
  const isKelvinDragging = useRef(false);
  const lastBrightnessRef = useRef(brightness);
  const isUserInteraction = useRef(false);
  const pendingColor = useRef<IColor | null>(null);

  // Consider a light to be refreshing if either:
  // 1. The parent indicates it's refreshing (initial load)
  // 2. Any mutation affecting this specific light is in progress
  const isLightRefreshing = isRefreshing || 
    (brightnessMutation.isLoading && brightnessMutation.variables?.lightId === light.id) ||
    (colorMutation.isLoading && colorMutation.variables?.lightId === light.id) ||
    (toggleMutation.isLoading && toggleMutation.variables === light.id);

  // Brightness control motion values
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

  // Color wheel motion values
  const colorX = useMotionValue(0);
  const colorY = useMotionValue(0);
  const kelvinX = useMotionValue(0);
  const kelvinColor = useMotionValue(kelvinToColor(light.color.kelvin));
  const currentColor = useMotionValue(lightColorToHslString(light.color));

  // Initialize color wheel position
  useEffect(() => {
    if (!colorWheelRef.current || !isExpanded) return;

    // Use requestAnimationFrame to ensure the color wheel has been rendered and sized
    requestAnimationFrame(() => {
      const rect = colorWheelRef.current?.getBoundingClientRect();
      if (!rect) return;

      const radius = rect.width / 2;
      const hueRadians = ((light.color.hue - 90) * Math.PI) / 180;
      const saturationRadius = radius * light.color.saturation;
      
      // Subtract half the knob width (16px) to account for the centering CSS
      const newX = Math.cos(hueRadians) * saturationRadius - 16;
      const newY = Math.sin(hueRadians) * saturationRadius - 16;
      
      colorX.set(newX);
      colorY.set(newY);
    });
  }, [light.color.hue, light.color.saturation, colorX, colorY, isExpanded]);

  // Initialize kelvin slider position
  useEffect(() => {
    if (!kelvinSliderRef.current || !isExpanded) return;

    // Use requestAnimationFrame to ensure the slider has been rendered and sized
    requestAnimationFrame(() => {
      const rect = kelvinSliderRef.current?.getBoundingClientRect();
      if (!rect) return;

      const minKelvin = light.product.capabilities.min_kelvin;
      const maxKelvin = light.product.capabilities.max_kelvin;
      const kelvinRange = maxKelvin - minKelvin;
      const position = ((light.color.kelvin - minKelvin) / kelvinRange) * (rect.width - 48);
      kelvinX.set(position);
      kelvinColor.set(kelvinToColor(light.color.kelvin));
    });
  }, [light.color.kelvin, kelvinX, light.product.capabilities.min_kelvin, light.product.capabilities.max_kelvin, isExpanded]);

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
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
          >
            <motion.svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M8 3V13M13 8H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </motion.svg>
          </button>
        </div>
      )}

      {/* Brightness control */}
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
            animate={isLightRefreshing ? {
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

      {/* Color controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pt-4">
              {/* Color wheel */}
              <div className="relative aspect-square w-full">
                <div 
                  ref={colorWheelRef}
                  style={{
                    background: "conic-gradient(from 0deg, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  }}
                  className="absolute inset-0 rounded-full"
                >
                  {/* Saturation overlay */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle at center, white 0%, transparent 70%)"
                    }}
                  />

                  {/* Color picker knob */}
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDragStart={() => {
                      isColorDragging.current = true;
                    }}
                    onDrag={(event, info) => {
                      if (!colorWheelRef.current) return;

                      const rect = colorWheelRef.current.getBoundingClientRect();
                      const radius = rect.width / 2;
                      const center = rect.width / 2;
                      
                      // Calculate position relative to center
                      const dx = info.point.x - rect.left - center;
                      const dy = info.point.y - rect.top - center;
                      
                      // Calculate angle and constrained distance
                      const angle = Math.atan2(dy, dx);
                      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
                      
                      // Subtract half the knob width (16px) to account for the centering CSS
                      const newX = Math.cos(angle) * distance - 16;
                      const newY = Math.sin(angle) * distance - 16;

                      colorX.set(newX);
                      colorY.set(newY);

                      const hue = (((angle * 180) / Math.PI + 90 + 360) % 360);
                      const saturation = Math.min(distance / radius, 1);
                      
                      const previewColor = {
                        hue,
                        saturation,
                        kelvin: light.color.kelvin,
                      };
                      currentColor.set(lightColorToHslString(previewColor));
                      pendingColor.current = previewColor;
                    }}
                    onDragEnd={() => {
                      if (pendingColor.current) {
                        colorMutation.mutate({
                          lightId: light.id,
                          color: pendingColor.current,
                        });
                        pendingColor.current = null;
                      }
                      setTimeout(() => {
                        isColorDragging.current = false;
                      }, 0);
                    }}
                    style={{ 
                      x: colorX, 
                      y: colorY,
                      backgroundColor: currentColor,
                    }}
                    className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full border-2 border-white cursor-grab active:cursor-grabbing"
                  >
                    <div className="absolute inset-1 rounded-full border border-zinc-200/30" />
                  </motion.div>
                </div>
              </div>

              {/* Kelvin temperature control */}
              <div className="relative h-11 w-full">
                <div className="absolute inset-0 rounded-full bg-[#121116]" />
                <div
                  ref={kelvinSliderRef}
                  className="min-w-fit h-11 rounded-full flex items-center px-2 relative w-full overflow-hidden"
                >
                  {/* Temperature gradient background */}
                  <div 
                    className="absolute inset-0 rounded-full" 
                    style={{
                      background: `linear-gradient(to right, ${kelvinToColor(light.product.capabilities.min_kelvin)}, ${kelvinToColor(light.product.capabilities.max_kelvin)})`
                    }}
                  />
                  <div className="absolute inset-0 bg-black hover:shadow-inner transition-opacity opacity-25 hover:opacity-30 rounded-full" />

                  {/* Drag constraints container */}
                  <div className="absolute inset-x-2 inset-y-0">
                    {/* Kelvin knob */}
                    <motion.div
                      drag="x"
                      dragMomentum={false}
                      dragElastic={0}
                      dragConstraints={{ left: 0, right: kelvinSliderRef.current?.clientWidth ? kelvinSliderRef.current.clientWidth - 48 : 0 }}
                      style={{
                        x: kelvinX,
                        backgroundColor: kelvinColor,
                      }}
                      onDragStart={() => {
                        isKelvinDragging.current = true;
                      }}
                      onDrag={(event, info) => {
                        if (!kelvinSliderRef.current) return;
                        const rect = kelvinSliderRef.current.getBoundingClientRect();
                        const minKelvin = light.product.capabilities.min_kelvin;
                        const maxKelvin = light.product.capabilities.max_kelvin;
                        const kelvinRange = maxKelvin - minKelvin;
                        
                        const newX = Math.max(0, Math.min(rect.width - 48, info.point.x - rect.left - 24));
                        kelvinX.set(newX);
                        
                        const newKelvin = Math.round(minKelvin + (newX / (rect.width - 48)) * kelvinRange);
                        kelvinColor.set(kelvinToColor(newKelvin));
                        
                        const previewColor = {
                          hue: light.color.hue,
                          saturation: light.color.saturation,
                          kelvin: newKelvin,
                        };
                        currentColor.set(lightColorToHslString(previewColor));
                        
                        pendingColor.current = previewColor;
                      }}
                      onDragEnd={() => {
                        if (pendingColor.current) {
                          colorMutation.mutate({
                            lightId: light.id,
                            color: pendingColor.current,
                          });
                          pendingColor.current = null;
                        }
                        setTimeout(() => {
                          isKelvinDragging.current = false;
                        }, 0);
                      }}
                      className="absolute inline-block border-2 border-white rounded-full h-8 w-8 my-2 cursor-grab active:cursor-grabbing z-10"
                    >
                      <div className="absolute inset-1 rounded-full border border-zinc-200/30" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
