"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

/**
 * DateField component
 * - RHF compatible (field + fieldState)
 * - Uses Calendar inside a Popover
 * - Shows selected date or placeholder
 * - Displays validation errors
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {any} [props.value] - Controlled value
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string} [props.label] - Label above field
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {string} [props.error] - Validation error message
 * @param {object} [props.rest] - Other props
 */
export default function DateField({
  field,
  value,
  onChange,
  label,
  className = "",
  error,
  ...rest
}) {
  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  return (
    <div className={`flex flex-col gap-1 ${className} font-poppins`}>
      {label && <Label className="text-sm font-light">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal text-base border-b border-black rounded-none ${
              !val ? "text-gray-400" : "text-black"
            }`}
          >
            {val ? new Date(val).toLocaleDateString() : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 shadow-lg rounded-md">
          <Calendar
            mode="single"
            selected={val}
            captionLayout="dropdown"
            onSelect={handleChange}
            initialFocus
            {...rest}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
