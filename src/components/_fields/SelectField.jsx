"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * Reusable SelectField component
 * - RHF compatible (field + fieldState)
 * - Label support
 * - Validation error message
 * - Works controlled/uncontrolled
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {any} [props.value] - Controlled value if not using RHF
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.label] - Label above select
 * @param {array} [props.options] - Array of {value, label} objects
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other props
 */
export default function SelectField({
  field,
  value,
  onChange,
  options = [],
  placeholder,
  label,
  error,
  className = "",
  ...rest
}) {
  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <Label className="mb-1 text-sm font-[300] text-gray-700">{label}</Label>
      )}
      <Select value={val} onValueChange={handleChange} {...rest}>
        <SelectTrigger
          className={`w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0 focus:border-black transition-colors duration-200 ${className}`}
        >
          <SelectValue placeholder={placeholder || "Select option"} />
        </SelectTrigger>
        <SelectContent className="bg-white rounded shadow-md">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="hover:bg-gray-100 transition-colors"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
