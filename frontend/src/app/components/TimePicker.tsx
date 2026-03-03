import React from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-700 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors group-hover:text-blue-600" />
      </div>
    </div>
  );
}
