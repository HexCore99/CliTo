import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { useSortingStore } from "@/stores/useSortingStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "priority-high", label: "Highest priority" },
  { value: "priority-low", label: "Lowest priority" },
  { value: "date-asc", label: "Date ascending" },
  { value: "date-desc", label: "Date descending" },
];

export default function Sorting({ columnName }) {
  const selectedValue = useSortingStore(
    (state) => state.sortOptions[columnName],
  );

  const sortColumn = useSortingStore((state) => state.sortColumn);

  async function handleValueChange(nextValue) {
    await sortColumn(columnName, nextValue);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Sort tasks"
          aria-label="Sort tasks"
          className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowUpDown className="size-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-white">
        <DropdownMenuLabel>Sort tasks</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={handleValueChange}
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="cursor-pointer px-2 py-2"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
