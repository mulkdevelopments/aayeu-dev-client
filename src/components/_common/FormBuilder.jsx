"use client";

import React, { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function FormBuilder({ fields, form, sections = [] }) {
  const {
    formState: { errors },
  } = form;

  const [showPassword, setShowPassword] = useState({});
  const togglePassword = (name) =>
    setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }));

  // 🚀 Auto-scroll to first error
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstError}"]`);
      if (el && typeof el.focus === "function") {
        el.focus();
      }
    }
  }, [errors]);

  // If sections are provided, group fields by section
  const groupedFields =
    sections.length > 0
      ? sections.map((sec) => ({
          ...sec,
          fields: fields.filter((f) => f.section === sec.id),
        }))
      : [{ id: "default", title: null, layout: "1", fields }];

  return (
    <div className="space-y-10">
      {groupedFields.map((section, sIdx) => (
        <div key={section.id || sIdx} className="space-y-6">
          {section.title && (
            <h3 className="text-lg font-semibold">{section.title}</h3>
          )}

          <div
            className={cn(
              "grid gap-6",
              section.layout === "2" && "md:grid-cols-2",
              section.layout === "3" && "md:grid-cols-3"
            )}
          >
            {section.fields.map(
              ({ name, label, type, icon: Icon, options = [], ...rest }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => {
                    const hasError = !!errors[name];
                    const baseClass =
                      "pl-10 pr-10 w-full rounded-lg border focus:outline-none focus:ring-2 transition";
                    const errorClass = hasError
                      ? "border-red-500 focus:ring-red-500"
                      : field.value
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-500";

                    return (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <div>
                            {/* ✅ Text, Email, Number, Tel */}
                            {["text", "email", "number", "tel"].includes(
                              type
                            ) && (
                              <div className="relative">
                                {Icon && (
                                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                )}
                                <Input
                                  type={type}
                                  {...field}
                                  {...rest}
                                  className={`${baseClass} ${errorClass}`}
                                />
                              </div>
                            )}

                            {/* ✅ Password */}
                            {type === "password" && (
                              <div className="relative">
                                {Icon && (
                                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                )}
                                <Input
                                  type={
                                    showPassword[name] ? "text" : "password"
                                  }
                                  {...field}
                                  {...rest}
                                  className={`${baseClass} ${errorClass}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => togglePassword(name)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {showPassword[name] ? (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            )}

                            {/* ✅ Textarea */}
                            {type === "textarea" && (
                              <Textarea
                                {...field}
                                {...rest}
                                className={`${errorClass}`}
                              />
                            )}

                            {/* ✅ Radio */}
                            {type === "radio" && (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex gap-6 mt-2"
                                {...rest}
                              >
                                {options.map((opt) => (
                                  <div
                                    key={opt.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <RadioGroupItem
                                      value={opt.value}
                                      id={`${name}-${opt.value}`}
                                    />
                                    <label htmlFor={`${name}-${opt.value}`}>
                                      {opt.label}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {/* ✅ Select */}
                            {type === "select" && (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                {...rest}
                              >
                                <SelectTrigger
                                  className={`${errorClass} ${baseClass}`}
                                >
                                  <SelectValue
                                    placeholder={
                                      rest.placeholder || "Select option"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {options.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {/* ✅ Multi-Checkbox */}
                            {type === "checkbox" && (
                              <div
                                className="flex flex-col gap-2 mt-2"
                                {...rest}
                              >
                                {options.map((opt) => (
                                  <div
                                    key={opt.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${name}-${opt.value}`}
                                      checked={field.value?.includes(opt.value)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([
                                            ...(field.value || []),
                                            opt.value,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value?.filter(
                                              (v) => v !== opt.value
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`${name}-${opt.value}`}
                                      className="text-sm"
                                    >
                                      {opt.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* ✅ Datepicker */}
                            {type === "date" && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${
                                      !field.value && "text-gray-400"
                                    }`}
                                    {...rest}
                                  >
                                    {field.value
                                      ? field.value.toLocaleDateString()
                                      : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    {...rest}
                                  />
                                </PopoverContent>
                              </Popover>
                            )}

                            {/* ✅ File Upload with Preview */}
                            {type === "file" && (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept={rest.accept || "*/*"}
                                    onChange={(e) => {
                                      const files = rest.multiple
                                        ? Array.from(e.target.files)
                                        : e.target.files?.[0] || null;
                                      field.onChange(files);
                                    }}
                                    multiple={rest.multiple}
                                  />
                                  <Upload className="w-4 h-4 text-gray-500" />
                                </div>

                                {field.value && (
                                  <div className="flex flex-wrap gap-3 mt-2">
                                    {(Array.isArray(field.value)
                                      ? field.value
                                      : [field.value]
                                    ).map((file, idx) => {
                                      const isFile = file instanceof File;
                                      const previewUrl = isFile
                                        ? URL.createObjectURL(file)
                                        : file.url;

                                      return (
                                        <div
                                          key={idx}
                                          className="relative w-20 h-20 border rounded overflow-hidden group"
                                        >
                                          {previewUrl &&
                                          (file.type?.startsWith?.("image/") ||
                                            file.url) ? (
                                            <img
                                              src={previewUrl}
                                              alt={file.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                              {file.name || "File"}
                                            </div>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (Array.isArray(field.value)) {
                                                field.onChange(
                                                  field.value.filter(
                                                    (_, i) => i !== idx
                                                  )
                                                );
                                              } else {
                                                field.onChange(null);
                                              }
                                            }}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ✅ Switch */}
                            {type === "switch" && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <span>{field.value ? "On" : "Off"}</span>
                              </div>
                            )}

                            {/* ✅ Toggle */}
                            {type === "toggle" && (
                              <div className="flex gap-2 mt-2">
                                {options.map((opt) => (
                                  <Button
                                    key={opt.value}
                                    type="button"
                                    variant={
                                      field.value === opt.value
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() => field.onChange(opt.value)}
                                    className={cn(
                                      "px-4 py-2 rounded-lg",
                                      field.value === opt.value &&
                                        "bg-blue-600 text-white"
                                    )}
                                  >
                                    {opt.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FormBuilder;
