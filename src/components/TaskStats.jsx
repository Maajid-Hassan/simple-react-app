import { motion } from 'framer-motion';
import { CheckCircle2, ListTodo, Percent } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskStats({ tasks }) {
  const { theme } = useTasks();
  const isLightTheme = theme === 'lightblue' || theme === 'lightpurple';

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Total Card */}
      <div className="stat-card stat-card-total glass-panel p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-bmain">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <ListTodo size={40} className={isLightTheme ? 'text-indigo-600' : 'text-indigo-400'} />
        </div>
        <span className="text-tsub text-xs font-bold uppercase tracking-wider">Total</span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-bold tracking-tight text-tmain">{total}</span>
          <span className="text-tmuted text-sm font-semibold">tasks</span>
        </div>
      </div>

      {/* Completed Card */}
      <div className="stat-card stat-card-done glass-panel p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-bmain">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <CheckCircle2 size={40} className={isLightTheme ? 'text-emerald-600' : 'text-emerald-400'} />
        </div>
        <span className="text-tsub text-xs font-bold uppercase tracking-wider">Done</span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-2xl font-bold tracking-tight ${isLightTheme ? 'text-emerald-600' : 'text-emerald-400'}`}>{completed}</span>
          <span className="text-tmuted text-sm font-semibold">/ {total}</span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="stat-card stat-card-progress glass-panel p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden group col-span-1 border border-bmain">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Percent size={36} className={isLightTheme ? 'text-amber-600' : 'text-amber-400'} />
        </div>
        <div>
          <span className="text-tsub text-xs font-bold uppercase tracking-wider">Progress</span>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className={`text-2xl font-bold tracking-tight ${isLightTheme ? 'text-amber-600' : 'text-amber-400'}`}>{percentage}</span>
            <span className={`text-sm font-bold ${isLightTheme ? 'text-amber-600/70' : 'text-amber-400/70'}`}>%</span>
          </div>
        </div>
        
        {/* Compact linear progress layout */}
        <div className="mt-4 w-full">
          <div className="w-full h-1.5 bg-inbg rounded-full overflow-hidden border border-bmuted/50 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 15,
                mass: 0.8
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
