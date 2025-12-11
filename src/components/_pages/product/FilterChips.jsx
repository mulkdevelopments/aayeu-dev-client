import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FilterChips = ({ filters, onRemove, onClear }) => {
  const chips = [];

  if (filters?.brands?.length > 0)
    filters.brands.forEach((b) =>
      chips.push({ label: b, type: "brand", value: b })
    );

  if (filters?.colors?.length > 0)
    filters.colors.forEach((c) =>
      chips.push({ label: c, type: "color", value: c })
    );

  if (filters?.sizes?.length > 0)
    filters.sizes.forEach((s) =>
      chips.push({ label: s, type: "size", value: s })
    );

  if (filters?.price?.min || filters?.price?.max) {
    chips.push({
      label: `AED ${filters.price.min || 0}–AED ${filters.price.max || 100000}`,
      type: "price",
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 items-center">
      {chips.map((chip, idx) => (
        <div
          key={idx}
          className="flex items-center bg-gray-100 hover:bg-gray-200 text-sm p-2 rounded-none"
        >
          <span className="mr-2">{chip.label}</span>
          <button
            onClick={() => onRemove(chip.type, chip.value)}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}

      {chips.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="ml-2 hover:bg-gray-100 rounded-none"
        >
          Clear All
        </Button>
      )}
    </div>
  );
};

export default FilterChips;
