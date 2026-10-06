// Installed from shadcn Studio's tabs-29 registry; adapted to workspace navigation.
// Source: https://github.com/shadcnstudio/shadcn-studio/blob/main/src/components/shadcn-studio/tabs/tabs-29.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MessageSquare, NotebookPen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { name: "Chat", value: "chat", Icon: MessageSquare },
  { name: "Notebook", value: "notebook", Icon: NotebookPen },
];

export function WorkspaceTabs({
  value,
  onValueChange,
  notebookCount,
  ...props
}) {
  const tabRefs = useRef([]);
  const reduceMotion = useReducedMotion();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 4, width: 108 });

  useLayoutEffect(() => {
    const trigger =
      tabRefs.current[tabs.findIndex((tab) => tab.value === value)];
    if (trigger) {
      const measure = () =>
        setIndicatorStyle({
          left: trigger.offsetLeft,
          width: trigger.offsetWidth,
        });
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(trigger);
      return () => observer.disconnect();
    }
  }, [value]);

  return (
    <Tabs value={value} onValueChange={onValueChange} {...props}>
      <TabsList
        variant="line"
        aria-label="Research workspace"
        className="relative isolate grid !h-13 w-48 grid-cols-2 gap-0 !rounded-xl bg-muted p-1 min-[360px]:w-56"
      >
        {tabs.map(({ name, value: tabValue, Icon }, index) => (
          <TabsTrigger
            key={tabValue}
            value={tabValue}
            id={`workspace-${tabValue}-tab`}
            aria-controls={`workspace-${tabValue}-panel`}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            className="relative z-10 !h-11 gap-1 rounded-lg px-1 text-muted-foreground transition-colors after:hidden hover:text-foreground data-[state=active]:text-primary-foreground"
          >
            <Icon className="size-4" />
            {name}
            {tabValue === "notebook" && notebookCount > 0 && (
              <span
                className={
                  value === "notebook"
                    ? "ml-0.5 text-primary-foreground/85"
                    : "ml-0.5 text-muted-foreground"
                }
              >
                {notebookCount}
              </span>
            )}
          </TabsTrigger>
        ))}
        <motion.div
          aria-hidden="true"
          data-studio-tab-indicator=""
          className="pointer-events-none absolute top-1 z-0 h-11 rounded-lg bg-primary"
          initial={false}
          animate={indicatorStyle}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 40 }
          }
        />
      </TabsList>
    </Tabs>
  );
}
