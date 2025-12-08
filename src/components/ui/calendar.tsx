import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 w-full rounded-xl border border-[#E6ECF5] bg-white shadow-sm text-base dark:bg-[#23272F] dark:border-[#444857]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-2",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-[#1f2937] dark:text-gray-200",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-white border border-[#E6ECF5] rounded-md p-0 opacity-80 hover:opacity-100 shadow-sm"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-[#6b7280] rounded-md w-10 font-medium text-[0.75rem] uppercase",
        row: "flex w-full mt-1",
        cell:
          "h-10 w-10 text-center text-sm p-0 relative rounded-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-medium text-[#111827] dark:text-gray-200 hover:bg-[#ED4231]/10 hover:text-[#111827] transition-colors rounded-md aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#ED4231] text-white hover:bg-[#ED4231] hover:text-white focus:bg-[#ED4231] focus:text-white",
        day_today:
          "border-2 border-[#ED4231] bg-transparent text-inherit",
        day_outside:
          "day-outside text-[#9ca3af] opacity-50 aria-selected:bg-[#ED4231]/10 aria-selected:text-[#9ca3af] aria-selected:opacity-30",
        day_disabled: "text-[#9ca3af] opacity-50",
        day_range_middle:
          "aria-selected:bg-[#ED4231]/20 aria-selected:text-[#111827]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
