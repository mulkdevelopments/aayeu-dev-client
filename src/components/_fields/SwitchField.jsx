"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * Reusable SwitchField component
 * - RHF compatible (field + fieldState)
 * - Label support
 * - Validation error message
 * - Works controlled/uncontrolled
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {boolean} [props.value] - Controlled value if not using RHF
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string|object} [props.label] - Label text or {on, off} for switch
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other props
 */
export default function SwitchField({
  field,
  value,
  onChange,
  label,
  error,
  className = "",
  ...rest
}) {
  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  const renderLabel =
    typeof label === "object"
      ? val
        ? label.on || "On"
        : label.off || "Off"
      : label;

  return (
    <div className={`flex flex-col ${className}`} {...rest}>
      <div className="flex items-center space-x-2">
        <Switch checked={!!val} onCheckedChange={handleChange} />
        {renderLabel && <span className="text-gray-700">{renderLabel}</span>}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
