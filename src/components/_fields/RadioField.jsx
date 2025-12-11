"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

/**
 * Reusable RadioField component
 * - RHF compatible (field + fieldState)
 * - Label support
 * - Validation error message
 * - Works controlled/uncontrolled
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {any} [props.value] - Controlled value if not using RHF
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string} [props.label] - Label above radio group
 * @param {array} [props.options] - Array of {value, label} objects
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other props
 */
export default function RadioField({
  field,
  value,
  onChange,
  options = [],
  label,
  error,
  className = "",
  ...rest
}) {
  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  return (
    <div className="flex flex-col">
      {label && <Label className="mb-1">{label}</Label>}
      <RadioGroup
        value={val}
        onValueChange={handleChange}
        className={`flex gap-6 ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
            <label htmlFor={`radio-${opt.value}`}>{opt.label}</label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
