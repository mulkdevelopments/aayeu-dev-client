"use client";

import { Label } from "@/components/ui/label";

/**
 * Reusable TextareaField component
 * - RHF compatible (field + fieldState)
 * - Label support
 * - Validation error message
 * - Works controlled/uncontrolled
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {string} [props.value] - Controlled value if not using RHF
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string} [props.label] - Label text
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other textarea props
 */
export default function TextareaField({
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

  return (
    <div className={className}>
      {label && (
        <Label className="mb-1 block text-sm font-[300] text-gray-700">
          {label}
        </Label>
      )}
      <textarea
        value={val}
        onChange={handleChange}
        {...(field ? field : {})}
        {...rest}
        className="w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0 transition-colors duration-200"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
