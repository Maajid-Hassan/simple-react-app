import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, UserPlus, Repeat, ChevronDown, ChevronUp
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskInput() {
  const { handleAddTask, spaces, activeSpace } = useTasks();

  const [text, setText] = useState('');
  const [category, setCategory] = useState(() => {
    return activeSpace === 'all' ? (spaces[0]?.id || 'work') : activeSpace;
  });
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  
  const [isFocused, setIsFocused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const effectiveCategory = activeSpace === 'all' ? category : activeSpace;

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-emerald-500', textColor: 'text-emerald-500 font-extrabold' },
    { id: 'medium', label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500 font-extrabold' },
    { id: 'high', label: 'High', color: 'bg-rose-500', textColor: 'text-rose-500 font-extrabold' }
  ];

  const assignees = [
    { id: 'MA', name: 'Murali (MA)', color: 'from-blue-500 to-indigo-500' },
    { id: 'AI', name: 'Antigravity (AI)', color: 'from-purple-500 to-pink-500' },
    { id: 'TL', name: 'Team Lead (TL)', color: 'from-emerald-500 to-teal-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    handleAddTask({
      text: text.trim(),
      category: effectiveCategory,
      priority,
      dueDate: dueDate || null,
      assignee: assignee || null,
      recurrence
    });

    setText('');
    setDueDate('');
    setAssignee('');
    setRecurrence('none');
    setShowOptions(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="task-creator glass-panel p-4 rounded-3xl flex flex-col gap-3.5 mb-6 relative overflow-hidden select-none"
      animate={{
        borderColor: isFocused ? 'var(--creator-accent)' : 'var(--creator-border)'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Focus activation wash */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent/10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex gap-2.5 items-center relative z-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Add a new task..."
            className="w-full px-4 py-3 rounded-2xl text-sm text-tmain placeholder-tmuted placeholder:font-medium focus:outline-none glass-input"
          />
        </div>

        {/* Accordion Expand buttons */}
        <button
          type="button"
          onClick={() => {
            setShowOptions(!showOptions);
          }}
          className={`h-11 px-3 rounded-2xl flex items-center justify-center border transition-all cursor-pointer focus:outline-none ${
            showOptions 
              ? 'bg-accent-bg text-tmain border-accent/50 shadow-[0_0_18px_var(--accent-bg)]' 
              : 'bg-inbg text-tmuted border-bmuted hover:text-tsub hover:bg-inbg/80 hover:border-bmain'
          }`}
          title="Expand advanced settings"
        >
          {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <motion.button
          type="submit"
          disabled={!text.trim()}
          whileHover={{ scale: text.trim() ? 1.02 : 1 }}
          whileTap={{ scale: text.trim() ? 0.98 : 1 }}
          className={`h-11 px-4.5 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-sm tracking-wide uppercase cursor-pointer border ${
            text.trim()
              ? 'bg-gradient-to-r from-accent to-accent-hover text-white border-accent shadow-lg shadow-accent/15'
              : 'bg-inbg text-tmuted border-bmuted opacity-50 cursor-not-allowed'
          }`}
        >
          <Plus size={16} />
          <span>Add</span>
        </motion.button>
      </div>

      {/* Advanced Collapsible drawers */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="overflow-hidden border-t border-bmuted pt-4 flex flex-col gap-4 relative z-10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-tsub uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Due Date</span>
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-inbg border border-bmuted rounded-xl px-3 py-2 text-sm text-tmain focus:outline-none focus:border-accent cursor-pointer hover:border-bmain transition-colors"
                />
              </div>

              {/* Assignee Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-tsub uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus size={13} />
                  <span>Assign To</span>
                </span>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="bg-inbg border border-bmuted rounded-xl px-3 py-2 text-sm text-tmain focus:outline-none focus:border-accent cursor-pointer hover:border-bmain transition-colors"
                >
                  <option value="">Unassigned</option>
                  {assignees.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Recurrence Setup */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-tsub uppercase tracking-wider flex items-center gap-1.5">
                  <Repeat size={13} />
                  <span>Recurrence</span>
                </span>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="bg-inbg border border-bmuted rounded-xl px-3 py-2 text-sm text-tmain focus:outline-none focus:border-accent cursor-pointer hover:border-bmain transition-colors"
                >
                  <option value="none">One Time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Options row */}
      <div className="flex flex-wrap gap-4 justify-between items-center relative z-10 pt-3.5 border-t border-bmuted">
        {/* Workspace select pills */}
        <div className="flex gap-1.5">
          {spaces.map((sp) => {
            const isSelected = effectiveCategory === sp.id;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => {
                  setCategory(sp.id);
                }}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-none ${
                  isSelected ? 'text-tmain font-black' : 'text-tmuted hover:text-tsub hover:bg-inbg/70'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-accent-bg rounded-lg border border-accent/50 shadow-[0_0_16px_var(--accent-bg)]"
                    transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  />
                )}
                <span className="relative z-10">{sp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Priority select dots */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-tmuted uppercase tracking-widest">Priority:</span>
          <div className="flex bg-inbg p-0.5 rounded-xl border border-bmuted">
            {priorities.map((prio) => {
              const isSelected = priority === prio.id;
              return (
                <button
                  key={prio.id}
                  type="button"
                  onClick={() => {
                    setPriority(prio.id);
                  }}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer ${
                    isSelected ? prio.textColor : 'text-tmuted hover:text-tsub hover:bg-inbg/70'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activePriorityPill"
                      className="absolute inset-0 bg-accent-bg rounded-lg border border-accent/50 shadow-[0_0_16px_var(--accent-bg)]"
                      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                    />
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full ${prio.color}`} />
                  <span className="relative z-10">{prio.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </motion.form>
  );
}
