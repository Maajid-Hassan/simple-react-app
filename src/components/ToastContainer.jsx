import { motion, AnimatePresence } from 'framer-motion';
import { Undo, Info } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function ToastContainer() {
  const { toasts, handleUndo, theme, pauseToastTimer, resumeToastTimer } = useTasks();
  const isLightTheme = theme === 'lightblue' || theme === 'lightpurple';

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onMouseEnter={() => pauseToastTimer(t.id)}
            onMouseLeave={() => resumeToastTimer(t.id)}
            onFocus={() => pauseToastTimer(t.id)}
            onBlur={() => resumeToastTimer(t.id)}
            tabIndex={0}
            className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4 pointer-events-auto border border-bmain relative overflow-hidden shadow-2xl"
          >
            {/* Dynamic Countdown Progress Bar driven by context tick */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-accent origin-left transition-none"
              style={{ width: `${Math.max(t.progress, 0)}%` }}
            />

            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                isLightTheme
                  ? 'bg-accent-bg border-accent/25 text-accent'
                  : 'bg-accent-bg border-accent/20 text-accent-text'
              }`}>
                <Info size={16} />
              </div>
              <span className="text-xs font-bold text-tmain tracking-tight block truncate pr-2">
                {t.message}
              </span>
            </div>

            {/* Undo trigger button */}
            {t.action && (
              <motion.button
                onClick={() => handleUndo(t.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer border ${
                  isLightTheme
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-accent-bg border-accent/25 text-accent-text hover:text-accent'
                }`}
              >
                <Undo size={11} />
                <span>Undo</span>
              </motion.button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
