import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CalendarClock, ShieldAlert, Ban, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function EisenhowerMatrix() {
  const { tasks, handleToggleComplete, handleDeleteTask, theme } = useTasks();

  // Quadrants dividing:
  // Q1 (Do First): High Priority AND has Due Date
  // Q2 (Schedule): High/Medium Priority AND no Due Date
  // Q3 (Delegate): Low Priority AND has Due Date
  // Q4 (Eliminate): Low Priority AND no Due Date

  const quadrants = useMemo(() => {
    const result = { q1: [], q2: [], q3: [], q4: [] };
    tasks.forEach(task => {
      if (task.completed) return;
      if (task.priority === 'high' && task.dueDate) result.q1.push(task);
      else if ((task.priority === 'high' || task.priority === 'medium') && !task.dueDate) result.q2.push(task);
      else if (task.priority === 'low' && task.dueDate) result.q3.push(task);
      else if (task.priority === 'low' && !task.dueDate) result.q4.push(task);
    });
    return result;
  }, [tasks]);

  const isLight = theme === 'lightblue' || theme === 'lightpurple';

  const quadrantConfig = useMemo(() => [
    {
      id: 'q1',
      title: 'Do First',
      subtitle: 'Urgent & Important',
      icon: Flame,
      tasks: quadrants.q1,
      color: isLight ? 'text-rose-700 font-bold' : 'text-rose-400 font-bold',
      bg: isLight 
        ? 'bg-panel border-rose-300 hover:border-rose-400' 
        : 'bg-panel border-rose-500/30 hover:border-rose-400/60'
    },
    {
      id: 'q2',
      title: 'Schedule',
      subtitle: 'Important, Not Urgent',
      icon: CalendarClock,
      tasks: quadrants.q2,
      color: isLight ? 'text-indigo-700 font-bold' : 'text-indigo-400 font-bold',
      bg: isLight 
        ? 'bg-panel border-indigo-300 hover:border-indigo-400' 
        : 'bg-panel border-indigo-500/30 hover:border-indigo-400/60'
    },
    {
      id: 'q3',
      title: 'Delegate',
      subtitle: 'Urgent, Not Important',
      icon: ShieldAlert,
      tasks: quadrants.q3,
      color: isLight ? 'text-amber-800 font-bold' : 'text-amber-300 font-bold',
      bg: isLight 
        ? 'bg-panel border-amber-300 hover:border-amber-400' 
        : 'bg-panel border-amber-500/30 hover:border-amber-400/60'
    },
    {
      id: 'q4',
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important',
      icon: Ban,
      tasks: quadrants.q4,
      color: isLight ? 'text-zinc-600 font-bold' : 'text-tmuted font-bold',
      bg: 'bg-panel border-bmain hover:border-accent/45'
    }
  ], [isLight, quadrants]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      {quadrantConfig.map((q) => {
        const QIcon = q.icon;
        return (
          <div
            key={q.id}
            className={`matrix-quadrant matrix-quadrant-${q.id} rounded-3xl p-5 border flex flex-col gap-4 min-h-[250px] ${q.bg} transition-all duration-300`}
          >
            {/* Header quadrant description */}
            <div className="flex items-center justify-between pb-2.5 border-b border-bmuted">
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider uppercase text-tmain font-mono flex items-center gap-1.5">
                  <QIcon size={14} className={q.color} />
                  <span>{q.title}</span>
                </span>
                <span className="text-xs text-tmuted font-medium tracking-tight mt-0.5">{q.subtitle}</span>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-inbg border border-bmain text-tsub shadow-inner">
                {q.tasks.length}
              </span>
            </div>

            {/* Scrollable checklist items */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[200px] pr-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {q.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={`matrix-${task.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                    className="todo-card p-3 rounded-2xl glass-panel flex items-center justify-between gap-3 border border-bmuted hover:border-bmain"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="w-4.5 h-4.5 rounded border border-bmuted hover:border-accent hover:bg-accent-bg flex items-center justify-center shrink-0 cursor-pointer focus:outline-none transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-sm bg-transparent" />
                      </button>
                      <span className="text-sm font-bold text-tmain truncate leading-relaxed">
                        {task.text}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-tmuted hover:text-rose-500 hover:bg-accent-bg rounded-md cursor-pointer transition-colors focus:outline-none"
                    >
                      <Trash2 size={13} className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {q.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-bmuted rounded-2xl">
                  <span className="text-xs text-tmuted italic font-medium">No tasks in quadrant</span>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}

