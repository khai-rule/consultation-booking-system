import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-body font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" && "bg-primary text-primary-fg hover:bg-primary-hover",
          variant === "secondary" && "bg-surface-sunken text-foreground hover:bg-border",
          variant === "ghost" && "hover:bg-surface-sunken",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

