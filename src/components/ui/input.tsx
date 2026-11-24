"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";
import { cn } from "~/lib/utils";

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "size"
> & {
  size?: "sm" | "default" | "lg" | number;
  unstyled?: boolean;
  nativeInput?: boolean;
};

export function Input({
  className,
  size = "default",
  unstyled = false,
  nativeInput = false,
  ...props
}: InputProps): React.ReactElement {
  const inputClassName = cn(
    "h-9 w-full min-w-0 bg-transparent px-3 outline-none placeholder:text-faint",
    size === "sm" && "h-7 px-2.5",
    size === "lg" && "h-10",
    props.type === "search" &&
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
    props.type === "file" &&
      "text-muted-foreground file:me-3 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
  );

  return (
    <span
      className={
        cn(
          !unstyled &&
            "relative inline-flex w-full bg-surface-2 text-foreground text-sm hover:bg-surface-3 has-focus-visible:bg-surface-2 has-focus-visible:outline-2 has-focus-visible:outline-accent has-aria-invalid:outline-2 has-aria-invalid:outline-danger has-disabled:opacity-50",
          className,
        ) || undefined
      }
      data-size={size}
      data-slot="input-control"
    >
      {nativeInput ? (
        (() => {
          const { style, ...rest } = props;
          return (
            <input
              className={inputClassName}
              data-slot="input"
              size={typeof size === "number" ? size : undefined}
              style={typeof style === "function" ? undefined : style}
              {...rest}
            />
          );
        })()
      ) : (
        <InputPrimitive
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          {...props}
        />
      )}
    </span>
  );
}

export { InputPrimitive };
