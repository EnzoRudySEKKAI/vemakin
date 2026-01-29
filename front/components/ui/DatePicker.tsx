
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: string | null;
    onSelectDate: (date: string | null) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    isOpen,
    onClose,
    selectedDate,
    onSelectDate
}) => {
    // Parse initial date or default to today
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    // Handle invalid date strings
    const safeDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

    const [viewDate, setViewDate] = useState(safeDate);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const formatDate = (year: number, month: number, day: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[month]} ${day}, ${year}`;
    };

    const handlePrevMonth = () => {
        setSlideDirection('left');
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSlideDirection('right');
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isToday = (year: number, month: number, day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const isSelected = (year: number, month: number, day: number) => {
        if (!selectedDate) return false;
        // Compare with the potentially user-provided string directly or parse
        // Simplest is to construct the string and compare
        return formatDate(year, month, day) === selectedDate;
    };

    // Generate Calendar Grid
    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const selected = isSelected(year, month, d);
            const today = isToday(year, month, d);

            days.push(
                <button
                    key={d}
                    onClick={() => {
                        onSelectDate(formatDate(year, month, d));
                        // Don't close immediately, let the user see the selection? 
                        // Or close immediately? Standard is usually close or keep open.
                        // We will let the parent decide or close here if desired
                        onClose();
                    }}
                    className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold relative transition-all
                        ${selected
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 dark:bg-indigo-500 dark:shadow-indigo-500/30 scale-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                        }
                        ${today && !selected ? 'text-blue-600 dark:text-indigo-400 font-black' : ''}
                    `}
                >
                    {d}
                    {today && !selected && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
                    )}
                </button>
            );
        }
        return days;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="
                            absolute top-full right-0 mt-2 z-[70]
                            w-[280px] p-4
                            bg-white dark:bg-[#1C1C1E]
                            rounded-[24px]
                            border border-gray-200 dark:border-white/10
                            shadow-2xl
                            overflow-hidden
                        "
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex gap-1">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {daysOfWeek.map(day => (
                                <span key={day} className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-600">
                                    {day}
                                </span>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <motion.div
                            key={viewDate.getMonth()}
                            initial={{ x: slideDirection === 'right' ? 20 : -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-7 gap-y-1 justify-items-center"
                        >
                            {renderCalendarDays()}
                        </motion.div>

                        {/* Selected Date Footer */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            {selectedDate ? (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Selected: <span className="text-gray-900 dark:text-white font-bold">{selectedDate}</span>
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-gray-400">No date selected</span>
                            )}

                            <button
                                onClick={() => {
                                    onSelectDate(null);
                                    onClose();
                                }}
                                className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
