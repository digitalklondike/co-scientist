import { useEffect, useRef, useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";

export function AnswerSelection({ children, onSave }) {
  const root = useRef(null);
  const anchor = useRef(null);
  const action = useRef(null);
  const [selection, setSelection] = useState(null);
  useEffect(() => {
    const read = (event) => {
      if (event.key === "Escape") return setSelection(null);
      if (event.key === "Tab") return;
      const selected = window.getSelection();
      if (!selected?.rangeCount || selected.isCollapsed)
        return setSelection(null);
      const range = selected.getRangeAt(0);
      if (
        !root.current?.contains(range.startContainer) ||
        !root.current?.contains(range.endContainer)
      )
        return setSelection(null);
      const text = selected.toString().trim();
      const rect = range.getBoundingClientRect();
      anchor.current = { getBoundingClientRect: () => rect };
      setSelection(text ? { text } : null);
    };
    document.addEventListener("pointerup", read);
    document.addEventListener("keyup", read);
    const focusAction = (event) => {
      if (
        event.key === "Tab" &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.defaultPrevented &&
        action.current &&
        document.activeElement !== action.current
      ) {
        event.preventDefault();
        action.current.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", focusAction);
    const clear = () => setSelection(null);
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    return () => {
      document.removeEventListener("pointerup", read);
      document.removeEventListener("keyup", read);
      document.removeEventListener("keydown", focusAction);
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, []);
  return (
    <div ref={root} className="contents">
      {children}
      {selection && (
        <Popover
          open
          onOpenChange={(open) => !open && setSelection(null)}
        >
          <PopoverAnchor virtualRef={anchor} />
          <PopoverContent
            role="toolbar"
            aria-label="Selected text actions"
            side="top"
            align="start"
            sideOffset={8}
            collisionPadding={12}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="w-auto max-w-[calc(100vw-24px)] border-0 p-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
            style={{ boxShadow: "var(--notebook-floating-shadow)" }}
          >
            <Button
              ref={action}
              variant="ghost"
              size="sm"
              aria-label="Save selected text to Notebook"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                onSave(selection.text);
                setSelection(null);
                window.getSelection()?.removeAllRanges();
              }}
            >
              <NotebookPen />
              Save to Notebook
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
