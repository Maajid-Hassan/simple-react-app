import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { sampleTasks } from '../utils/sampleTasks';

const TaskContext = createContext();


const updateToastProgress = (toast) => (
  toast.paused ? toast : { ...toast, progress: toast.progress - (100 / 60) }
);

const updateToasts = (previousToasts) => (
  previousToasts.map(updateToastProgress).filter(toast => toast.progress > 0)
);

const restoreDeletedTask = (deletedTask, currentTasks) => (
  [deletedTask, ...currentTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
);

const updateSubtaskCompletion = (task, taskId, subId, completedState) => (
  task.id === taskId
    ? {
        ...task,
        subtasks: task.subtasks.map(sub => (
          sub.id === subId ? { ...sub, completed: completedState } : sub
        ))
      }
    : task
);

const removeSubtask = (task, taskId, subId) => (
  task.id === taskId
    ? { ...task, subtasks: task.subtasks.filter(sub => sub.id !== subId) }
    : task
);

export function TaskProvider({ children }) {
  // 1. Theme Configuration
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zenflow-theme') || 'obsidian';
  });

  // Apply theme class to document body
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('zenflow-theme', theme);
  }, [theme]);

  // 2. View and Space Configurations
  const [activeView, setActiveView] = useState('list'); // 'list' | 'kanban' | 'calendar' | 'matrix' | 'dashboard'
  const [activeSpace, setActiveSpace] = useState('all'); // 'all' | space.id
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [spaces, setSpaces] = useState(() => {
    const saved = localStorage.getItem('zenflow-spaces');
    return saved ? JSON.parse(saved) : [
      { id: 'work', label: 'Work', color: 'indigo' },
      { id: 'personal', label: 'Personal', color: 'emerald' },
      { id: 'ideas', label: 'Ideas', color: 'amber' }
    ];
  });

  // 3. Main Tasks State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('zenflow-tasks-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Upgrade sample tasks to support new schema V2
    return sampleTasks.map(t => ({
      ...t,
      dueDate: t.id === 'task-1' ? new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0] : null,
      recurrence: 'none',
      assignee: t.id === 'task-1' ? 'MA' : null,
      description: t.id === 'task-1' ? '### Goal\nMake the dashboard load instantly using layout animations.\n\n### Requirements\n- Keep bundle size small\n- Fine-tune spring values' : '',
      subtasks: t.id === 'task-1' ? [
        { id: 'sub-1', text: 'Select custom spring constants', completed: true },
        { id: 'sub-2', text: 'Benchmark FPS drops', completed: false }
      ] : [],
      comments: t.id === 'task-1' ? [
        { id: 'comm-1', text: 'This looks incredibly responsive on mobile!', timestamp: new Date(Date.now() - 3600000).toISOString() }
      ] : []
    }));
  });

  // Sync tasks to local storage
  useEffect(() => {
    localStorage.setItem('zenflow-tasks-v2', JSON.stringify(tasks));
  }, [tasks]);

  // Sync spaces to local storage
  useEffect(() => {
    localStorage.setItem('zenflow-spaces', JSON.stringify(spaces));
  }, [spaces]);

  // 4. Filters & Search State
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');


  // Screen Reader Live Announcements State
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const announceToScreenReader = useCallback((msg) => {
    setSrAnnouncement(msg);
    setTimeout(() => setSrAnnouncement(''), 1000); // Clear after delay to allow re-announcements
  }, []);

  // Keyboard Task Reordering Mechanics
  const handleShiftTaskOrder = useCallback((id, direction) => {
    const currentIndex = tasks.findIndex(t => t.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const newTasks = [...tasks];
    const temp = newTasks[currentIndex];
    newTasks[currentIndex] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;

    setTasks(newTasks);

    const taskName = temp.text;
    announceToScreenReader(`Moved task "${taskName}" ${direction}. Position is now ${targetIndex + 1} of ${newTasks.length}.`);
  }, [tasks, announceToScreenReader]);

  // 6. Undo/Redo System State & Pausable Dynamic Toasts
  const [toasts, setToasts] = useState([]);

  // Ticker for active, non-paused toast countdowns
  useEffect(() => {
    if (toasts.length === 0) return;
    const interval = setInterval(() => {
      setToasts(prev => {
        return updateToasts(prev);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [toasts.length]);

  const showUndoToast = useCallback((message, action) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, action, progress: 100, paused: false }]);
  }, []);

  const pauseToastTimer = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, paused: true } : t));
  }, []);

  const resumeToastTimer = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, paused: false } : t));
  }, []);

  const handleUndo = useCallback((id) => {
    const toast = toasts.find(t => t.id === id);
    if (toast?.action) {
      toast.action();
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, [toasts]);



  // 7. Profile State
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('zenflow-profile');
    return saved ? JSON.parse(saved) : {
      name: 'Sherwyn Titus',
      age: 25,
      gender: 'male',
      email: 'sherwyn@zenflow.app',
      number: '+1 555 0199',
      address: '123 Zen Flow Lane, Harmony City',
    };
  });

  useEffect(() => {
    localStorage.setItem('zenflow-profile', JSON.stringify(userProfile));
  }, [userProfile]);



  // --- Core CRUD Database Methods ---
  const handleAddTask = useCallback(({ text, category, priority, dueDate = null, assignee = null, recurrence = 'none' }) => {
    const newTask = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      category,
      priority,
      dueDate,
      assignee,
      recurrence,
      description: '',
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const handleToggleComplete = useCallback((id) => {
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    const completedState = !task.completed;
    setTasks(prev => prev.map(item => (
      item.id === id ? { ...item, completed: completedState } : item
    )));
  }, [tasks]);

  const handleDeleteTask = useCallback((id) => {
    const deletedTask = tasks.find(t => t.id === id);
    if (!deletedTask) return;

    setTasks(prev => prev.filter(t => t.id !== id));

    showUndoToast(`Deleted task: "${deletedTask.text.slice(0, 20)}..."`, () => {
      // Restore task logic
      setTasks(prev => restoreDeletedTask(deletedTask, prev));
    });
  }, [tasks, showUndoToast]);

  const handleUpdateTaskText = useCallback((id, newText) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
  }, []);

  const handleUpdateTaskDescription = useCallback((id, newDesc) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, description: newDesc } : task
      )
    );
  }, []);

  const handleUpdateTaskMeta = useCallback((id, updates) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }, []);

  // Subtasks Operations
  const handleAddSubtask = useCallback((taskId, text) => {
    const sub = { id: `sub-${Date.now()}`, text, completed: false };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, subtasks: [...task.subtasks, sub] } : task
      )
    );
  }, []);

  const handleToggleSubtask = useCallback((taskId, subId) => {
    const task = tasks.find(item => item.id === taskId);
    const subtask = task?.subtasks.find(item => item.id === subId);
    if (!subtask) return;

    const completedState = !subtask.completed;
    setTasks(prev => prev.map(item => updateSubtaskCompletion(item, taskId, subId, completedState)));
  }, [tasks]);

  const handleDeleteSubtask = useCallback((taskId, subId) => {
    setTasks(prev => prev.map(task => removeSubtask(task, taskId, subId)));
  }, []);

  // Comments Operations
  const handleAddComment = useCallback((taskId, text) => {
    const comm = { id: `comm-${Date.now()}`, text, timestamp: new Date().toISOString() };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, comments: [...task.comments, comm] } : task
      )
    );
  }, []);

  // Spaces (Workspace) Operations
  const handleAddSpace = useCallback((label, color) => {
    const id = `space-${Date.now()}`;
    setSpaces(prev => [...prev, { id, label, color }]);
  }, []);

  const handleDeleteSpace = useCallback((id) => {
    if (spaces.length <= 1) return; // Must keep at least 1 workspace
    setSpaces(prev => prev.filter(s => s.id !== id));
    // Move tasks in deleted space back to default first space
    const fallbackSpaceId = spaces.find(s => s.id !== id).id;
    setTasks(prev => prev.map(t => t.category === id ? { ...t, category: fallbackSpaceId } : t));
  }, [spaces]);

  const contextValue = useMemo(() => ({
    // Theme
    theme,
    setTheme,
    // Views/Spaces
    activeView,
    setActiveView,
    activeSpace,
    setActiveSpace,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    spaces,
    handleAddSpace,
    handleDeleteSpace,
    // Main tasks data
    tasks,
    setTasks,
    handleAddTask,
    handleToggleComplete,
    handleDeleteTask,
    handleUpdateTaskText,
    handleUpdateTaskDescription,
    handleUpdateTaskMeta,
    // Subtasks
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
    // Comments
    handleAddComment,
    // Filters
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    // Profile
    userProfile,
    setUserProfile,
    // Toasts/Undo (pausable)
    toasts,
    handleUndo,
    pauseToastTimer,
    resumeToastTimer,
    // Keyboard reordering
    handleShiftTaskOrder,
    // Screen reader announcements
    srAnnouncement,
    announceToScreenReader,
  }), [
    theme, activeView, activeSpace, isMobileSidebarOpen, spaces, tasks,
    filter, searchQuery, priorityFilter, userProfile, toasts,
    srAnnouncement, handleAddSpace, handleDeleteSpace, handleAddTask,
    handleToggleComplete, handleDeleteTask, handleUpdateTaskText,
    handleUpdateTaskDescription, handleUpdateTaskMeta, handleAddSubtask,
    handleToggleSubtask, handleDeleteSubtask, handleAddComment, handleUndo,
    pauseToastTimer, resumeToastTimer,
    handleShiftTaskOrder, announceToScreenReader
  ]);

  return (
    <TaskContext.Provider
      value={contextValue}
    >
      {children}
    </TaskContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
  return useContext(TaskContext);
}
