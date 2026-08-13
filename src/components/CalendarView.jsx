import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const SPACE_DOT_COLORS = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  purple: 'bg-purple-500'
};

function getPriorityColor(priority, isLight) {
  if (priority === 'high') {
    return isLight ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-rose-300 bg-rose-500/20 border-rose-500/35';
  }
  if (priority === 'medium') {
    return isLight ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-300 bg-amber-500/20 border-amber-500/35';
  }
  return 'text-tmuted bg-inbg/40 border-bmuted';
}

function getSpaceAgendaColor(spaceColor, isLight) {
  const colors = {
    indigo: isLight ? 'text-indigo-800 bg-indigo-50 border-indigo-200' : 'text-indigo-300 border-indigo-500/35 bg-indigo-500/20',
    emerald: isLight ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-emerald-300 border-emerald-500/35 bg-emerald-500/20',
    amber: isLight ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-300 border-amber-500/35 bg-amber-500/20',
    rose: isLight ? 'text-rose-800 bg-rose-50 border-rose-200' : 'text-rose-300 border-rose-500/35 bg-rose-500/20',
    purple: isLight ? 'text-purple-800 bg-purple-50 border-purple-200' : 'text-purple-300 border-purple-500/35 bg-purple-500/20'
  };
  return colors[spaceColor] || colors.indigo;
}

