import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ManualDateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function ManualDateTimePicker({ value, onChange, className }: ManualDateTimePickerProps) {
  // Initialize state with provided value or current date
  const [date, setDate] = useState<Date>(value || new Date());

  // Update internal state when prop changes
  useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years back, 5 years forward

  // Handlers
  const updateDate = (type: 'day' | 'month' | 'year' | 'time', val: string) => {
    const newDate = new Date(date);

    if (type === 'day') {
      newDate.setDate(parseInt(val));
    } else if (type === 'month') {
      newDate.setMonth(parseInt(val) - 1);
    } else if (type === 'year') {
      newDate.setFullYear(parseInt(val));
    } else if (type === 'time') {
      const [hours, minutes] = val.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
      }
    }

    setDate(newDate);
    onChange(newDate);
  };

  // Extract current values
  const currentDay = date.getDate().toString();
  const currentMonth = (date.getMonth() + 1).toString();
  const currentYearStr = date.getFullYear().toString();
  const currentTime = `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;

  return (
    <div className={cn('flex flex-wrap items-end gap-2', className)}>
      <div className="grid gap-1.5 grow">
        <Label className="text-xs text-muted-foreground">Ngày</Label>
        <Select value={currentDay} onValueChange={(val) => updateDate('day', val)}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="Ngày" />
          </SelectTrigger>
          <SelectContent>
            {days.map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5 grow">
        <Label className="text-xs text-muted-foreground">Tháng</Label>
        <Select value={currentMonth} onValueChange={(val) => updateDate('month', val)}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="Tháng" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5 grow">
        <Label className="text-xs text-muted-foreground">Năm</Label>
        <Select value={currentYearStr} onValueChange={(val) => updateDate('year', val)}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5 grow">
        <Label className="text-xs text-muted-foreground">Giờ</Label>
        <Input
          type="time"
          value={currentTime}
          onChange={(e) => updateDate('time', e.target.value)}
          className="w-[90px]"
        />
      </div>
    </div>
  );
}
