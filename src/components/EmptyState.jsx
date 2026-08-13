import { motion } from 'framer-motion';
import { Sparkles, Inbox, Award } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function EmptyState({ filter }) {
  const { theme } = useTasks();
  const isLightTheme = theme === 'lightblue' || theme === 'lightpurple';

  const getContent = () => {
    switch (filter) {
      case 'completed':
        return {
          icon: Award,
          title: 'No completed tasks yet',
          subtitle: 'Keep pushing! Once you finish a task, check it off the list and it will appear here.',
          color: isLightTheme ? 'text-amber-600' : 'text-amber-400',
          bgGlow: isLightTheme ? 'from-amber-600/5 to-transparent' : 'from-amber-500/10 to-transparent'
        };
      case 'active':
        return {
          icon: Sparkles,
          title: 'All caught up!',
          subtitle: 'No active tasks to do. Take a break, enjoy your day, or write down a new idea.',
          color: isLightTheme ? 'text-emerald-600' : 'text-emerald-400',
          bgGlow: isLightTheme ? 'from-emerald-600/5 to-transparent' : 'from-emerald-500/10 to-transparent'
        };
      default:
        return {
          icon: Inbox,
          title: 'Your list is empty',
          subtitle: 'Add a new task above with categories and priorities to start organizing your day.',
          color: isLightTheme ? 'text-indigo-600' : 'text-indigo-400',
          bgGlow: isLightTheme ? 'from-indigo-600/5 to-transparent' : 'from-indigo-500/10 to-transparent'
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center justify-center min-h-[300px] relative overflow-hidden border border-bmain"
    >
      {/* Background Radial Glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${content.bgGlow} pointer-events-none opacity-30`} />
 
      {/* Floating Animated Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute -top-6 -left-6 w-20 h-20 border border-bmuted rounded-full"
        />
        <motion.div
          animate={{
            y: [8, -8, 8],
            x: [-5, 5, -5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -bottom-8 -right-8 w-24 h-24 border border-bmuted rounded-full"
        />
        <motion.div
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent rounded-full blur-xs"
        />
      </div>

      {/* Interactive Main Graphic Icon */}
      <div className="relative mb-4">
        {/* Pulsing Backlight */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`absolute inset-0 rounded-full blur-xl filter ${content.color.replace('text-', 'bg-')}`}
        />
        
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-16 h-16 rounded-2xl bg-inbg border border-bmuted flex items-center justify-center shadow-lg relative z-10 ${content.color}`}
        >
          <Icon size={28} />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-lg font-extrabold tracking-tight text-tmain mb-2 relative z-10"
      >
        {content.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-tsub text-sm max-w-sm leading-relaxed relative z-10 font-medium"
      >
        {content.subtitle}
      </motion.p>
    </motion.div>
  );
}
