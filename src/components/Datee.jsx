import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleOff,
  Sun,
} from "lucide-react";
import { Popover } from "radix-ui";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return startOfDay(nextDate);
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate?.getFullYear() === secondDate?.getFullYear() &&
    firstDate?.getMonth() === secondDate?.getMonth() &&
    firstDate?.getDate() === secondDate?.getDate()
  );
}

function getDateLabel(selectedDate, today, tomorrow) {
  if (!selectedDate) return "No Date";
  if (isSameDay(selectedDate, today)) return "Today";
  if (isSameDay(selectedDate, tomorrow)) return "Tomorrow";

  return selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

function getCalendarDays(visibleMonth) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((mondayBasedOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    return new Date(year, month, index - mondayBasedOffset + 1);
  });
}

export default function Datee() {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const label = getDateLabel(selectedDate, today, tomorrow);

  function selectDate(date) {
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    setVisibleMonth(
      new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1),
    );
    setOpen(false);
  }

  function clearDate() {
    setSelectedDate(null);
    setOpen(false);
  }

  function changeMonth(amount) {
    setVisibleMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + amount,
          1,
        ),
    );
  }

  function showCurrentMonth() {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          title="Set due date"
          aria-label={`Set due date. Current: ${label}`}
          onPointerDown={(event) => event.stopPropagation()}
          className="inline-flex h-7 items-center gap-1.5 rounded px-1.5 text-xs text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-900"
        >
          <CalendarDays size={15} strokeWidth={1.75} />
          <span>{label}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={5}
          onPointerDown={(event) => event.stopPropagation()}
          className="z-50 w-64 rounded-lg bg-white p-1.5 text-slate-800 shadow-lg ring-1 ring-black/10"
        >
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => selectDate(today)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-slate-100"
            >
              <CalendarDays
                size={18}
                strokeWidth={1.75}
                className="text-green-600"
              />
              <span>Today</span>
              <span className="ml-auto text-xs text-slate-500">
                {today.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </button>

            <button
              type="button"
              onClick={() => selectDate(tomorrow)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-slate-100"
            >
              <Sun size={18} strokeWidth={1.75} className="text-orange-500" />
              <span>Tomorrow</span>
              <span className="ml-auto text-xs text-slate-500">
                {tomorrow.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </button>
          </div>

          <div className="my-1 h-px bg-slate-200" />

          <button
            type="button"
            onClick={clearDate}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-slate-100"
          >
            <CircleOff
              size={18}
              strokeWidth={1.5}
              className="text-slate-500"
            />
            <span>No Date</span>
          </button>

          <div className="my-1 h-px bg-slate-200" />

          <div className="px-1 pb-1">
            <div className="flex items-center py-1.5">
              <span className="text-sm font-semibold">
                {visibleMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Show current month"
                  onClick={showCurrentMonth}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Circle size={8} />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7">
              {weekDays.map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className="flex h-7 items-center justify-center text-[11px] text-slate-500"
                >
                  {day}
                </span>
              ))}

              {calendarDays.map((date) => {
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                const isCurrentMonth =
                  date.getMonth() === visibleMonth.getMonth();
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    aria-label={date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    aria-pressed={isSelected}
                    onClick={() => selectDate(date)}
                    className={`flex size-8 items-center justify-center justify-self-center rounded-full text-xs transition-colors ${
                      isSelected
                        ? "bg-red-500 font-semibold text-white hover:bg-red-600"
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-100"
                    } ${isToday && !isSelected ? "font-bold text-slate-950" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
