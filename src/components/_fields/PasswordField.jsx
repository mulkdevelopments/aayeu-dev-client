"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable PasswordField component with:
 * - RHF support (field + validation)
 * - Label
 * - Leading icon
 * - Show/Hide toggle
 * - Works controlled/uncontrolled
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {string} [props.value] - Controlled value if not using RHF
 * @param {function} [props.onChange] - Controlled onChange
 * @param {React.ComponentType} [props.Icon] - Leading icon
 * @param {string} [props.label] - Label text
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {object} [props.rest] - Other Input props
 */
export default function PasswordField({
  field,
  value,
  onChange,
  Icon,
  label,
  error,
  className = "",
  ...rest
}) {
  const [show, setShow] = useState(false);

  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  return (
    <div className="w-full">
      {label && (
        <Label className="mb-1 block text-sm font-[300] text-gray-700">
          {label}
        </Label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}

        <input
          type={show ? "text" : "password"}
          value={val}
          onChange={handleChange}
          {...(field ? field : {})}
          {...rest}
          className={`w-full bg-transparent border-0 border-b border-black rounded-none py-2 px-0 focus:outline-none focus:ring-0 transition-colors duration-200 ${className}`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
