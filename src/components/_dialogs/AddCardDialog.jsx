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

// ✅ Validation Schema
const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Enter a valid 16-digit card number")
    .max(19, "Card number too long")
    .regex(/^[0-9\s]+$/, "Card number must contain only digits"),
  cardHolder: z.string().min(1, "Cardholder name is required"),
  expiry: z
    .string()
    .min(5, "Enter valid expiry date (MM/YY)")
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Use MM/YY format"),
  cvv: z
    .string()
    .min(3, "Enter valid CVV")
    .max(4, "Enter valid CVV")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
});

export default function AddCardDialog({
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  trigger, // optional custom trigger
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
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: "",
      cardHolder: "",
      expiry: "",
      cvv: "",
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
        {trigger ? (
          trigger
        ) : (
          <CTAButton color="gold">Add New Card</CTAButton>
        )}
      </DialogTrigger>

      {/* ✅ Dialog */}
      <DialogContent
        className="rounded-none w-full max-w-md p-6 overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add New Card
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between h-full max-h-[70vh]"
        >
          {/* ✅ Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Card Number */}
            <Controller
              name="cardNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Card Number"
                  placeholder="Enter card number"
                  inputMode="numeric"
                  maxLength={19}
                  error={errors.cardNumber?.message}
                />
              )}
            />

            {/* Cardholder Name */}
            <Controller
              name="cardHolder"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cardholder Name"
                  placeholder="Enter cardholder name"
                  error={errors.cardHolder?.message}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry */}
              <Controller
                name="expiry"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Expiry (MM/YY)"
                    placeholder="MM/YY"
                    maxLength={5}
                    error={errors.expiry?.message}
                  />
                )}
              />

              {/* CVV */}
              <Controller
                name="cvv"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CVV"
                    placeholder="CVV"
                    maxLength={4}
                    type="password"
                    inputMode="numeric"
                    error={errors.cvv?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* ✅ Fixed Footer */}
          <DialogFooter className="flex justify-end gap-3 pt-4 border-t">
            <CTAButton
              color="danger"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </CTAButton>
            <CTAButton color="gold" type="submit">
              Save Card
            </CTAButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
