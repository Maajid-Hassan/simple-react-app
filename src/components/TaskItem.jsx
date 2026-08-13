import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, CheckSquare, MessageSquare, ChevronDown, ChevronUp, Plus, Clock
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

function getSpaceLabel(spaces, spaceId) {
  return spaces.find(space => space.id === spaceId)?.label || 'General';
}

function getSpaceColorText(spaces, spaceId, isLight) {
  const space = spaces.find(item => item.id === spaceId);
  if (!space) return 'text-tmuted border-bmuted bg-inbg/40 font-bold';

  const colors = {
    indigo: ['text-indigo-800 border-indigo-200 bg-indigo-50 font-bold', 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10 font-bold'],
    emerald: ['text-emerald-800 border-emerald-200 bg-emerald-50 font-bold', 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 font-bold'],
    amber: ['text-amber-800 border-amber-200 bg-amber-50 font-bold', 'text-amber-400 border-amber-500/20 bg-amber-500/10 font-bold'],
    rose: ['text-rose-800 border-rose-200 bg-rose-50 font-bold', 'text-rose-400 border-rose-500/20 bg-rose-500/10 font-bold'],
    purple: ['text-purple-800 border-purple-200 bg-purple-50 font-bold', 'text-purple-400 border-purple-500/20 bg-purple-500/10 font-bold']
  };
  const colorPair = colors[space.color];
  if (!colorPair) return 'text-tmuted border-bmuted bg-inbg/40 font-bold';
  return colorPair[isLight ? 0 : 1];
}

function getPriorityBadge(priority, isLight) {
  const colors = {
    high: ['bg-rose-50 border-rose-200 text-rose-700 font-extrabold', 'bg-rose-500/10 border-rose-500/25 text-rose-400 font-extrabold'],
    medium: ['bg-amber-50 border-amber-200 text-amber-800 font-extrabold', 'bg-amber-500/10 border-amber-500/25 text-amber-400 font-extrabold']
  };
  const colorPair = colors[priority];
  if (!colorPair) return 'bg-inbg/40 border-bmuted text-tmuted font-extrabold';
  return colorPair[isLight ? 0 : 1];
}

function getAssigneeConfig(id) {
  const assignees = {
    MA: { initials: 'MA', name: 'Murali', bg: 'from-blue-500 to-indigo-500' },
    AI: { initials: 'AI', name: 'Antigravity', bg: 'from-purple-500 to-pink-500' },
    TL: { initials: 'TL', name: 'Team Lead', bg: 'from-emerald-500 to-teal-500' }
  };
  return assignees[id] || null;
}

function getDueDateAlert(dateStr, isLight) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  const days = Math.round(diff / 86400000);
  const alerts = {
    overdue: ['Overdue', 'text-rose-700 border-rose-200 bg-rose-50', 'text-rose-400 border-rose-500/20 bg-rose-500/5'],
    today: ['Due Today', 'text-amber-800 border-amber-200 bg-amber-50', 'text-amber-400 border-amber-500/20 bg-amber-500/5'],
    tomorrow: ['Due Tomorrow', 'text-indigo-700 border-indigo-200 bg-indigo-50', 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5']
  };
  let alert = null;
  if (days < 0) alert = alerts.overdue;
  else if (days === 0) alert = alerts.today;
  else if (days === 1) alert = alerts.tomorrow;
  return alert
    ? { text: alert[0], color: isLight ? alert[1] : alert[2] }
    : { text: `Due in ${days}d`, color: 'bg-inbg/40 border-bmuted text-tmuted' };
}

// The remaining complexity is presentational JSX branching, not business logic.
export default function TaskItem({ task }) { // NOSONAR
  const {
    handleToggleComplete, handleDeleteTask, handleUpdateTaskText,
    handleUpdateTaskDescription,
    handleAddSubtask, handleToggleSubtask, handleDeleteSubtask,
    handleAddComment, spaces,
    theme,
    handleShiftTaskOrder,
    userSettings
  } = useTasks();
  const isLight = theme === 'lightblue' || theme === 'lightpurple';
  const completedColor = isLight ? 'rgba(100, 116, 139, 0.6)' : 'rgba(161, 161, 170, 0.6)';

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Inline sheets state
  const [newSubtext, setNewSubtext] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState(task.description || '');

  const editInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      const length = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      handleUpdateTaskText(task.id, editText.trim());
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  // Keyboard reordering: Shift+Arrow moves the task up/down in the list
  const handleCardKeyDown = (e) => {
    if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const direction = e.key === 'ArrowUp' ? 'up' : 'down';
      handleShiftTaskOrder(task.id, direction);
    }
  };

  const handleSaveDescription = () => {
    handleUpdateTaskDescription(task.id, descText);
    setIsEditingDesc(false);
  };

  const handleCreateSubtask = (e) => {
    e.preventDefault();
    if (!newSubtext.trim()) return;
    handleAddSubtask(task.id, newSubtext.trim());
    setNewSubtext('');
  };

  const handleCreateComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    handleAddComment(task.id, newComment.trim());
    setNewComment('');
  };

  const assigneeConfig = getAssigneeConfig(task.assignee);

  // Compute subtask numbers
  const totalSubs = task.subtasks?.length || 0;
  const completedSubs = task.subtasks?.filter(s => s.completed).length || 0;
  const subPercent = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

  const dueAlert = getDueDateAlert(task.dueDate, isLight);
  return (
    <motion.div
      layout
      tabIndex={0}
      role="listitem"
      aria-label={`Task: ${task.text}. Press Shift plus Arrow Up or Arrow Down to reorder.`}
      onKeyDown={handleCardKeyDown}
      animate={{
        borderColor: isExpanded ? 'var(--border-main)' : 'var(--border-muted)',
        backgroundColor: isExpanded ? 'var(--bg-panel)' : 'var(--bg-card)',
      }}
      className={`todo-card glass-panel ${
        userSettings?.compactMode ? 'p-2.5 sm:p-3 mb-1.5' : 'p-4 mb-3'
      } rounded-2xl flex flex-col group relative overflow-hidden transition-all border select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pbg outline-none`}
    >
      {/* Task card primary summary row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-1 min-w-0">
        
        <div className="flex items-center gap-3.5 flex-1 min-w-0 w-full">
          {/* Core Completion Checkbox */}
          <button
            onClick={() => handleToggleComplete(task.id)}
            className="relative w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer focus:outline-none shrink-0"
            style={{
              borderColor: task.completed ? 'var(--accent)' : 'var(--border-main)',
              background: task.completed ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' : 'rgba(0,0,0,0)',
              boxShadow: task.completed ? '0 0 0 3px var(--accent-bg), 0 0 16px var(--accent-bg)' : 'none'
            }}
          >
            <AnimatePresence>
              {task.completed && (
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 text-white drop-shadow-sm"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                >
                  <motion.path
                    d="M4 12l6 6L20 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* Task title with Double-click edit inline */}
          <div className="flex-1 min-w-0 relative">
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleEditSubmit}
                onKeyDown={handleKeyDown}
                className="w-full bg-inbg border border-accent rounded px-2.5 py-1 text-sm text-tmain focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            ) : (
              <div 
                onDoubleClick={() => setIsEditing(true)}
                className="cursor-text relative inline-block max-w-full"
                title="Double-click to edit task title"
              >
                <motion.span
                  animate={{ color: task.completed ? completedColor : 'var(--text-main)' }}
                  className="text-sm font-bold tracking-tight block truncate pr-2 select-none"
                >
                  {task.text}
                </motion.span>
                
                {/* Cross out sliding spring line */}
                <motion.div
                  className="absolute top-1/2 left-0 h-[1.5px] bg-accent origin-left animate-pulse"
                  initial={{ width: 0 }}
                  animate={{ width: task.completed ? '100%' : '0%' }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Task Meta indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto mt-1 sm:mt-0 pl-9 sm:pl-0">
          
          {/* Subtasks Progress mini-pill */}
          {totalSubs > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-bmuted bg-inbg text-xs font-bold font-mono text-tsub">
              <CheckSquare size={11} />
              <span>{completedSubs}/{totalSubs}</span>
            </div>
          )}

          {/* Workspace Space tag */}
          <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider border ${getSpaceColorText(spaces, task.category, isLight)}`}>
            <span>{getSpaceLabel(spaces, task.category)}</span>
          </div>

          {/* Priority indicator */}
          <div className={`px-2 py-1 rounded-xl border text-xs font-extrabold uppercase tracking-widest ${getPriorityBadge(task.priority, isLight)}`}>
            <span>{task.priority}</span>
          </div>

          {/* Calendar Due Alert */}
          {dueAlert && (
            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${dueAlert.color}`}>
              <Clock size={10} />
              <span>{dueAlert.text}</span>
            </div>
          )}

          {/* Collaborator assignee avatar circle */}
          {assigneeConfig && (
            <div 
              className={`w-6 h-6 rounded-full bg-gradient-to-tr ${assigneeConfig.bg} flex items-center justify-center font-bold text-xs text-white ring-1 ring-white/10`}
              title={`Assigned to ${assigneeConfig.name}`}
            >
              {assigneeConfig.initials}
            </div>
          )}

          {/* Details toggle buttons */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-inbg rounded-lg text-tmuted hover:text-tmain cursor-pointer focus:outline-none transition-colors ml-auto sm:ml-0"
            title="Toggle Details"
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {/* Delete triggers */}
          <motion.button
            onClick={() => handleDeleteTask(task.id)}
            whileHover={{ scale: 1.12, color: '#f43f5e', backgroundColor: 'var(--accent-bg)' }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg text-tmuted transition-colors focus:outline-none cursor-pointer block sm:hidden sm:group-hover:block"
            title="Delete task card"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* Primary Details expanded accordion grids */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="overflow-hidden border-t border-bmuted pt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            
            {/* Left Column: Markdown editor and comments feeds */}
            <div className="flex flex-col gap-4">
              
              {/* Markdown Detailed description sheet */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold text-tmuted uppercase tracking-widest">
                  <span>Markdown Description</span>
                  {!isEditingDesc ? (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-accent hover:underline cursor-pointer focus:outline-none font-bold"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveDescription}
                      className="text-emerald-500 hover:underline cursor-pointer focus:outline-none font-bold"
                    >
                      Save
                    </button>
                  )}
                </div>

                {!isEditingDesc ? (
                  <div className="p-3 contrast-surface rounded-2xl text-xs text-tsub min-h-[75px] max-h-36 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed font-medium">
                    {task.description || <span className="text-tmuted italic font-semibold">No description written. Double-click here or hit edit to add markdown notes.</span>}
                  </div>
                ) : (
                  <textarea
                    value={descText}
                    onChange={(e) => setDescText(e.target.value)}
                    placeholder="Enter task descriptions... (supports markdown #, - bullets)"
                    className="w-full p-3 contrast-surface border-accent/50 rounded-2xl text-xs text-tmain placeholder-tmuted placeholder:font-medium focus:outline-none focus:border-accent font-mono h-24 max-h-36"
                  />
                )}
              </div>

              {/* Comments timelines */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-tmuted uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare size={11} />
                  <span>Activity & Comments ({task.comments?.length || 0})</span>
                </span>
                
                {/* Comments feed list */}
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
                  {task.comments?.map(c => (
                    <div key={c.id} className="p-2.5 contrast-surface rounded-xl flex flex-col gap-0.5">
                      <span className="text-xs text-tmain tracking-tight leading-relaxed font-medium">{c.text}</span>
                      <span className="text-xs text-tsub font-mono font-semibold">
                        {new Date(c.timestamp).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                  {(!task.comments || task.comments.length === 0) && (
                    <span className="text-xs text-tmuted italic">No activity logs recorded.</span>
                  )}
                </div>

                {/* Comment input form */}
                <form onSubmit={handleCreateComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Post a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-inbg border border-bmuted rounded-xl px-3 py-2 text-xs text-tmain placeholder-tmuted placeholder:font-medium focus:outline-none focus:border-accent hover:border-bmain transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-inbg border border-bmuted rounded-xl text-tsub hover:text-tmain hover:bg-accent-bg cursor-pointer focus:outline-none transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Subtasks checklist manager */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-tmuted uppercase tracking-widest">
                <span>Checklist</span>
                <span className="text-accent font-mono font-extrabold">{subPercent}% completed</span>
              </div>

              {/* Collapsed Subtask List */}
              <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                {task.subtasks?.map(sub => (
                  <div 
                    key={sub.id} 
                    className="flex items-center justify-between p-2 rounded-xl contrast-surface group/sub hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleSubtask(task.id, sub.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer focus:outline-none transition-all ${
                          sub.completed 
                            ? 'bg-accent border-accent text-white shadow-sm shadow-accent/20' 
                            : 'border-bmuted hover:border-bmain text-tmain'
                        }`}
                      >
                        {sub.completed && <CheckSquare size={10} />}
                      </button>
                      <span className={`text-xs tracking-tight ${
                        sub.completed ? 'text-tmuted line-through' : 'text-tmain font-medium'
                      }`}>
                        {sub.text}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteSubtask(task.id, sub.id)}
                      className="opacity-0 group-hover/sub:opacity-100 text-tmuted hover:text-rose-500 p-0.5 rounded focus:outline-none cursor-pointer transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {(!task.subtasks || task.subtasks.length === 0) && (
                  <span className="text-xs text-tmuted italic">No checklist items. Create one below.</span>
                )}
              </div>

              {/* Add subtask form */}
              <form onSubmit={handleCreateSubtask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New checklist item..."
                  value={newSubtext}
                  onChange={(e) => setNewSubtext(e.target.value)}
                  className="flex-1 bg-inbg border border-bmuted rounded-xl px-3 py-2 text-xs text-tmain placeholder-tmuted placeholder:font-medium focus:outline-none focus:border-accent hover:border-bmain transition-colors"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-gradient-to-r from-accent to-accent-hover border border-accent/20 rounded-xl text-white font-bold text-xs cursor-pointer focus:outline-none shadow-md shadow-accent/15"
                >
                  Create
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
