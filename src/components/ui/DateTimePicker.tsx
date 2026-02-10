import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Chọn ngày giờ',
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = useState<string>(value ? format(value, 'HH:mm') : '00:00');

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setSelectedDate(date);
      onChange(date);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
      onChange(newDate);
    }
  };

  const setQuickDateTime = (type: 'today-start' | 'today-end' | 'yesterday-end') => {
    const now = new Date();
    let newDate: Date;

    switch (type) {
      case 'today-start':
        newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        setTimeValue('00:00');
        break;
      case 'today-end':
        newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
        setTimeValue('23:59');
        break;
      case 'yesterday-end':
        newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 0);
        setTimeValue('23:59');
        break;
      default:
        newDate = now;
    }

    setSelectedDate(newDate);
    onChange(newDate);
    setIsOpen(false);
  };

  const displayValue = selectedDate
    ? `${format(selectedDate, 'dd/MM/yyyy', { locale: vi })} ${timeValue}`
    : placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setQuickDateTime('today-start')}
            >
              Hôm nay 00:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setQuickDateTime('today-end')}
            >
              Hôm nay 23:59
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setQuickDateTime('yesterday-end')}
          >
            Hôm qua 23:59
          </Button>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          locale={vi}
        />

        <div className="p-3 border-t">
          <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            Giờ
          </Label>
          <Input
            id="time"
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
