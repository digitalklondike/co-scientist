import { useEffect, useId, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toaster as Sonner } from "sonner";

const notificationTones = {
  success: {
    Icon: CircleCheckIcon,
    icon: "bg-emerald-50 text-emerald-700",
  },
  info: { Icon: InfoIcon, icon: "bg-accent text-primary" },
  warning: {
    Icon: TriangleAlertIcon,
    icon: "bg-amber-50 text-amber-700",
  },
  error: {
    Icon: OctagonXIcon,
    icon: "bg-destructive/10 text-destructive",
  },
};

export function NotificationToast({
  text,
  description,
  type = "success",
  action,
  duration = 5500,
  onDismiss,
}) {
  const titleId = useId();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [keptOpen, setKeptOpen] = useState(false);
  const [seconds, setSeconds] = useState(Math.ceil((duration || 0) / 1000));
  const remaining = useMotionValue(1);
  const reducedMotion = useReducedMotion();
  const hasDetails =
    typeof description === "string" && description.trim().length > 0;
  const paused = hovered || focused || expanded || keptOpen;
  const timed = Number.isFinite(duration) && duration > 0;
  const tone = notificationTones[type] || notificationTones.info;
  const { Icon } = tone;

  useMotionValueEvent(remaining, "change", (value) => {
    if (timed) setSeconds(Math.ceil((value * duration) / 1000));
  });

  useEffect(() => {
    if (!timed || paused) return;
    const countdown = animate(remaining, 0, {
      duration: (remaining.get() * duration) / 1000,
      ease: "linear",
      onComplete: onDismiss,
    });
    return () => countdown.stop();
  }, [duration, onDismiss, paused, remaining, timed]);

  return (
    <div
      data-testid="product-toast"
      data-notification-type={type}
      aria-labelledby={titleId}
      className="w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Accordion
        type="single"
        collapsible
        value={expanded ? "details" : ""}
        onValueChange={(value) => setExpanded(value === "details")}
      >
        <AccordionItem value="details" className="border-0">
          <div
            className={cn(
              "grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 p-4",
              action && "sm:grid-cols-[28px_minmax(0,1fr)_auto_auto]",
            )}
          >
            <Badge
              variant="secondary"
              aria-hidden="true"
              className={cn(
                "col-start-1 row-start-1 flex size-7 items-center justify-center rounded-full border-0 p-0",
                tone.icon,
              )}
            >
              <Icon className="size-4" />
            </Badge>
            <p
              id={titleId}
              className="col-start-2 row-start-1 min-w-0 break-words text-base font-medium leading-6"
            >
              {text}
            </p>
            {action && (
              <Button
                variant="secondary"
                size="sm"
                className="col-start-2 row-start-2 justify-self-start text-primary sm:col-start-3 sm:row-start-1"
                onClick={() => {
                  action.run();
                  onDismiss();
                }}
              >
                {action.label}
              </Button>
            )}
            <div
              className={cn(
                "col-start-3 row-start-1 -mr-1 flex items-center gap-1",
                action && "sm:col-start-4",
              )}
            >
              {hasDetails && (
                <AccordionTrigger
                  aria-label={
                    expanded
                      ? "Hide notification details"
                      : "Show notification details"
                  }
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "flex-none items-center justify-center p-0 text-muted-foreground hover:no-underline max-sm:min-h-11 max-sm:min-w-11 [&>svg]:translate-y-0 motion-reduce:[&>svg]:transition-none",
                  )}
                >
                  <span className="sr-only">Notification details</span>
                </AccordionTrigger>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss notification"
                className="text-muted-foreground"
                onClick={onDismiss}
              >
                <X />
              </Button>
            </div>
          </div>
          {hasDetails && (
            <AccordionContent className="bg-secondary px-4 py-4 pl-14 text-base leading-relaxed text-muted-foreground">
              {description}
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
      {timed && (
        <div
          className={cn(
            "space-y-3 px-4 pb-4",
            hasDetails && expanded && "bg-secondary",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pl-10 text-xs leading-4 text-muted-foreground">
            <span aria-hidden="true">
              {keptOpen
                ? "Auto-close stopped"
                : paused
                  ? "Timer paused"
                  : `Closes in ${seconds}s`}
            </span>
            <Button
              variant="secondary"
              size="xs"
              aria-label={
                keptOpen
                  ? "Allow notification to close automatically"
                  : "Keep notification open"
              }
              className={cn(
                "text-primary",
                hasDetails && expanded && "bg-background",
              )}
              onClick={() => setKeptOpen((previous) => !previous)}
            >
              {keptOpen ? "Allow auto-close" : "Keep open"}
            </Button>
          </div>
          <div
            aria-hidden="true"
            className={cn(
              "h-1 overflow-hidden rounded-full bg-secondary",
              hasDetails && expanded && "bg-background",
            )}
          >
            <motion.div
              className="h-full origin-left rounded-full bg-primary"
              style={{
                scaleX: reducedMotion
                  ? seconds / Math.ceil(duration / 1000)
                  : remaining,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function Toaster(props) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={{ "--width": "420px", "--font-sans": "var(--font-sans)" }}
      toastOptions={{
        unstyled: true,
        style: {
          width: "var(--width)",
          maxWidth:
            "calc(100vw - var(--mobile-offset-left) - var(--mobile-offset-right))",
          padding: 0,
          border: 0,
          background: "transparent",
          boxShadow: "none",
        },
      }}
      {...props}
    />
  );
}
