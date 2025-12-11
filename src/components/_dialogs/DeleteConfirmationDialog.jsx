"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmationDialog({
  trigger, // JSX trigger (button, icon, text...)
  title = "Delete Item",
  description = "Are you sure you want to delete this? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  children, // optional custom body JSX
  footer, // optional custom footer JSX
  onConfirm, // callback when confirm pressed
}) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Custom Trigger */}
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger}
      </div>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Optional Custom Body */}
        {children}

        {/* Default or Custom Footer */}
        <DialogFooter>
          {footer ? (
            footer({ onConfirm: handleConfirm, onClose: () => setOpen(false) })
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {cancelText}
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                {confirmText}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
