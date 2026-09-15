import React, { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import {
    addDays,
    differenceInCalendarDays,
    eachDayOfInterval,
    format,
    isBefore,
    isSameDay,
    startOfDay,
} from "date-fns";
import "react-day-picker/dist/style.css";

interface MultiDatePickerProps {
    selectedDates: Date[];
    onChange: (dates: Date[]) => void;
    disabledDates?: Date[];
    label?: string;
}

const toNoon = (date: Date) => {
    const next = new Date(date);
    next.setHours(12, 0, 0, 0);
    return next;
};

const nightsFromRange = (from?: Date, to?: Date): Date[] => {
    if (!from || !to) return [];
    const start = startOfDay(from);
    const end = startOfDay(to);
    if (!isBefore(start, end)) return [];
    return eachDayOfInterval({ start, end: addDays(end, -1) }).map(toNoon);
};

const rangeFromNights = (dates: Date[]): DateRange | undefined => {
    if (!dates.length) return undefined;
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    return {
        from: toNoon(sorted[0]),
        to: toNoon(addDays(sorted[sorted.length - 1], 1)),
    };
};

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
    selectedDates,
    onChange,
    disabledDates = [],
    label = "Stay dates",
}) => {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>(() =>
        rangeFromNights(selectedDates),
    );
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const checkIn = range?.from || sorted[0];
    const checkOut =
        range?.to ??
        (range?.from
            ? undefined
            : sorted.length
              ? addDays(sorted[sorted.length - 1], 1)
              : undefined);
    const nightCount =
        checkIn && checkOut
            ? Math.max(0, differenceInCalendarDays(checkOut, checkIn))
            : 0;

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

    const handleRangeSelect = (next: DateRange | undefined) => {
        if (!next?.from) {
            setRange(undefined);
            onChange([]);
            return;
        }
        const from = toNoon(next.from);
        const to = next.to ? toNoon(next.to) : undefined;
        if (!to || isSameDay(from, to)) {
            setRange({ from, to: undefined });
            return;
        }
        const nights = nightsFromRange(from, to);
        if (!nights.length || nights.some((date) => isDisabled(date))) {
            setRange({ from, to: undefined });
            return;
        }
        setRange({ from, to });
        onChange(nights);
    };

    return (
        <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} *
            </label>
            <div className="mt-1 grid grid-cols-2 rounded-md border border-gray-300 bg-white overflow-hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-left px-3 py-2 border-r border-gray-200 hover:bg-gray-50"
                >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Check-in
                    </div>
                    <div className="text-sm text-gray-900">
                        {checkIn ? format(checkIn, "dd MMM yyyy") : "Add date"}
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-left px-3 py-2 hover:bg-gray-50"
                >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Check-out
                    </div>
                    <div className="text-sm text-gray-900">
                        {checkOut ? format(checkOut, "dd MMM yyyy") : "Add date"}
                    </div>
                </button>
            </div>
            {nightCount > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                    {nightCount} night{nightCount === 1 ? "" : "s"}
                </p>
            )}

            {open && (
                <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">
                        {range?.from && !range?.to
                            ? "Select a check-out date"
                            : "Select check-in, then check-out"}
                    </p>
                    <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={handleRangeSelect}
                        fromDate={new Date()}
                        toDate={addDays(new Date(), 365)}
                        disabled={isDisabled}
                        modifiersClassNames={{
                            range_start: "bg-blue-600 text-white rounded-l-full",
                            range_end: "bg-blue-600 text-white rounded-r-full",
                            range_middle: "bg-blue-100 text-blue-900",
                            selected:
                                "bg-blue-600 text-white rounded-full hover:bg-blue-700",
                        }}
                    />
                    <div className="mt-2 flex gap-2">
                        <button
                            type="button"
                            className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md"
                            onClick={() => {
                                setRange(undefined);
                                onChange([]);
                            }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-gray-300"
                            disabled={!nightCount}
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiDatePicker;
