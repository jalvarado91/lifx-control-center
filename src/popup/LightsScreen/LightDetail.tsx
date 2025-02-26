import { motion, useMotionValue, useTransform } from "framer-motion";
import { ILight, IColor } from "../lifxClient";
import { useRef, useEffect } from "react";
import classNames from "classnames";
import { Light } from "./Light";
import { useColorMutation } from "./useColorMutation";
import { useToggleLightMutation } from "./useToggleLightMutation";
import { useLights } from "../useLights";

interface LightDetailProps {
  light: ILight;
  onBack: () => void;
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
  const kelvin = lightColor.kelvin;
  // Base the lightness on both kelvin and saturation
  // At 0 saturation, we want white (100% lightness)
  // At full saturation, we want the kelvin-adjusted lightness
  const kelvinLightness = 100 * (1 - 1 / (kelvin / 4000 + 1));
  const lightness = kelvinLightness + ((100 - kelvinLightness) * (1 - lightColor.saturation));

  const hslColor = `hsl(${lightColor.hue.toFixed(0)},${
    lightColor.saturation * 100
  }%,${lightness}%)`;

  return hslColor;
}

export function LightDetail({ light: initialLight, onBack }: LightDetailProps) {
  const { data, isFetching } = useLights();
  // Get the latest light data from the query cache
  const light = data?.lights.find(l => l.id === initialLight.id) ?? initialLight;
  
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const kelvinSliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isKelvinDragging = useRef(false);
  const pendingColor = useRef<IColor | null>(null);
  const colorMutation = useColorMutation();
  const toggleLightMutation = useToggleLightMutation();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const kelvinX = useMotionValue(0);
  const kelvinColor = useMotionValue(kelvinToColor(light.color.kelvin));
  const currentColor = useMotionValue(lightColorToHslString(light.color));

  // Initialize knob position based on current color
  useEffect(() => {
    if (!colorWheelRef.current) return;
    const rect = colorWheelRef.current.getBoundingClientRect();
    const radius = (rect.width - 48) / 2;
    
    const hueRadians = ((light.color.hue - 90) * Math.PI) / 180;
    const saturationRadius = radius * light.color.saturation;
    
    // Position relative to center, then offset by knob size
    const newX = Math.cos(hueRadians) * saturationRadius;
    const newY = Math.sin(hueRadians) * saturationRadius;
    
    x.set(newX);
    y.set(newY);
  }, [light.color.hue, light.color.saturation, x, y]);

  // Initialize kelvin slider position
  useEffect(() => {
    if (!kelvinSliderRef.current) return;
    const rect = kelvinSliderRef.current.getBoundingClientRect();
    const minKelvin = light.product.capabilities.min_kelvin;
    const maxKelvin = light.product.capabilities.max_kelvin;
    const kelvinRange = maxKelvin - minKelvin;
    const position = ((light.color.kelvin - minKelvin) / kelvinRange) * (rect.width - 48);
    kelvinX.set(position);
    kelvinColor.set(kelvinToColor(light.color.kelvin));
  }, [light.color.kelvin, kelvinX, light.product.capabilities.min_kelvin, light.product.capabilities.max_kelvin]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col text-base h-full"
    >
      {/* Header */}
      <div className="flex items-center px-5 py-4 space-x-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-700 rounded transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="font-semibold">{light.label}</div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 space-y-6">
        {/* Light control */}
        <div className="w-full">
          <Light 
            light={light} 
            onToggle={() => toggleLightMutation.mutate(light.id)} 
            showLabel={false}
            isRefreshing={isFetching}
          />
        </div>

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
                isDragging.current = true;
              }}
              onDrag={(event, info) => {
                if (!colorWheelRef.current) return;

                const rect = colorWheelRef.current.getBoundingClientRect();
                const radius = (rect.width - 48) / 2;
                const center = rect.width / 2;
                
                // Calculate position relative to center
                const dx = info.point.x - rect.left - center;
                const dy = info.point.y - rect.top - center;
                
                // Calculate angle and constrained distance
                const angle = Math.atan2(dy, dx);
                const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
                
                // Position relative to center, no need to subtract knob size since we're using center-based positioning
                const newX = Math.cos(angle) * distance;
                const newY = Math.sin(angle) * distance;

                x.set(newX);
                y.set(newY);

                // Convert to hue (adjust by +90 degrees to match color wheel orientation)
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
                // Send the color update
                if (pendingColor.current) {
                  colorMutation.mutate({
                    lightId: light.id,
                    color: pendingColor.current,
                  });
                  pendingColor.current = null;
                }

                setTimeout(() => {
                  isDragging.current = false;
                }, 0);
              }}
              style={{ 
                x, 
                y,
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
                  
                  // Update the color preview if we're dragging the kelvin slider
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
  );
} 