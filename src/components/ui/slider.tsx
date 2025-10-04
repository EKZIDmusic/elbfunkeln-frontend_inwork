"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider@1.2.3";
import { motion } from "motion/react";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col group",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full shadow-inner transition-all duration-300 data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          "bg-elbfunkeln-beige/50 hover:bg-elbfunkeln-beige/70 hover:shadow-md",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full transition-all duration-500",
            "bg-gradient-to-r from-elbfunkeln-lavender to-elbfunkeln-rose shadow-sm",
            "hover:from-elbfunkeln-rose hover:to-elbfunkeln-lavender hover:shadow-lg",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className={cn(
            "block size-6 shrink-0 rounded-full border-2 shadow-lg transition-all duration-300 cursor-pointer",
            "border-elbfunkeln-green bg-white ring-elbfunkeln-lavender/30",
            "hover:ring-8 hover:shadow-xl hover:scale-125",
            "hover:bg-gradient-to-br hover:from-white hover:to-elbfunkeln-beige/30",
            "focus-visible:ring-8 focus-visible:outline-hidden focus-visible:scale-125",
            "active:scale-90 active:shadow-md",
            "disabled:pointer-events-none disabled:opacity-50",
            "transform-gpu will-change-transform",
          )}
          style={{
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };