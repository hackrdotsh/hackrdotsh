"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";

// Styles live in design-system.css; `destructive-outline` and `outline` keep
// their COSS names so callers can stay on the library's vocabulary.
export const buttonVariants = cva("btn", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "",
      icon: "btn-icon",
      "icon-lg": "btn-icon btn-lg",
      "icon-sm": "btn-icon btn-sm",
      "icon-xl": "btn-icon btn-xl",
      "icon-xs": "btn-icon btn-xs",
      lg: "btn-lg",
      sm: "btn-sm",
      xl: "btn-xl",
      xs: "btn-xs",
    },
    variant: {
      default: "btn-primary",
      destructive: "btn-danger",
      "destructive-outline": "btn-danger",
      ghost: "btn-ghost",
      link: "btn-link",
      outline: "btn-secondary",
      secondary: "btn-secondary",
    },
  },
});

export interface ButtonProps extends useRender.ComponentProps<"button"> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled: boolean = Boolean(loading || disabledProp);
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}
