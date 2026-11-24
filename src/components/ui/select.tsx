"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "~/lib/utils";

export const Select: typeof SelectPrimitive.Root = SelectPrimitive.Root;

const triggerSizeClass = {
  default: "",
  lg: "min-h-10",
  sm: "min-h-7 px-2.5",
} as const;

export function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: keyof typeof triggerSizeClass;
}): React.ReactElement {
  return (
    <SelectPrimitive.Trigger
      className={cn("select-trigger", triggerSizeClass[size], className)}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({
  className,
  ...props
}: SelectPrimitive.Value.Props): React.ReactElement {
  return (
    <SelectPrimitive.Value
      className={cn("flex-1 truncate data-placeholder:text-faint", className)}
      data-slot="select-value"
      {...props}
    />
  );
}

/**
 * Keeps the list's highlight bar on the highlighted item. Base UI marks that
 * item with `data-highlighted`; the bar is one element that slides between
 * items, so its position is published as custom properties on the list.
 */
function trackHighlight(list: HTMLElement | null) {
  if (!list) return;

  const update = () => {
    const item = list.querySelector<HTMLElement>("[data-highlighted]");
    if (!item) {
      // The pointer crossing the gap between two items clears the highlight
      // for a moment. Keep the bar's position so it can slide on from there.
      if (list.hasAttribute("data-highlight")) {
        list.setAttribute("data-highlight", "resting");
      }
      return;
    }
    // The bar appears in place the first time; after that it slides.
    const state = list.hasAttribute("data-highlight") ? "moving" : "placed";
    list.style.setProperty("--highlight-top", `${item.offsetTop}px`);
    list.style.setProperty("--highlight-height", `${item.offsetHeight}px`);
    list.setAttribute("data-highlight", state);
  };

  const observer = new MutationObserver(update);
  observer.observe(list, {
    attributes: true,
    attributeFilter: ["data-highlighted"],
    subtree: true,
  });
  update();

  return () => observer.disconnect();
}

const scrollArrowClass =
  "z-50 flex h-6 w-full cursor-default items-center justify-center bg-surface-1 text-muted-foreground";

export function SelectPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  anchor,
  portalProps,
  ...props
}: SelectPrimitive.Popup.Props & {
  portalProps?: SelectPrimitive.Portal.Props;
  side?: SelectPrimitive.Positioner.Props["side"];
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
  align?: SelectPrimitive.Positioner.Props["align"];
  alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"];
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"];
  anchor?: SelectPrimitive.Positioner.Props["anchor"];
}): React.ReactElement {
  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className="select-popup"
          data-slot="select-popup"
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className={cn(scrollArrowClass, "top-0")}
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List
            ref={trackHighlight}
            className={cn("select-list", className)}
            data-slot="select-list"
          >
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow
            className={cn(scrollArrowClass, "bottom-0")}
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props): React.ReactElement {
  return (
    <SelectPrimitive.Item
      className={cn("select-item", className)}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemText className="wrap-anywhere min-w-0 flex-1">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectGroup(
  props: SelectPrimitive.Group.Props,
): React.ReactElement {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectGroupLabel(
  props: SelectPrimitive.GroupLabel.Props,
): React.ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      className="pixel-11 px-3 py-2 text-faint uppercase"
      data-slot="select-group-label"
      {...props}
    />
  );
}

export { SelectPrimitive };
