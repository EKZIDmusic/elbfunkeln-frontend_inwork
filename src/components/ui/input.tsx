import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border-2 border-elbfunkeln-green/20 bg-white px-3 py-2 text-sm text-elbfunkeln-green placeholder:text-elbfunkeln-green/50 transition-colors outline-none",
        "focus:border-elbfunkeln-lavender focus:ring-2 focus:ring-elbfunkeln-lavender/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
