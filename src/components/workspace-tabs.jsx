import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, MessageSquare, NotebookPen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WorkspaceTabs({
  value,
  onValueChange,
  notebookCount,
  ...props
}) {
  const listRef = useRef(null);
  const keyboardNavigation = useRef(false);
  const reducedMotion = useReducedMotion();
  const [indicator, setIndicator] = useState(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    const trigger = list?.querySelector('[data-state="active"]');
    if (!trigger) return;
    const measure = () =>
      setIndicator({
        left: trigger.offsetLeft,
        top: trigger.offsetTop,
        width: trigger.offsetWidth,
        height: trigger.offsetHeight,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [value]);
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      onPointerDownCapture={() => {
        keyboardNavigation.current = false;
      }}
      onKeyDownCapture={(event) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          keyboardNavigation.current = true;
        }
      }}
      {...props}
    >
      <TabsList
        ref={listRef}
        aria-label="Research workspace"
        className="relative isolate grid w-[calc(100vw-2rem)] max-w-[360px] grid-cols-3 group-data-[orientation=horizontal]/tabs:h-10 max-sm:group-data-[orientation=horizontal]/tabs:h-13 sm:w-[360px]"
      >
        {indicator && (
          <motion.div
            aria-hidden="true"
            data-active-tab-indicator=""
            className="pointer-events-none absolute z-0 rounded-md bg-background shadow-sm"
            initial={false}
            animate={indicator}
            transition={
              reducedMotion || keyboardNavigation.current
                ? { duration: 0 }
                : { duration: 0.22, ease: [0.32, 0.72, 0, 1] }
            }
          />
        )}
        <TabsTrigger
          className="relative z-10 transition-colors hover:text-primary [&:hover_span]:text-primary data-[state=active]:bg-transparent group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none"
          value="chat"
          id="workspace-chat-tab"
          aria-controls="workspace-chat-panel"
        >
          <MessageSquare />
          Chat
        </TabsTrigger>
        <TabsTrigger
          className="relative z-10 transition-colors hover:text-primary [&:hover_span]:text-primary data-[state=active]:bg-transparent group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none"
          value="scenarios"
          id="workspace-scenarios-tab"
          aria-controls="workspace-scenarios-panel"
        >
          <LayoutGrid />
          Scenarios
        </TabsTrigger>
        <TabsTrigger
          className="relative z-10 transition-colors hover:text-primary [&:hover_span]:text-primary data-[state=active]:bg-transparent group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none"
          value="notebook"
          id="workspace-notebook-tab"
          aria-controls="workspace-notebook-panel"
        >
          <NotebookPen />
          Notebook
          {notebookCount > 0 && (
            <span className="hidden tabular-nums sm:inline">
              {notebookCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
