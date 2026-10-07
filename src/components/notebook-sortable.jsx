import { placeNotebookItem } from "../notebook-presentation";
import { useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { NotebookButton as Button } from "./notebook-ui";
import { useNoteNavigation } from "./note-navigation-context";
export function useNotebookSort({
  items = [],
  onMove,
  onPlace,
  onNotify,
  group,
}) {
  const guard = useNoteNavigation(),
    drag = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [target, setTarget] = useState(null);
  const [status, setStatus] = useState("");
  const handle = (id, disabled = false) => ({
    disabled,
    onKeyDown: (e) => {
      if (e.key === "Escape" && drag.current) {
        drag.current = null;
        setDragging(null);
        setTarget(null);
        setStatus("Reorder cancelled.");
        return;
      }
      if (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        guard(() => {
          onMove(id, e.key === "ArrowUp" ? -1 : 1);
          setStatus("Order updated.");
        });
      }
    },
    onPointerDown: (e) => {
      if (disabled || e.button !== 0) return;
      const row = e.currentTarget.closest(`[data-sort-group="${group}"]`);
      const rect = row?.getBoundingClientRect();
      drag.current = {
        left: rect?.left || e.clientX,
        top: rect?.top || e.clientY,
        width: rect?.width || 240,
        height: rect?.height || 32,
        id,
        targetId: id,
        x: e.clientX,
        y: e.clientY,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
  });
  const callbacks = useRef(null);
  callbacks.current = {
    move: (e) => {
      const current = drag.current;
      if (!current) return;
      if (
        Math.abs(e.clientY - current.y) + Math.abs(e.clientX - current.x) < 6 &&
        !current.moved
      )
        return;
      current.moved = true;
      setDragging({
        ...current,
        dx: e.clientX - current.x,
        dy: e.clientY - current.y,
      });
      const row = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest(`[data-sort-group="${group}"]`);
      if (row) {
        const nextId = row.getAttribute("data-sort-id");
        if (nextId !== current.id) {
          current.targetId = nextId;
          setTarget(nextId);
        }
      }
    },
    up: () => {
      const current = drag.current;
      drag.current = null;
      setDragging(null);
      setTarget(null);
      if (current?.moved && current.targetId !== current.id)
        guard(() => {
          try {
            onPlace(current.id, current.targetId);
            setStatus("Order updated.");
          } catch (e) {
            onNotify(e.message, undefined, "error");
          }
        });
    },
    cancel: () => {
      drag.current = null;
      setDragging(null);
      setTarget(null);
    },
  };
  useEffect(() => {
    const move = (e) => callbacks.current.move(e),
      up = () => callbacks.current.up(),
      cancel = () => callbacks.current.cancel();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);
  const previewItems =
    items.length && dragging && target
      ? placeNotebookItem(items, dragging.id, target)
      : items;
  return { handle, target, status, dragging, previewItems };
}
export function NotebookDragHandle({ label, ...props }) {
  return (
    <Button
      static
      variant="ghost"
      size="icon-sm"
      className="touch-none cursor-grab bg-transparent text-foreground/50 hover:bg-secondary hover:text-foreground focus-visible:text-foreground active:cursor-grabbing"
      aria-label={`Reorder ${label}`}
      tooltip="Drag to reorder. Keyboard: Alt + ↑ / ↓."
      {...props}
    >
      <GripVertical />
    </Button>
  );
}
