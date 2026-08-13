import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Play,
  ArrowLeft, ArrowRight, ListTodo
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function KanbanBoard() {
  const { tasks, handleUpdateTaskMeta, handleToggleComplete, theme } = useTasks();
  const isLightTheme = theme === 'lightblue' || theme === 'lightpurple';

  // Columns definition:
  // Column 1: "To Do" -> Not completed, priority low/medium
  // Column 2: "In Focus" -> Not completed, priority high
  // Column 3: "Completed" -> Completed

  const getTasksByColumn = (colId) => {
    switch (colId) {
      case 'todo':
        return tasks.filter(t => !t.completed && t.priority !== 'high');
      case 'focus':
        return tasks.filter(t => !t.completed && t.priority === 'high');
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return [];
    }
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'high') {
      return isLightTheme
        ? 'bg-rose-50 border-rose-200 text-rose-700'
        : 'bg-rose-500/15 border-rose-500/25 text-rose-400';
    }
    return 'bg-inbg text-tmuted border-bmuted';
  };

  const columns = [
    { id: 'todo', title: 'To Do', icon: ListTodo, color: 'text-tsub', border: 'border-bmuted bg-inbg', badge: 'bg-panel border-bmuted text-tsub' },
    {
      id: 'focus',
      title: 'In Progress (High Focus)',
      icon: Play,
      color: 'text-accent',
      border: isLightTheme ? 'border-accent/30 bg-accent-bg/10' : 'border-accent/35 bg-inbg',
      badge: 'bg-accent-bg border-accent/40 text-accent-text'
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: isLightTheme ? 'text-emerald-700 font-extrabold' : 'text-emerald-400 font-extrabold',
      border: isLightTheme ? 'border-emerald-200 bg-emerald-50/30' : 'border-emerald-500/25 bg-inbg',
      badge: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
    }
  ];

  const handleShiftTask = (taskId, fromCol, direction) => {

    if (fromCol === 'todo') {
      if (direction === 'right') {
        // Shift To Do -> In Focus (make Priority = high)
        handleUpdateTaskMeta(taskId, { priority: 'high' });
      }
    } else if (fromCol === 'focus') {
      if (direction === 'left') {
        // Shift In Focus -> To Do (make Priority = medium)
        handleUpdateTaskMeta(taskId, { priority: 'medium' });
      } else if (direction === 'right') {
        // Shift In Focus -> Completed
        handleToggleComplete(taskId);
      }
    } else if (fromCol === 'completed') {
      if (direction === 'left') {
        // Shift Completed -> In Focus (mark uncomplete, make priority = high)
        handleToggleComplete(taskId);
        handleUpdateTaskMeta(taskId, { priority: 'high' });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none h-full items-start">
      {columns.map((col) => {
        const colTasks = getTasksByColumn(col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className={`kanban-lane kanban-lane-${col.id} rounded-3xl p-4 border flex flex-col gap-4 min-h-[450px] ${col.border}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-bmuted">
              <div className="flex items-center gap-2">
                <Icon size={16} className={col.color} />
                <span className="font-black text-sm tracking-wider uppercase text-tmain">{col.title}</span>
              </div>
              <span className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full border backdrop-blur-sm shadow-inner transition-colors ${col.badge}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Column Tasks List Container */}
            <div className="flex flex-col gap-3 h-full overflow-y-auto max-h-[500px] pr-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {colTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={`kanban-${task.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                    className={`todo-card p-3.5 rounded-2xl glass-panel relative flex flex-col gap-3 group border transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${task.completed
                        ? 'border-bmuted/60 bg-panel/70 opacity-75'
                        : 'border-bmuted hover:border-bmain'
                      }`}
                  >
                    {/* Header: title */}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-sm font-bold leading-relaxed tracking-tight ${task.completed ? 'text-tmuted line-through font-medium' : 'text-tmain'
                        }`}>
                        {task.text}
                      </span>
                    </div>

                    {/* Footer tags and shifting triggers */}
                    <div className="flex justify-between items-center w-full mt-1 pt-2.5 border-t border-bmuted gap-2">

                      {/* Priority Tag */}
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-widest border transition-colors shrink-0 ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Direction Shift Controls */}
                      <div className="flex gap-1 bg-inbg p-0.5 rounded-xl border border-bmuted shrink-0">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => handleShiftTask(task.id, col.id, 'left')}
                            className="p-1 hover:bg-accent-bg text-tmuted hover:text-tmain rounded-md cursor-pointer focus:outline-none"
                            title="Shift Left"
                          >
                            <ArrowLeft size={11} />
                          </button>
                        )}

                        {col.id !== 'completed' && (
                          <button
                            onClick={() => handleShiftTask(task.id, col.id, 'right')}
                            className="p-1 hover:bg-accent-bg text-tmuted hover:text-tmain rounded-md cursor-pointer focus:outline-none"
                            title="Shift Right"
                          >
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-bmuted rounded-2xl">
                  <span className="text-xs text-tmuted italic font-bold">Lane is empty</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
