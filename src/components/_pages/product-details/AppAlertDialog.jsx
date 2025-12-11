"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";

const ALERT_STYLES = {
  success: {
    icon: <CheckCircle2 className="text-green-500 h-6 w-6" />,
    titleClass: "text-green-600",
  },
  error: {
    icon: <AlertCircle className="text-red-500 h-6 w-6" />,
    titleClass: "text-red-600",
  },
  warning: {
    icon: <AlertTriangle className="text-yellow-500 h-6 w-6" />,
    titleClass: "text-yellow-600",
  },
  info: {
    icon: <Info className="text-blue-500 h-6 w-6" />,
    titleClass: "text-blue-600",
  },
  default: {
    icon: <Info className="text-gray-500 h-6 w-6" />,
    titleClass: "text-gray-700",
  },
};

export default function AppAlertDialog({
  type = "default",
  title = "Alert",
  description,
  visible,
  onClose,
  trigger,
  children,
  customHeader,
  customFooter,
  autoCloseAfter,
}) {
  const [open, setOpen] = React.useState(false);
  const isControlled = typeof visible === "boolean";
  const dialogOpen = isControlled ? visible : open;

  React.useEffect(() => {
    if (!trigger && visible === undefined) setOpen(true);
  }, [trigger, visible]);

  const handleOpenChange = (val) => {
    if (!isControlled) setOpen(val);
    if (!val && onClose) onClose();
  };

  React.useEffect(() => {
    if (dialogOpen && autoCloseAfter) {
      const timer = setTimeout(() => handleOpenChange(false), autoCloseAfter);
      return () => clearTimeout(timer);
    }
  }, [dialogOpen, autoCloseAfter]);

  const { icon, titleClass } = ALERT_STYLES[type] || ALERT_STYLES.default;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-md rounded-none p-6">
        {/* 🔒 Accessibility fix: Always include DialogTitle */}
        {customHeader ? (
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
        ) : null}

        {/* Header */}
        {customHeader ? (
          customHeader
        ) : (
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <div>{icon}</div>
            <DialogTitle className={clsx("text-lg font-semibold", titleClass)}>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-gray-500">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content */}
        {children && <div className="mt-4">{children}</div>}

        {/* Footer */}
        {customFooter ? (
          customFooter
        ) : (
          <DialogFooter className="mt-6 flex justify-center">
            <Button
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              className="min-w-[100px]"
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
