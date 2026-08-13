import { motion } from 'framer-motion';
import { Palette, Sun, Moon, Sparkles } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function Settings() {
  const { theme, setTheme } = useTasks();

  const isLight = theme === 'lightblue' || theme === 'lightpurple';

  const darkThemes = [
    {
      id: 'obsidian',
      name: 'Zen Obsidian',
      description: 'Deep, focused dark mode with indigo accents',
      gradient: 'from-zinc-900 via-zinc-800 to-indigo-950',
      accentDot: 'bg-indigo-400',
      ring: 'ring-indigo-500',
      preview: ['#18181b', '#27272a', '#6366f1']
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      description: 'Electric neon vibes with pink-purple glow',
      gradient: 'from-indigo-950 via-purple-950 to-pink-950',
      accentDot: 'bg-pink-400',
      ring: 'ring-pink-500',
      preview: ['#1e1b4b', '#581c87', '#ec4899']
    }
  ];

  const lightThemes = [
    {
      id: 'lightblue',
      name: 'Glacial Blue',
      description: 'Clean, crisp daylight with sky blue tones',
      gradient: 'from-sky-100 via-sky-50 to-blue-100',
      accentDot: 'bg-sky-600',
      ring: 'ring-sky-500',
      preview: ['#e0f2fe', '#f0f9ff', '#0284c7']
    },
    {
      id: 'lightpurple',
      name: 'Lavender Dream',
      description: 'Soft and warm with gentle purple pastels',
      gradient: 'from-purple-100 via-violet-50 to-fuchsia-100',
      accentDot: 'bg-purple-600',
      ring: 'ring-purple-500',
      preview: ['#f3e8ff', '#faf5ff', '#9333ea']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
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

  const ThemeCard = ({ t, isDark }) => {
    const isSelected = theme === t.id;

    return (
      <motion.button
        variants={cardVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setTheme(t.id)}
        className={`relative group p-0.5 rounded-2xl cursor-pointer focus:outline-none transition-shadow duration-300 ${
          isSelected
            ? 'shadow-xl shadow-accent/20'
            : 'shadow-md hover:shadow-lg'
        }`}
      >
        {/* Animated border gradient when selected */}
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isSelected
            ? 'opacity-100 bg-gradient-to-br from-accent via-accent-hover to-accent-text'
            : 'opacity-0'
        }`} />

        <div className={`relative rounded-[14px] p-5 flex flex-col gap-4 transition-all duration-300 border ${
          isSelected
            ? 'bg-panel border-transparent'
            : `bg-panel border-bmuted hover:border-accent/30 ${
                isLight ? 'bg-white/80' : ''
              }`
        }`}>
          {/* Theme Preview Strip */}
          <div className={`h-16 rounded-xl bg-gradient-to-r ${t.gradient} relative overflow-hidden border ${
            isSelected ? 'border-accent/30' : 'border-bmuted'
          }`}>
            {/* Color dots preview */}
            <div className="absolute bottom-2 left-3 flex gap-1.5">
              {t.preview.map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300 }}
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Mode icon */}
            <div className="absolute top-2 right-2">
              {isDark ? (
                <Moon size={14} className="text-white/50" />
              ) : (
                <Sun size={14} className="text-black/30" />
              )}
            </div>

            {/* Selected checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Theme Info */}
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${t.accentDot} shrink-0`} />
              <span className="text-sm font-extrabold text-tmain tracking-tight">{t.name}</span>
            </div>
            <p className="text-xs text-tmuted leading-relaxed pl-[18px]">
              {t.description}
            </p>
          </div>

          {/* Active badge */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-accent-bg border border-accent/20 rounded-xl"
            >
              <Sparkles size={10} className="text-accent" />
              <span className="text-xs font-black text-accent uppercase tracking-widest">Active Theme</span>
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={cardVariants}
        className="glass-panel p-6 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/20 via-accent-hover/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-xs font-extrabold text-accent uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Palette size={11} />
            <span>Preferences</span>
          </span>
          <h2 className="text-2xl font-extrabold text-tmain tracking-tight">
            Settings
          </h2>
          <p className="text-tmuted text-sm mt-1">
            Personalize your ZenFlow experience. Theme, visibility, and interface preferences.
          </p>
        </div>
      </motion.div>

      {/* Appearance / Theme Section */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-bg border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Palette size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-tmain uppercase tracking-wider">Appearance</h3>
            <p className="text-xs text-tmuted">Choose a visual theme for your workspace</p>
          </div>
        </div>

        {/* Dark Themes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Moon size={12} className="text-tmuted" />
            <span className="text-xs font-black uppercase tracking-widest text-tmuted">Dark Themes</span>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {darkThemes.map(t => (
              <ThemeCard key={t.id} t={t} isDark={true} />
            ))}
          </motion.div>
        </div>

        {/* Light Themes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sun size={12} className="text-tmuted" />
            <span className="text-xs font-black uppercase tracking-widest text-tmuted">Light Themes</span>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lightThemes.map(t => (
              <ThemeCard key={t.id} t={t} isDark={false} />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
