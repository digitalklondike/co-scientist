import { useEffect, useRef, useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "./ui/button";

export function AnswerSelection({ children, onSave }) {
  const root = useRef(null);
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
      setSelection(
        text
          ? {
              text,
              left: Math.max(12, Math.min(rect.left, window.innerWidth - 250)),
              top: Math.max(
                12,
                Math.min(rect.bottom + 8, window.innerHeight - 56),
              ),
            }
          : null,
      );
    };
    document.addEventListener("pointerup", read);
    document.addEventListener("keyup", read);
    const clear = () => setSelection(null);
    window.addEventListener("scroll", clear, true);
    return () => {
      document.removeEventListener("pointerup", read);
      document.removeEventListener("keyup", read);
      window.removeEventListener("scroll", clear, true);
    };
  }, []);
  return (
    <div ref={root} className="contents">
      {children}
      {selection && (
        <Button
          className="fixed z-50 shadow-md"
          style={{ left: selection.left, top: selection.top }}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => {
            onSave(selection.text);
            setSelection(null);
            window.getSelection()?.removeAllRanges();
          }}
        >
          <NotebookPen />
          Save selection to Notebook
        </Button>
      )}
    </div>
  );
}
