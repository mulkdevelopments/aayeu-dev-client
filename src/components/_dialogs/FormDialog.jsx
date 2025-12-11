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

export default function FormDialog({
  trigger, // JSX trigger
  mode = "add", // "add" | "edit"
  title,
  description,
  children, // form JSX
  footer, // optional custom footer
  onSubmit, // callback should return true (close) or false (stay open)
  submitText, // custom button text
  cancelText = "Cancel",
  submitVariant = "default",
  maxHeight = "90vh", // ✅ customizable, default 90vh
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultTitle = mode === "edit" ? "Edit Item" : "Add Item";
  const defaultSubmitText =
    submitText || (mode === "edit" ? "Save Changes" : "Add");

  const handleSubmit = async () => {
    if (!onSubmit) return;

    setLoading(true);
    try {
      const shouldClose = await onSubmit();
      if (shouldClose) {
        setOpen(false);
      }
    } catch (err) {
      console.error("FormDialog submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <div onClick={() => setOpen(true)} className="inline-block">
        {trigger}
      </div>

      {/* ✅ Force full unmount/remount with key={open.toString()} */}
      {open && (
        <DialogContent
          key={open ? "open" : "closed"}
          className="sm:max-w-lg flex flex-col"
          style={{ maxHeight }}
        >
          <DialogHeader>
            <DialogTitle>{title || defaultTitle}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {/* Body → always fresh mount */}
          <div className="flex-1 overflow-y-auto py-2">{children}</div>

          <DialogFooter>
            {footer ? (
              footer({ onSubmit: handleSubmit, onClose: () => setOpen(false) })
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  variant={submitVariant}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : defaultSubmitText}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
