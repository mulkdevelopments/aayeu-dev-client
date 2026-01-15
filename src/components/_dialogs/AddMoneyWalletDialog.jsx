"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TextField from "../_fields/TextField";
import CTAButton from "../_common/CTAButton";

// ✅ Validation schema
const addMoneySchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
  remarks: z.string().optional(),
});

export default function AddMoneyWalletDialog({
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  trigger, // optional trigger button
}) {
  const [selfOpen, setSelfOpen] = useState(false);
  const open = controlledOpen ?? selfOpen;
  const onOpenChange = controlledOnChange ?? setSelfOpen;

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addMoneySchema),
    defaultValues: {
      amount: "",
      remarks: "",
    },
  });

  const onSubmit = (data) => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ Default Trigger */}
      <DialogTrigger asChild>
        {trigger ? trigger : <CTAButton color="black">Add Money</CTAButton>}
      </DialogTrigger>

      {/* ✅ Dialog Content */}
      <DialogContent
        className="rounded-none w-full max-w-md p-6 overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add Money to Wallet
          </DialogTitle>
        </DialogHeader>

        {/* ✅ Scrollable Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between h-full max-h-[70vh]"
        >
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Amount Field */}
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount (AED)"
                  placeholder="Enter amount"
                  type="number"
                  error={errors.amount?.message}
                />
              )}
            />

            {/* Remarks Field */}
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Remarks"
                  placeholder="Optional remarks (e.g., wallet top-up reason)"
                  error={errors.remarks?.message}
                />
              )}
            />
          </div>

          {/* ✅ Footer Fixed */}
          <DialogFooter className="flex justify-end gap-3 pt-4 border-t">
            <CTAButton
              color="danger"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </CTAButton>
            <CTAButton color="black" type="submit">
              Add Money
            </CTAButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
