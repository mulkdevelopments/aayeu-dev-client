"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * CheckboxField component
 * - RHF compatible (field + fieldState)
 * - Supports multiple options
 * - Displays label and validation error
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {any[]} [props.value] - Controlled value (array)
 * @param {function} [props.onChange] - Controlled onChange
 * @param {Array<{label:string,value:any}>} [props.options] - Checkbox options
 * @param {string} [props.label] - Field label
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other props
 */
export default function CheckboxField({
  field,
  value,
  onChange,
  options = [],
  label,
  error,
  className = "",
  ...rest
}) {
  const val = field ? field.value || [] : value || [];
  const handleChange = field ? field.onChange : onChange;

  const toggle = (checked, optValue) => {
    if (checked) {
      handleChange([...val, optValue]);
    } else {
      handleChange(val.filter((v) => v !== optValue));
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} {...rest}>
      {label && (
        <Label className="text-sm font-[300] text-gray-700">{label}</Label>
      )}
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <Checkbox
            id={`chk-${opt.value}`}
            checked={val.includes(opt.value)}
            onCheckedChange={(checked) => toggle(checked, opt.value)}
            className="mt-1"
          />
          <label htmlFor={`chk-${opt.value}`} className="text-sm text-gray-700">
            {opt.label}
          </label>
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
