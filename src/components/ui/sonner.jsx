import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Spinner />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      toastOptions={{
        style: { fontFamily: "var(--font-sans)", fontSize: "12px" },
        classNames: {
          title: "!text-xs !font-medium",
          description: "!text-base",
          actionButton: "!bg-primary !text-primary-foreground !text-xs",
          cancelButton: "!text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
