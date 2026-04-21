import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "~/lib/utils";

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  scrollbars?: "vertical" | "horizontal" | "both";
};

function ScrollArea({
  className,
  children,
  scrollbars = "vertical",
  ...props
}: ScrollAreaProps) {
  const showHorizontalScrollbar =
    scrollbars === "horizontal" || scrollbars === "both";
  const showVerticalScrollbar =
    scrollbars === "vertical" || scrollbars === "both";

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit]
          transition-[color,box-shadow] outline-none focus-visible:ring-[3px]
          focus-visible:outline-1"
      >
        <ScrollAreaPrimitive.Content>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {showVerticalScrollbar && <ScrollBar orientation="vertical" />}
      {showHorizontalScrollbar && <ScrollBar orientation="horizontal" />}
      {scrollbars === "both" && <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        `flex touch-none p-px transition-colors select-none
        data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t
        data-horizontal:border-t-transparent data-vertical:h-full
        data-vertical:w-2.5 data-vertical:border-l
        data-vertical:border-l-transparent`,
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
