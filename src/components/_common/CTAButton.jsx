"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CTAButton (Tailwind-safe)
 *
 * Uses VARIANT_COLOR_CLASSES to avoid runtime class name generation so Tailwind
 * can produce all required CSS at build-time.
 */
export default function CTAButton({
  as = "button",
  href,
  target,
  variant = "solid",
  color = "black",
  size = "md",
  shape = "square",
  leftIcon,
  rightIcon,
  onlyIcon = false,
  loading = false,
  loadingSize = "h-4 w-4",
  disabled = false,
  children,
  className,
  textClassName,
  onClick,
  ariaLabel,
  ...props
}) {
  // shapes & sizes
  const shapeMap = {
    rounded: "rounded-lg",
    pill: "rounded-full",
    square: "rounded-none",
  };
  const shapeCls = shapeMap[shape] ?? shapeMap.rounded;
  const sizeMap = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };
  const sizeCls = sizeMap[size] ?? sizeMap.md;

  // A static map of classes for each variant + color
  // (Literal strings so Tailwind picks them up)
  const VARIANT_COLOR_CLASSES = {
    solid: {
      primary: "bg-sky-600 text-white hover:bg-sky-700 border-transparent",
      danger: "bg-red-600 text-white hover:bg-red-700 border-transparent",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent",
      warning: "bg-amber-500 text-white hover:bg-amber-600 border-transparent",
      neutral: "bg-gray-800 text-white hover:bg-gray-900 border-transparent",
      gold: "bg-[#c38e1e] text-white hover:bg-[#b77a1e] border-transparent",
      black: "bg-black text-white hover:bg-neutral-900 border-transparent",
      white: "bg-white text-gray-900 hover:bg-gray-50 border-transparent",
    },
    outline: {
      primary:
        "bg-transparent text-sky-600 border border-sky-600 hover:bg-sky-700 hover:text-white",
      danger:
        "bg-transparent text-red-600 border border-red-600 hover:bg-red-700 hover:text-white",
      success:
        "bg-transparent text-emerald-600 border border-emerald-600 hover:bg-emerald-700 hover:text-white",
      warning:
        "bg-transparent text-amber-500 border border-amber-500 hover:bg-amber-600 hover:text-white",
      neutral:
        "bg-transparent text-gray-800 border border-gray-800 hover:bg-gray-800 hover:text-white",
      gold: "bg-transparent text-[#c38e1e] border border-[#c38e1e] hover:bg-[#b77a1e] hover:text-white",
      black:
        "bg-transparent text-black border border-black hover:bg-neutral-900 hover:text-white",
      white:
        "bg-transparent text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-gray-900",
    },
    ghost: {
      primary:
        "bg-transparent text-sky-600 hover:bg-gray-100 border-transparent",
      danger:
        "bg-transparent text-red-600 hover:bg-gray-100 border-transparent",
      success:
        "bg-transparent text-emerald-600 hover:bg-gray-100 border-transparent",
      warning:
        "bg-transparent text-amber-500 hover:bg-gray-100 border-transparent",
      neutral:
        "bg-transparent text-gray-800 hover:bg-gray-100 border-transparent",
      gold: "bg-transparent text-[#c38e1e] hover:bg-gray-100 border-transparent",
      black: "bg-transparent text-black hover:bg-gray-100 border-transparent",
      white:
        "bg-transparent text-gray-900 hover:bg-gray-100 border-transparent",
    },
    text: {
      primary:
        "bg-transparent text-sky-600 hover:opacity-70 border-transparent",
      danger: "bg-transparent text-red-600 hover:opacity-70 border-transparent",
      success:
        "bg-transparent text-emerald-600 hover:opacity-70 border-transparent",
      warning:
        "bg-transparent text-amber-500 hover:opacity-70 border-transparent",
      neutral:
        "bg-transparent text-gray-800 hover:opacity-70 border-transparent",
      gold: "bg-transparent text-[#c38e1e] hover:opacity-70 border-transparent",
      black: "bg-transparent text-black hover:opacity-70 border-transparent",
      white: "bg-transparent text-gray-900 hover:opacity-70 border-transparent",
    },
    subtle: {
      primary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      danger: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      success: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      warning: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      neutral: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      gold: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      black: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
      white: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent",
    },
    gradient: {
      // you can refine per color if you want color-specific gradients
      primary:
        "bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:opacity-90 border-transparent",
      danger:
        "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 border-transparent",
      success:
        "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 border-transparent",
      warning:
        "bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:opacity-90 border-transparent",
      neutral:
        "bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:opacity-90 border-transparent",
      gold: "bg-gradient-to-r from-[#c38e1e] to-[#b77a1e] text-white hover:opacity-90 border-transparent",
      black:
        "bg-gradient-to-r from-black to-neutral-900 text-white hover:opacity-90 border-transparent",
      white:
        "bg-gradient-to-r from-gray-50 to-white text-gray-900 hover:opacity-95 border-transparent",
    },
  };

  // safe fallback: if variant/color combo missing, fallback to neutral solid
  const colorVariantClasses =
    VARIANT_COLOR_CLASSES[variant] && VARIANT_COLOR_CLASSES[variant][color]
      ? VARIANT_COLOR_CLASSES[variant][color]
      : VARIANT_COLOR_CLASSES["solid"]["black"];

  // spinner color heuristic
  const spinnerColor =
    variant === "outline" ||
    variant === "subtle" ||
    variant === "ghost" ||
    variant === "text"
      ? "text-gray-800"
      : "text-white";

  const iconLeftCls = !onlyIcon && leftIcon ? "mr-2" : "";
  const iconRightCls = !onlyIcon && rightIcon ? "ml-2" : "";

  const finalClass = cn(
    shapeCls,
    sizeCls,
    "inline-flex items-center justify-center gap-0 transition-colors duration-150 cursor-pointer",
    colorVariantClasses,
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  const content = (
    <>
      {loading && (
        <Loader2
          className={cn(
            loadingSize,
            spinnerColor,
            "animate-spin",
            !onlyIcon && "mr-2"
          )}
          aria-hidden="true"
        />
      )}

      {!loading && leftIcon && (
        <span className={cn(iconLeftCls)}>{leftIcon}</span>
      )}

      {!onlyIcon && (
        <span className={cn("leading-none", textClassName)}>{children}</span>
      )}

      {!loading && rightIcon && (
        <span className={cn(iconRightCls)}>{rightIcon}</span>
      )}
    </>
  );

  if (onlyIcon && !ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn(
      "CTAButton: 'onlyIcon' is true but no 'ariaLabel' provided for accessibility."
    );
  }

  if (as === "link" && href) {
    return (
      <Button
        asChild
        disabled={disabled || loading}
        className={finalClass}
        {...props}
      >
        <Link
          href={href}
          onClick={onClick}
          aria-label={onlyIcon ? ariaLabel : undefined}
        >
          <span className="inline-flex items-center">{content}</span>
        </Link>
      </Button>
    );
  }

  if (as === "anchor" && href) {
    return (
      <Button
        asChild
        disabled={disabled || loading}
        className={finalClass}
        {...props}
      >
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          onClick={onClick}
          aria-label={onlyIcon ? ariaLabel : undefined}
        >
          <span className="inline-flex items-center">{content}</span>
        </a>
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled || loading}
      onClick={onClick}
      className={finalClass}
      aria-busy={loading ? "true" : undefined}
      aria-label={onlyIcon ? ariaLabel : undefined}
      {...props}
    >
      {content}
    </Button>
  );
}
