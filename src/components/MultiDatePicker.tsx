import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import "react-day-picker/dist/style.css";

interface MultiDatePickerProps {
    selectedDates: Date[];
    onChange: (dates: Date[]) => void;
    disabledDates?: Date[];
    label?: string;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
    selectedDates,
    onChange,
    disabledDates = [],
    label = "Stay dates",
}) => {
    const [open, setOpen] = useState(false);
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const isDisabled = (date: Date) => {
        const today = startOfDay(new Date());
        return (
            isBefore(date, today) ||
            disabledDates.some(
                (blocked) =>
                    format(blocked, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
            )
        );
    };

    const buttonLabel =
        sorted.length === 0
            ? "Select one or more stay dates"
            : sorted.length === 1
              ? `${format(first, "dd MMM yyyy")} (1 night)`
              : `${sorted.length} nights · ${format(first, "dd MMM")} – ${format(last, "dd MMM yyyy")}`;

    return (
        <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} *
            </label>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="mt-1 w-full text-left border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
            >
                {buttonLabel}
            </button>

            {sorted.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {sorted.map((date) => (
                        <span
                            key={format(date, "yyyy-MM-dd")}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs border border-blue-100"
                        >
                            {format(date, "dd MMM yyyy")}
                            <button
                                type="button"
                                className="text-blue-500 hover:text-red-600"
                                onClick={() =>
                                    onChange(
                                        sorted.filter(
                                            (item) =>
                                                format(item, "yyyy-MM-dd") !==
                                                format(date, "yyyy-MM-dd"),
                                        ),
                                    )
                                }
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => onChange([])}
                    >
                        Clear all
                    </button>
                </div>
            )}

            {open && (
                <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">
                        Click multiple dates to book those nights in inventory.
                    </p>
                    <DayPicker
                        mode="multiple"
                        selected={sorted}
                        onSelect={(dates) =>
                            onChange(
                                (dates || [])
                                    .filter((date) => !isDisabled(date))
                                    .map((date) => {
                                        const next = new Date(date);
                                        next.setHours(12, 0, 0, 0);
                                        return next;
                                    }),
                            )
                        }
                        fromDate={new Date()}
                        toDate={addDays(new Date(), 365)}
                        disabled={isDisabled}
                        modifiersClassNames={{
                            selected:
                                "bg-blue-600 text-white rounded-full hover:bg-blue-700",
                        }}
                    />
                    <button
                        type="button"
                        className="mt-2 w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
                        onClick={() => setOpen(false)}
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
};

export default MultiDatePicker;