function AgendaTask({ task, space, isLight }) {
  const priorityColor = getPriorityColor(task.priority, isLight);
  const spaceColor = getSpaceAgendaColor(space?.color, isLight);

  return (
    <div className="todo-card flex items-center justify-between p-3 rounded-xl border border-bmain hover:bg-inbg transition-all gap-3 shadow-sm hover:shadow-[0_10px_26px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 border ${task.completed ? 'bg-accent border-accent/25' : 'bg-transparent border-tmain/40'}`} />
        <span className={`text-xs font-bold truncate ${task.completed ? 'line-through text-tmuted' : 'text-tmain'}`}>
          {task.text}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2 py-0.5 rounded-lg border text-xs font-black uppercase tracking-wider ${spaceColor}`}>
          {space?.label || 'General'}
        </span>
        <span className={`px-2 py-0.5 rounded-lg border text-xs font-black uppercase tracking-wider ${priorityColor}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

export default function CalendarView() {
  const { tasks, spaces, theme } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const totalDays = new Date(year, month + 1, 0).getDate(); // e.g. 30 or 31
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const formatDateStr = (y, m, d) => {
    const date = new Date(y, m, d);
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dy = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  };

  const cells = useMemo(() => {
    const nextCells = [];
    for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
      const d = prevMonthTotalDays - i;
      nextCells.push({ day: d, isCurrentMonth: false, dateStr: formatDateStr(year, month - 1, d) });
    }
    for (let d = 1; d <= totalDays; d += 1) {
      nextCells.push({ day: d, isCurrentMonth: true, dateStr: formatDateStr(year, month, d) });
    }
    for (let i = nextCells.length; i < 42; i += 1) {
      const day = i - (firstDayIndex + totalDays) + 1;
      nextCells.push({ day, isCurrentMonth: false, dateStr: formatDateStr(year, month + 1, day) });
    }
    return nextCells;
  }, [firstDayIndex, month, prevMonthTotalDays, totalDays, year]);

  const getSpaceColorBorder = (spaceId) => {
    const space = spaces.find(s => s.id === spaceId);
    const isLight = theme === 'lightblue' || theme === 'lightpurple';
    if (!space) return 'border-bmuted bg-inbg/40 text-tmuted font-semibold';
    switch (space.color) {
      case 'indigo': return isLight ? 'border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold' : 'border-indigo-500 bg-indigo-500/15 text-indigo-300';
      case 'emerald': return isLight ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold' : 'border-emerald-50 bg-emerald-500/15 text-emerald-300';
      case 'amber': return isLight ? 'border-amber-300 bg-amber-50 text-amber-800 font-semibold' : 'border-amber-50 bg-amber-500/15 text-amber-300';
      case 'rose': return isLight ? 'border-rose-300 bg-rose-50 text-rose-800 font-semibold' : 'border-rose-50 bg-rose-500/15 text-rose-300';
      case 'purple': return isLight ? 'border-purple-300 bg-purple-50 text-purple-800 font-semibold' : 'border-purple-50 bg-purple-500/15 text-purple-300';
      default: return 'border-bmuted bg-inbg/40 text-tmuted font-semibold';
    }
  };

  const tasksByDate = useMemo(() => {
    const grouped = new Map();
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const dateTasks = grouped.get(task.dueDate) || [];
      dateTasks.push(task);
      grouped.set(task.dueDate, dateTasks);
    });
    return grouped;
  }, [tasks]);

  const getTasksForDate = (dateString) => tasksByDate.get(dateString) || [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDateTasks = getTasksForDate(selectedDateStr);

  return (
    <div className="glass-panel p-5 rounded-3xl select-none relative overflow-hidden border border-bmain">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-bmuted mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-accent" />
          <h2 className="text-sm font-extrabold tracking-wider uppercase text-tmain font-mono">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex gap-1 bg-inbg p-0.5 rounded-xl border border-bmuted">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-accent-bg text-tmuted hover:text-tmain rounded-lg cursor-pointer focus:outline-none"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-accent-bg text-tmuted hover:text-tmain rounded-lg cursor-pointer focus:outline-none"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid Header: Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekdays.map(day => (
          <span key={day} className="text-xs sm:text-xs font-extrabold text-tmuted uppercase tracking-widest py-1.5">
            {day}
          </span>
        ))}
      </div>

      {/* Grid Body: 42 cells */}
      <div className="grid grid-cols-7 gap-1 bg-inbg/55 p-1 rounded-2xl border border-bmain overflow-hidden">
        {cells.map((cell) => {
          const dateTasks = getTasksForDate(cell.dateStr);
          const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;
          const isSelected = selectedDateStr === cell.dateStr;
          let dayColor = 'text-tmuted';
          if (isToday) dayColor = 'text-accent font-black';
          else if (cell.isCurrentMonth) dayColor = 'text-tmain font-extrabold';

          return (
            <button
              type="button"
              key={cell.dateStr}
              onClick={() => {
                if (cell.isCurrentMonth) {
                  setSelectedDateStr(cell.dateStr);
                }
              }}
              className={`min-h-[50px] sm:min-h-[84px] p-1 sm:p-2 flex flex-col gap-1 rounded-xl transition-all relative cursor-pointer border appearance-none text-left ${cell.isCurrentMonth
                  ? 'bg-cbg border-bmuted hover:bg-inbg hover:border-bmain hover:scale-[1.01]'
                  : 'opacity-20 pointer-events-none'
                } ${isToday ? 'ring-2 ring-accent/45 bg-accent-bg border-accent/40' : ''} ${isSelected ? 'ring-2 ring-accent bg-accent-bg/35 border-accent/60' : ''
                }`}
            >
              {/* Day Number */}
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-xs font-bold font-mono ${dayColor}`}>
                  {cell.day}
                </span>

                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                )}
              </div>

              {/* Tasks text list capsules (Desktop view) */}
              <div className="hidden sm:flex flex-col gap-1 overflow-y-auto max-h-12 scrollbar-none">
                {dateTasks.map(t => (
                  <div
                    key={t.id}
                    className={`px-1.5 py-0.5 rounded text-xs font-bold border-l-2 truncate cursor-default select-none ${getSpaceColorBorder(t.category)}`}
                    title={t.text}
                  >
                    {t.text}
                  </div>
                ))}
              </div>

              {/* Tasks colored dots (Mobile view) */}
              <div className="flex sm:hidden flex-wrap gap-0.5 justify-center mt-auto pb-1">
                {dateTasks.slice(0, 3).map(t => {
                  const space = spaces.find(s => s.id === t.category);
                  const dotColorClass = SPACE_DOT_COLORS[space?.color] || SPACE_DOT_COLORS.indigo;

                  return (
                    <span
                      key={t.id}
                      className={`w-2 h-2 rounded-full ring-1 ring-white/30 shadow-sm ${dotColorClass}`}
                    />
                  );
                })}
                {dateTasks.length > 3 && (
                  <span className="text-xs leading-none text-tmuted font-bold mt-[-2px]">+</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Explorer list drawer underneath */}
      <div className="mt-6 pt-5 border-t border-bmuted flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest text-tmain">
              Agenda for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-tmuted uppercase px-2.5 py-1 bg-inbg rounded-lg border border-bmuted">
            {selectedDateTasks.length} tasks
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-none pr-1">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-bmain rounded-2xl bg-inbg/55 text-tmuted text-xs italic">
              No tasks scheduled for this day. Tap any day cell to explore or log tasks!
            </div>
          ) : (
            selectedDateTasks.map(task => (
              <AgendaTask
                key={task.id}
                task={task}
                space={spaces.find(space => space.id === task.category)}
                isLight={theme === 'lightblue' || theme === 'lightpurple'}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
