import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 squircle-button text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-blue-100",
        outline: "border border-white/30 bg-transparent hover:bg-white/10",
        secondary: "bg-blue-600 text-white hover:bg-blue-500",
        ghost: "hover:bg-white/10",
        destructive: "bg-red-900 text-white hover:bg-red-800",
      },
      size: { default: "h-12 px-6", sm: "h-11 px-3", icon: "size-11" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
