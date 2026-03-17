import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white",
        className
      )}
      {...props}
    />
  );
}

export { Badge };

