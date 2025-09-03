import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths
} from 'date-fns';

const CalendarView = ({
  viewMode,
  selectedDate,
  appointments = [],
  onDateChange,
  onAppointmentClick,
  onDragStart,
  onDrop,
  getStatusColor,
  getTypeColor
}) => {
  const [draggedOver, setDraggedOver] = useState(null);
  const calendarRef = useRef(null);

  const navigateDate = (direction) => {
    if (viewMode === 'day') {
      onDateChange(addDays(selectedDate, direction));
    } else if (viewMode === 'week') {
      onDateChange(direction > 0 ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1));
    } else if (viewMode === 'month') {
      onDateChange(direction > 0 ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
    }
  };

  const handleDragOver = (e, date, hour) => {
    e?.preventDefault();
    setDraggedOver({ date, hour });
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e, date, hour) => {
    e?.preventDefault();
    onDrop(date, hour);
    setDraggedOver(null);
  };

  const getAppointmentsForDateAndHour = (date, hour) => {
    return appointments?.filter(apt => 
      isSameDay(apt?.date, date) && apt?.date?.getHours() === hour
    );
  };

  const getAppointmentsForDate = (date) => {
    return appointments?.filter(apt => isSameDay(apt?.date, date));
  };

  const renderTimeSlot = (hour, date) => {
    const slotAppointments = getAppointmentsForDateAndHour(date, hour);
    const isDraggedOver = draggedOver?.date && isSameDay(draggedOver?.date, date) && draggedOver?.hour === hour;

    return (
      <div
        key={`${date?.toISOString()}-${hour}`}
        className={`min-h-[60px] border-b border-border/50 p-1 relative ${
          isDraggedOver ? 'bg-primary/20' : 'hover:bg-muted/50'
        }`}
        onDragOver={(e) => handleDragOver(e, date, hour)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, date, { hour, minute: 0 })}
      >
        <div className="text-xs text-muted-foreground mb-1">
          {format(new Date()?.setHours(hour, 0), 'HH:mm')}
        </div>
        <div className="space-y-1">
          {slotAppointments?.map((appointment) => (
            <div
              key={appointment?.id}
              draggable
              onDragStart={() => onDragStart(appointment)}
              className={`p-2 rounded text-xs cursor-move hover:shadow-md transition-all ${getTypeColor(appointment?.type)} text-white`}
              onClick={() => onAppointmentClick(appointment)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{appointment?.patientName}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment?.status)}`}></div>
              </div>
              <div className="text-xs opacity-90">
                {appointment?.type} - {appointment?.duration}min
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {hours?.map((hour) => renderTimeSlot(hour, selectedDate))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
                This Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
          {/* Week header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-2 text-sm font-medium text-muted-foreground border-r border-border">
              Time
            </div>
            {weekDays?.map((day) => (
              <div
                key={day?.toISOString()}
                className={`p-2 text-center border-r border-border cursor-pointer hover:bg-muted/50 ${
                  isSameDay(day, selectedDate) ? 'bg-primary/10' : ''
                } ${isToday(day) ? 'text-primary font-semibold' : ''}`}
                onClick={() => onDateChange(day)}
              >
                <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'dd')}</div>
              </div>
            ))}
          </div>

          {/* Week content */}
          <div className="max-h-[500px] overflow-y-auto">
            {hours?.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/50">
                <div className="p-2 text-xs text-muted-foreground border-r border-border text-center">
                  {format(new Date()?.setHours(hour, 0), 'HH:mm')}
                </div>
                {weekDays?.map((day) => (
                  <div key={`${day?.toISOString()}-${hour}`} className="border-r border-border/50">
                    {renderTimeSlot(hour, day)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 34); // 5 weeks
    
    const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </div>
        {/* Month header */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']?.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        {/* Month calendar grid */}
        <div className="grid grid-cols-7">
          {monthDays?.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day?.toISOString()}
                className={`min-h-[120px] p-2 border-r border-b border-border/50 last:border-r-0 cursor-pointer hover:bg-muted/50 ${
                  !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                } ${isSelected ? 'bg-primary/10' : ''} ${isTodayDate ? 'bg-accent/10' : ''}`}
                onClick={() => onDateChange(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayAppointments?.slice(0, 3)?.map((appointment) => (
                    <div
                      key={appointment?.id}
                      className={`text-xs p-1 rounded cursor-pointer ${getTypeColor(appointment?.type)} text-white`}
                      onClick={(e) => {
                        e?.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className="truncate">{appointment?.patientName}</div>
                      <div className="text-xs opacity-90">{format(appointment?.date, 'HH:mm')}</div>
                    </div>
                  ))}
                  {dayAppointments?.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayAppointments?.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderWeekView();
    }
  };

  return (
    <div ref={calendarRef} className="calendar-view">
      {renderView()}
    </div>
  );
};

export default CalendarView;