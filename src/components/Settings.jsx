import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Sun, Moon, Sparkles, Volume2, VolumeX, 
  Layout, Eye, EyeOff, Target, Download, Upload, 
  FileSpreadsheet, RotateCcw, Trash2, CheckCircle2, 
  AlertTriangle, Sliders, Check
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function Settings() {
  const { 
    theme, setTheme,
    userSettings, updateSetting,
    handleExportJSON, handleExportCSV, handleImportJSON,
    handleResetSampleData, handleClearAllData,
    tasks
  } = useTasks();

  const [importStatus, setImportStatus] = useState(null); // { type: 'success'|'error', msg: string }
  const [confirmModal, setConfirmModal] = useState(null); // 'reset' | 'clear' | null
  const fileInputRef = useRef(null);

  const isLight = theme === 'lightblue' || theme === 'lightpurple';

  const darkThemes = [
    {
      id: 'obsidian',
      name: 'Zen Obsidian',
      description: 'Deep, focused dark mode with indigo accents',
      gradient: 'from-zinc-900 via-zinc-800 to-indigo-950',
      accentDot: 'bg-indigo-400',
      preview: ['#18181b', '#27272a', '#6366f1']
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      description: 'Electric neon vibes with pink-purple glow',
      gradient: 'from-indigo-950 via-purple-950 to-pink-950',
      accentDot: 'bg-pink-400',
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
      preview: ['#e0f2fe', '#f0f9ff', '#0284c7']
    },
    {
      id: 'lightpurple',
      name: 'Lavender Dream',
      description: 'Soft and warm with gentle purple pastels',
      gradient: 'from-purple-100 via-violet-50 to-fuchsia-100',
      accentDot: 'bg-purple-600',
      preview: ['#f3e8ff', '#faf5ff', '#9333ea']
    }
  ];

  const views = [
    { id: 'list', label: 'Task List' },
    { id: 'kanban', label: 'Kanban Board' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'matrix', label: 'Eisenhower Matrix' },
    { id: 'dashboard', label: 'Dashboard' }
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = handleImportJSON(content);
        if (result.success) {
          setImportStatus({ type: 'success', msg: `Successfully imported ${result.count} tasks!` });
        } else {
          setImportStatus({ type: 'error', msg: result.error || 'Failed to import backup.' });
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const todayGoal = userSettings?.dailyGoal || 5;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      {/* Header Banner */}
      <motion.div
        variants={cardVariants}
        className="glass-panel p-6 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/20 via-accent-hover/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-accent uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Palette size={12} />
              <span>Workspace Preferences</span>
            </span>
            <h2 className="text-2xl font-extrabold text-tmain tracking-tight">
              Settings & Customization
            </h2>
            <p className="text-tmuted text-sm mt-1">
              Configure themes, sound effects, data backups, and workspace defaults.
            </p>
          </div>

          {/* Quick Summary Badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 contrast-surface rounded-2xl border border-bmuted shrink-0">
            <div className="text-right">
              <span className="text-xs text-tmuted font-semibold block">Total Tasks</span>
              <span className="text-base font-extrabold text-accent">{tasks.length}</span>
            </div>
            <div className="h-7 w-px bg-bmuted" />
            <div>
              <span className="text-xs text-tmuted font-semibold block">Completed</span>
              <span className="text-base font-extrabold text-emerald-400">{completedCount}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 1. Theme & Appearance Section */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-accent-bg border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-sm">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-tmain uppercase tracking-wider">Appearance & Themes</h3>
            <p className="text-xs text-tmuted">Customize your visual palette and density</p>
          </div>
        </div>

        {/* Dark Themes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Moon size={12} className="text-tmuted" />
            <span className="text-xs font-black uppercase tracking-widest text-tmuted">Dark Themes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {darkThemes.map(t => {
              const isSelected = theme === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-2xl cursor-pointer text-left transition-all border ${
                    isSelected
                      ? 'bg-panel border-accent shadow-lg shadow-accent/15'
                      : 'bg-card border-bmuted hover:border-accent/40'
                  }`}
                >
                  <div className={`h-16 rounded-xl bg-gradient-to-r ${t.gradient} relative overflow-hidden mb-3 border border-white/10`}>
                    <div className="absolute bottom-2 left-3 flex gap-1.5">
                      {t.preview.map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-md">
                        <Check size={12} className="text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.accentDot}`} />
                    <span className="text-sm font-extrabold text-tmain">{t.name}</span>
                  </div>
                  <p className="text-xs text-tmuted mt-0.5 leading-relaxed">{t.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Light Themes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <Sun size={12} className="text-tmuted" />
            <span className="text-xs font-black uppercase tracking-widest text-tmuted">Light Themes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lightThemes.map(t => {
              const isSelected = theme === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-2xl cursor-pointer text-left transition-all border ${
                    isSelected
                      ? 'bg-panel border-accent shadow-lg shadow-accent/15'
                      : 'bg-card border-bmuted hover:border-accent/40'
                  }`}
                >
                  <div className={`h-16 rounded-xl bg-gradient-to-r ${t.gradient} relative overflow-hidden mb-3 border border-black/10`}>
                    <div className="absolute bottom-2 left-3 flex gap-1.5">
                      {t.preview.map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-md">
                        <Check size={12} className="text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.accentDot}`} />
                    <span className="text-sm font-extrabold text-tmain">{t.name}</span>
                  </div>
                  <p className="text-xs text-tmuted mt-0.5 leading-relaxed">{t.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Compact Mode & Sound Toggles */}
        <div className="pt-4 border-t border-bmuted grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Compact Density Toggle */}
          <div className="p-4 contrast-surface rounded-2xl flex items-center justify-between border border-bmuted">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-bg text-accent">
                <Layout size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-tmain block">Compact Task Layout</span>
                <span className="text-xs text-tmuted">Reduce card padding for high density</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('compactMode', !userSettings?.compactMode)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer focus:outline-none ${
                userSettings?.compactMode ? 'bg-accent' : 'bg-inbg border border-bmuted'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                userSettings?.compactMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Sound Effects Toggle */}
          <div className="p-4 contrast-surface rounded-2xl flex items-center justify-between border border-bmuted">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-bg text-accent">
                {userSettings?.soundEffects ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <div>
                <span className="text-xs font-bold text-tmain block">Task Chime Sound</span>
                <span className="text-xs text-tmuted">Audio chime when completing tasks</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('soundEffects', !userSettings?.soundEffects)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer focus:outline-none ${
                userSettings?.soundEffects ? 'bg-accent' : 'bg-inbg border border-bmuted'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                userSettings?.soundEffects ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>
      </motion.div>

      {/* 2. Productivity Preferences */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-accent-bg border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-sm">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-tmain uppercase tracking-wider">Productivity & View Defaults</h3>
            <p className="text-xs text-tmuted">Set default view on launch and filtering preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Default Startup View */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-tmain block">
              Default Startup View
            </label>
            <p className="text-xs text-tmuted mb-2">Select which screen opens automatically when you launch ZenFlow</p>
            <select
              value={userSettings?.defaultView || 'list'}
              onChange={(e) => updateSetting('defaultView', e.target.value)}
              className="w-full bg-inbg border border-bmuted rounded-xl px-3 py-2.5 text-xs text-tmain focus:outline-none focus:border-accent cursor-pointer font-medium"
            >
              {views.map(v => (
                <option key={v.id} value={v.id} className="bg-panel text-tmain">
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Completion Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-tmain flex items-center gap-1.5">
                <Target size={14} className="text-accent" />
                <span>Daily Task Target</span>
              </label>
              <span className="text-xs font-extrabold font-mono text-accent bg-accent-bg px-2 py-0.5 rounded-lg border border-accent/20">
                {todayGoal} tasks/day
              </span>
            </div>
            <p className="text-xs text-tmuted mb-2">Set your daily target goal for completing tasks</p>
            <input
              type="range"
              min="1"
              max="20"
              value={todayGoal}
              onChange={(e) => updateSetting('dailyGoal', parseInt(e.target.value, 10))}
              className="w-full accent-accent cursor-pointer h-2 bg-inbg rounded-lg"
            />
          </div>

        </div>

        {/* Auto-Hide Completed Tasks */}
        <div className="p-4 contrast-surface rounded-2xl flex items-center justify-between border border-bmuted">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-bg text-accent">
              {userSettings?.hideCompleted ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
            <div>
              <span className="text-xs font-bold text-tmain block">Auto-Hide Completed Tasks</span>
              <span className="text-xs text-tmuted">Automatically filter completed tasks from the main list</span>
            </div>
          </div>
          <button
            onClick={() => updateSetting('hideCompleted', !userSettings?.hideCompleted)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer focus:outline-none ${
              userSettings?.hideCompleted ? 'bg-accent' : 'bg-inbg border border-bmuted'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              userSettings?.hideCompleted ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

      </motion.div>

      {/* 3. Data Backup & Import/Export */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-accent-bg border border-accent/20 flex items-center justify-center text-accent shrink-0 shadow-sm">
            <Download size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-tmain uppercase tracking-wider">Data Backup & Sync</h3>
            <p className="text-xs text-tmuted">Export your tasks to JSON or CSV, or restore from a backup</p>
          </div>
        </div>

        {/* Import notification alert */}
        <AnimatePresence>
          {importStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
                importStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold'
              }`}
            >
              {importStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{importStatus.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Export JSON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportJSON}
            className="p-4 contrast-surface rounded-2xl border border-bmuted hover:border-accent/40 flex flex-col items-start gap-3 text-left cursor-pointer transition-colors group"
          >
            <div className="p-2.5 rounded-xl bg-accent-bg text-accent group-hover:scale-110 transition-transform">
              <Download size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-tmain block">Export Backup (JSON)</span>
              <span className="text-xs text-tmuted leading-relaxed">Download full workspace state & tasks file</span>
            </div>
          </motion.button>

          {/* Export CSV */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="p-4 contrast-surface rounded-2xl border border-bmuted hover:border-accent/40 flex flex-col items-start gap-3 text-left cursor-pointer transition-colors group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-tmain block">Export Spreadsheet (CSV)</span>
              <span className="text-xs text-tmuted leading-relaxed">Save task list in Excel / Google Sheets format</span>
            </div>
          </motion.button>

          {/* Import JSON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-4 contrast-surface rounded-2xl border border-bmuted hover:border-accent/40 flex flex-col items-start gap-3 text-left cursor-pointer transition-colors group relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Upload size={18} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-tmain block">Import Backup (JSON)</span>
              <span className="text-xs text-tmuted leading-relaxed">Upload and restore tasks from JSON backup file</span>
            </div>
          </motion.button>

        </div>
      </motion.div>

      {/* 4. Danger Zone / Reset Options */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-3xl space-y-5 border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 shadow-sm">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-tmain uppercase tracking-wider">Storage & Reset Zone</h3>
            <p className="text-xs text-tmuted">Reset sample demonstration data or clear workspace tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Reset Sample Data */}
          <button
            onClick={() => setConfirmModal('reset')}
            className="p-4 contrast-surface rounded-2xl border border-bmuted hover:border-amber-500/40 flex items-center gap-3 text-left cursor-pointer transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <RotateCcw size={16} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-tmain block">Restore Sample Data</span>
              <span className="text-xs text-tmuted">Reload original interactive demo task set</span>
            </div>
          </button>

          {/* Clear All Tasks */}
          <button
            onClick={() => setConfirmModal('clear')}
            className="p-4 contrast-surface rounded-2xl border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/5 flex items-center gap-3 text-left cursor-pointer transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <Trash2 size={16} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-rose-400 block">Clear All Tasks</span>
              <span className="text-xs text-tmuted">Delete all tasks and start with an empty board</span>
            </div>
          </button>

        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-3xl max-w-md w-full border border-bmuted space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-tmain">
                    {confirmModal === 'reset' ? 'Restore Sample Tasks?' : 'Clear All Tasks?'}
                  </h4>
                  <p className="text-xs text-tmuted mt-0.5">
                    {confirmModal === 'reset'
                      ? 'This will reset your tasks to the default sample dataset and reload the page.'
                      : 'This action will remove all current tasks from your active workspace.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-inbg border border-bmuted rounded-xl text-xs font-bold text-tmuted hover:text-tmain cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal === 'reset') {
                      handleResetSampleData();
                    } else if (confirmModal === 'clear') {
                      handleClearAllData();
                      setConfirmModal(null);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer focus:outline-none ${
                    confirmModal === 'reset'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
