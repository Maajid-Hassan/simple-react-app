import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, CheckCircle, Clock, Zap, Target,
  PieChart, BarChart2
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function Dashboard() {
  const { tasks, spaces, theme } = useTasks();
  const isLightTheme = theme === 'lightblue' || theme === 'lightpurple';

  // 1. Calculate General Telemetry
  const totalTasks = tasks.length;
  const dashboardStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const weeklyCounts = new Map();
    const spaceStats = new Map(spaces.map(space => [space.id, { total: 0, completed: 0 }]));
    let completedTasks = 0;
    let highPriorityCount = 0;
    let overdueCount = 0;

    tasks.forEach(task => {
      if (task.completed) completedTasks += 1;
      if (task.priority === 'high' && !task.completed) highPriorityCount += 1;
      if (task.dueDate && !task.completed && new Date(task.dueDate).getTime() < today) overdueCount += 1;

      const space = spaceStats.get(task.category);
      if (space) {
        space.total += 1;
        if (task.completed) space.completed += 1;
      }

      if (task.completed && task.createdAt) {
        const date = new Date(task.createdAt).toDateString();
        weeklyCounts.set(date, (weeklyCounts.get(date) || 0) + 1);
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      weeklyData.push({ day: days[date.getDay()], count: weeklyCounts.get(dateString) || 0 });
    }

    const spaceBreakdown = spaces.map(space => {
      const stats = spaceStats.get(space.id);
      return {
        ...space,
        count: stats.total,
        completed: stats.completed,
        percentage: totalTasks > 0 ? Math.round((stats.total / totalTasks) * 100) : 0
      };
    }).filter(space => space.count > 0);

    return { completedTasks, highPriorityCount, overdueCount, weeklyData, spaceBreakdown };
  }, [spaces, tasks, totalTasks]);

  const { completedTasks, highPriorityCount, overdueCount, weeklyData, spaceBreakdown } = dashboardStats;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Weekly Productivity Chart Calculations (Last 7 Days)
  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Header Hero Panel */}
      <motion.div 
        variants={cardVariants} 
        className="dashboard-hero glass-panel p-6 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/20 via-accent-hover/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <span className="text-xs font-extrabold text-accent uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Zap size={11} className="animate-pulse" />
              <span>Workspace Diagnostics</span>
            </span>
            <h2 className="text-2xl font-extrabold text-tmain tracking-tight mesh-readable">
              Productivity Telemetry
            </h2>
            <p className="text-tmuted text-sm mt-1">
              Real-time insights, behavioral metrics, and completion analytics.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Micro Metrics Row */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completion rate */}
        <motion.div 
          variants={cardVariants} 
          whileHover={{ y: -2, borderColor: 'var(--accent)' }}
          className="dashboard-metric glass-panel p-4 rounded-2xl flex items-center gap-3 border transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-bg border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Target size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-tmuted uppercase tracking-widest block truncate">Completion Rate</span>
            <span className="text-xl font-extrabold text-tmain font-mono">{completionRate}%</span>
          </div>
        </motion.div>

        {/* Metric 2: Completed count */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: '#10b981' }}
          className="dashboard-metric dashboard-metric-done glass-panel p-4 rounded-2xl flex items-center gap-3 border transition-all"
        >
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-emerald-500/18 border-emerald-500/30 text-emerald-300'}`}>
            <CheckCircle size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-tmuted uppercase tracking-widest block truncate">Completed Tasks</span>
            <span className="text-xl font-extrabold text-tmain font-mono">{completedTasks} <span className="text-tmuted text-xs">/ {totalTasks}</span></span>
          </div>
        </motion.div>

        {/* Metric 3: High Priority focus */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: '#f43f5e' }}
          className="dashboard-metric dashboard-metric-focus glass-panel p-4 rounded-2xl flex items-center gap-3 border transition-all"
        >
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-rose-500/18 border-rose-500/30 text-rose-300'}`}>
            <TrendingUp size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-tmuted uppercase tracking-widest block truncate">High Priority Active</span>
            <span className="text-xl font-extrabold text-tmain font-mono">{highPriorityCount}</span>
          </div>
        </motion.div>

        {/* Metric 4: Overdue tasks */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -2, borderColor: '#f59e0b' }}
          className="dashboard-metric dashboard-metric-overdue glass-panel p-4 rounded-2xl flex items-center gap-3 border transition-all"
        >
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-500/18 border-amber-500/30 text-amber-300'}`}>
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-tmuted uppercase tracking-widest block truncate">Overdue Items</span>
            <span className="text-xl font-extrabold text-tmain font-mono">{overdueCount}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Advanced Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Weekly Productivity SVG Bar Chart (Left 3 cols) */}
        <motion.div 
          variants={cardVariants}
          className="dashboard-surface glass-panel p-5 rounded-3xl md:col-span-3 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-tmain uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 size={12} className="text-accent" />
              <span>Weekly Completion Frequency</span>
            </span>
            <span className="text-xs font-mono text-tmuted">Last 7 Days</span>
          </div>

          {/* SVG Animated Bars */}
          <div className="relative h-48 flex items-end justify-between px-2 pt-6">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs font-mono text-tsub select-none pb-6 pt-2">
              <div className="border-b border-bmuted w-full flex justify-between"><span className="px-1.5 py-0.5 rounded-md bg-panel/90 border border-bmuted font-bold">Max</span></div>
              <div className="border-b border-bmuted w-full"></div>
              <div className="border-b border-bmuted w-full"></div>
              <div className="border-b border-bmuted w-full flex justify-between"><span className="px-1.5 py-0.5 rounded-md bg-panel/90 border border-bmuted font-bold">0</span></div>
            </div>

            {weeklyData.map((d, index) => {
              const heightPct = (d.count / maxWeeklyCount) * 100;
              return (
                <div key={d.day} className="flex flex-col items-center gap-2 z-10 w-full group">
                  <div className="relative w-7 sm:w-10 h-32 flex items-end">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-inbg border border-accent/30 text-tmain rounded text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
                      {d.count} tasks
                    </div>

                    {/* The bar with dynamic height & spring pop animation */}
                    <motion.div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-accent to-accent-hover shadow-lg shadow-accent/10 group-hover:from-accent-hover group-hover:to-accent-text"
                      initial={{ height: '0%' }}
                      animate={{ height: `${Math.max(heightPct, 5)}%` }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 100, 
                        damping: 15, 
                        delay: index * 0.05 
                      }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-tsub group-hover:text-tmain transition-colors">{d.day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Space Categorical Breakdown & Custom Donut (Right 2 cols) */}
        <motion.div 
          variants={cardVariants}
          className="dashboard-surface glass-panel p-5 rounded-3xl md:col-span-2 flex flex-col gap-4"
        >
          <span className="text-xs font-bold text-tmain uppercase tracking-widest flex items-center gap-1.5">
            <PieChart size={12} className="text-accent" />
            <span>Workspace Load distribution</span>
          </span>

          {spaceBreakdown.length > 0 ? (
            <div className="flex flex-col gap-4 justify-center h-full">
              {/* Custom SVG Donut Circle */}
              <div className="flex justify-center relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    className="stroke-bmuted stroke-[7] fill-transparent"
                  />
                  {/* Layered strokes based on space breakdowns */}
                  {(() => {
                    let cumulativePercentage = 0;
                    return spaceBreakdown.map((s) => {
                      const strokeDash = (s.percentage / 100) * (2 * Math.PI * 38);
                      const strokeOffset = (cumulativePercentage / 100) * (2 * Math.PI * 38);
                      cumulativePercentage += s.percentage;

                      // Map space colors to hex strings
                      const getSpaceHex = (color) => {
                        switch (color) {
                          case 'indigo': return '#6366f1';
                          case 'emerald': return '#10b981';
                          case 'amber': return '#f59e0b';
                          case 'rose': return '#f43f5e';
                          case 'purple': return '#a855f7';
                          default: return '#71717a';
                        }
                      };

                      return (
                        <motion.circle
                          key={s.id}
                          cx="48"
                          cy="48"
                          r="38"
                          stroke={getSpaceHex(s.color)}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 38}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                          animate={{ strokeDashoffset: (2 * Math.PI * 38) - strokeDash }}
                          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
                          style={{
                            transformOrigin: 'center',
                            rotate: `${(strokeOffset / (2 * Math.PI * 38)) * 360}deg`
                          }}
                          className="hover:stroke-[10] transition-all cursor-pointer drop-shadow-[0_0_8px_rgba(99,102,241,0.22)]"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Donut Inner Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none rounded-full bg-panel/90 border border-bmuted w-14 h-14 flex flex-col items-center justify-center shadow-[0_0_18px_rgba(0,0,0,0.18)]">
                  <span className="text-xs font-black text-tsub uppercase tracking-wider block leading-none">TOTAL</span>
                  <span className="text-base font-black text-tmain font-mono drop-shadow-sm">{totalTasks}</span>
                </div>
              </div>

              {/* Categorical details items list */}
              <div className="flex flex-col gap-2">
                {spaceBreakdown.map(space => {
                  const getColorDot = (color) => {
                    switch (color) {
                      case 'indigo': return 'bg-indigo-500';
                      case 'emerald': return 'bg-emerald-500';
                      case 'amber': return 'bg-amber-500';
                      case 'rose': return 'bg-rose-500';
                      case 'purple': return 'bg-purple-500';
                      default: return 'bg-zinc-500';
                    }
                  };

                  return (
                    <div key={space.id} className="flex items-center justify-between p-2 rounded-xl bg-inbg border border-bmuted">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getColorDot(space.color)} shrink-0`} />
                        <span className="text-xs font-bold text-tmain">{space.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs text-tmuted">
                        <span>{space.count} items</span>
                        <span className="text-bmuted">|</span>
                        <span className="text-tmain font-bold">{space.percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-tmuted italic text-xs">
              No categories mapped. Add items to visualize load.
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
