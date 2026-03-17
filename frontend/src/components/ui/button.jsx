import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  base:
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[#0a0a0f]",
  variants: {
    default: "bg-white text-black hover:bg-white/90",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-white/20 bg-transparent hover:bg-white/10 text-white",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    ghost: "bg-transparent hover:bg-white/10 text-white",
    link: "bg-transparent underline-offset-4 hover:underline text-purple-300",
  },
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  },
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        buttonVariants.base,
        buttonVariants.variants[variant] || buttonVariants.variants.default,
        buttonVariants.sizes[size] || buttonVariants.sizes.default,
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };

