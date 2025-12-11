"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Reusable ToggleField component with:
 * - RHF support (field + validation)
 * - Label
 * - Validation error message
 * - Works controlled/uncontrolled
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {string} [props.value] - Controlled value if not using RHF
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string} [props.label] - Label text
 * @param {string} [props.error] - Validation error message
 * @param {Array<{label: string, value: any}>} [props.options] - Toggle options
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other wrapper props
 */
export default function ToggleField({
  field,
  value,
  onChange,
  label,
  error,
  options = [],
  className = "",
  ...rest
}) {
  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  return (
    <div className={className} {...rest}>
      {label && (
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}

      <div className="flex gap-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={val === opt.value ? "default" : "outline"}
            onClick={() => handleChange(opt.value)}
            className={cn(
              "px-4 py-2 rounded-lg transition",
              val === opt.value && "bg-blue-600 text-white"
            )}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
