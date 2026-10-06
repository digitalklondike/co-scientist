import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster as Sonner } from "sonner";

export function NotificationToast({ text, type = "success", action, onDismiss }) {
  const Icon = { success: CircleCheckIcon, info: InfoIcon, warning: TriangleAlertIcon, error: OctagonXIcon }[type] || InfoIcon;
  return (
    <div data-testid="product-toast" className={cn(
      "grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-md border border-border bg-popover p-4 text-popover-foreground",
      action && "sm:grid-cols-[32px_minmax(0,1fr)_auto_auto]",
    )}>
      <Badge variant="secondary" className={cn("col-start-1 row-start-1 flex size-8 items-center justify-center rounded-md bg-accent p-0 text-primary", type === "error" && "bg-destructive/10 text-destructive")}><Icon className="size-4" /></Badge>
      <p className="col-start-2 row-start-1 min-w-0 break-words text-base font-normal leading-6">{text}</p>
      {action && <Button variant="secondary" size="sm" className="col-start-2 row-start-2 justify-self-start text-primary sm:col-start-3 sm:row-start-1" onClick={() => { action.run(); onDismiss(); }}>{action.label}</Button>}
      <Button variant="ghost" size="icon-sm" aria-label="Dismiss notification" className={cn("col-start-3 row-start-1 text-muted-foreground", action && "sm:col-start-4")} onClick={onDismiss}><X /></Button>
    </div>
  );
}

export function Toaster(props) {
  return <Sonner theme="light" className="toaster group" style={{ "--width": "480px", "--font-sans": "var(--font-sans)" }} toastOptions={{ unstyled: true, style: { padding: 0, border: 0, background: "transparent", boxShadow: "none" } }} {...props} />;
}
