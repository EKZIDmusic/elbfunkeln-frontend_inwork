import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-md border-2 border-elbfunkeln-green/20 bg-white px-3 py-2 text-sm text-elbfunkeln-green placeholder:text-elbfunkeln-green/50 transition-colors outline-none resize-none",
        "focus:border-elbfunkeln-lavender focus:ring-2 focus:ring-elbfunkeln-lavender/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
