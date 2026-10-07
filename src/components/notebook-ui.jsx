import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Notebook adaptations stay local so Chat can evolve independently.
export function NotebookButton({
  variant = "default",
  size = "default",
  static: isStatic = false,
  tooltip,
  className,
  ...props
}) {
  const tonal = variant === "tonal";
  const danger = variant === "danger-ghost";
  const tip = tooltip || (size.startsWith("icon") ? props["aria-label"] : null);
  const button = (
    <Button
      {...props}
      variant={tonal ? "secondary" : danger ? "ghost" : variant}
      size={size}
      data-notebook-action=""
      title={tip ? undefined : props.title}
      className={cn(
        "transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none",
        size === "default" && "h-10 px-4 has-[>svg]:px-4",
        size === "sm" && "h-8 gap-2 px-3 has-[>svg]:px-3",
        tonal &&
          "bg-accent text-accent-foreground hover:bg-primary/20 active:bg-primary/25",
        danger &&
          "text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20",
        !isStatic &&
          !props.asChild &&
          "active:scale-[0.96] motion-reduce:transform-none",
        className,
      )}
    />
  );
  return tip ? (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          sideOffset={6}
          className="max-w-64 px-3 py-2 text-xs leading-relaxed"
        >
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );
}

export function NotebookCount({ className, ...props }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md bg-white px-2 py-1 font-normal tabular-nums text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function NotebookActionGroup({ className, ...props }) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border border-border bg-white [&>[data-slot=button]]:rounded-none [&>[data-slot=button]:first-child]:rounded-s-md [&>[data-slot=button]:last-child]:rounded-e-md [&>[data-slot=button]:not(:first-child)]:border-s [&>[data-slot=button]]:relative [&>[data-slot=button]:focus-visible]:z-10",
        className,
      )}
      {...props}
    />
  );
}

export function NotebookInput({ className, ...props }) {
  return <Input className={cn("h-10 max-sm:min-h-11", className)} {...props} />;
}

export function NotebookHint({ children, className }) {
  return (
    <p
      role="note"
      className={cn("text-[14px] leading-5 text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}
export function NotebookCheckbox(props) {
  return (
    <CheckboxPrimitive.Root
      {...props}
      className={cn(
        "peer size-4 shrink-0 rounded border border-input bg-white outline-none transition-colors duration-150 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
        props.className,
      )}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center">
        <Check className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
