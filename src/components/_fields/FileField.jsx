"use client";

import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

/**
 * FileField component
 * - RHF compatible (field + fieldState)
 * - Supports multiple files
 * - Accepts a file type filter
 * - Shows previews for images
 * - Displays validation errors
 *
 * @param {object} props
 * @param {object} [props.field] - RHF field object (from Controller)
 * @param {any} [props.value] - Controlled value
 * @param {function} [props.onChange] - Controlled onChange
 * @param {string} [props.label] - Label above input
 * @param {boolean} [props.multiple] - Allow multiple files
 * @param {string} [props.accept] - Accept attribute for file types
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {string} [props.error] - Validation error message
 * @param {object} [props.rest] - Other props
 */
export default function FileField({
  field,
  value,
  onChange,
  label,
  multiple = false,
  accept = "*/*",
  className = "",
  error,
  ...rest
}) {
  const val = field ? field.value : value;
  const handleChange = field ? field.onChange : onChange;

  const handleFiles = (e) => {
    const files = multiple
      ? Array.from(e.target.files)
      : e.target.files?.[0] || null;
    handleChange(files);
  };

  const filesArray = val ? (Array.isArray(val) ? val : [val]) : [];

  return (
    <div className={`flex flex-col gap-2 ${className}`} {...rest}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFiles}
          multiple={multiple}
        />
        <Upload className="w-4 h-4 text-gray-500" />
      </div>

      {filesArray.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {filesArray.map((file, idx) => {
            const isFile = file instanceof File;
            const previewUrl = isFile ? URL.createObjectURL(file) : file.url;

            return (
              <div
                key={idx}
                className="relative w-20 h-20 border rounded overflow-hidden group"
              >
                {previewUrl &&
                (file.type?.startsWith?.("image/") || file.url) ? (
                  <img
                    src={previewUrl}
                    alt={file.name || `file-${idx}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    {file.name || "File"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
