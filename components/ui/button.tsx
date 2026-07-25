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
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" && "bg-slate-900 text-white hover:bg-slate-700",
          variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200",
          variant === "ghost" && "hover:bg-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
