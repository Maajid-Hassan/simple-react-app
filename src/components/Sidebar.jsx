import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo, Kanban, Calendar, LayoutGrid, BarChart3,
  Folder, Plus, Trash2,
  ChevronLeft, ChevronRight, Hash, X, User, Settings,
  ChevronDown, Download
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function Sidebar() {
  const {
    activeView, setActiveView,
    activeSpace, setActiveSpace,
    spaces, handleAddSpace, handleDeleteSpace,
    isMobileSidebarOpen, setIsMobileSidebarOpen
  } = useTasks();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState('indigo');
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [isSpacesExpanded, setIsSpacesExpanded] = useState(true);


  const views = [
    { id: 'list', label: 'List View', icon: ListTodo },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar Grid', icon: Calendar },
    { id: 'matrix', label: 'Priority Matrix', icon: LayoutGrid },
    { id: 'dashboard', label: 'Analytics Hub', icon: BarChart3 },
    { id: 'export', label: 'Export & Reports', icon: Download },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const colors = [
    { id: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500 font-bold' },
    { id: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500 font-bold' },
    { id: 'amber', bg: 'bg-amber-500', text: 'text-amber-500 font-bold' },
    { id: 'rose', bg: 'bg-rose-500', text: 'text-rose-500 font-bold' },
    { id: 'purple', bg: 'bg-purple-500', text: 'text-purple-500 font-bold' }
  ];

  const handleCreateSpace = (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    handleAddSpace(newSpaceName.trim(), newSpaceColor);
    setNewSpaceName('');
    setShowAddSpace(false);
  };



  const renderContent = (collapsed, isMobile) => {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Workspace Brand Title */}
          <div className="flex items-center justify-between border-b border-bmuted pb-4">
            <div className="flex items-center gap-2">
              {(!collapsed || isMobile) ? (
                <span className="font-extrabold text-lg tracking-wider text-tmain uppercase mesh-readable">ZenFlow</span>
              ) : (
                <span className="font-extrabold text-2xl tracking-wide text-tmain uppercase pl-1 mesh-readable">Z</span>
              )}
            </div>

            {/* Toggle button (Desktop Only) / Close button (Mobile Only) */}
            {isMobile ? (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent-bg text-tmuted hover:text-tmain cursor-pointer focus:outline-none"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg hover:bg-accent-bg text-tmuted hover:text-tmain cursor-pointer hidden md:block focus:outline-none"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>

          {/* View Switcher Navigation */}
          <nav className="flex flex-col gap-1">
            {views.map((v) => {
              const isActive = activeView === v.id;
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setActiveView(v.id);
                    if (isMobile) setIsMobileSidebarOpen(false);
                  }}
                  className={`relative py-3 rounded-xl font-medium text-xs tracking-wide uppercase flex items-center gap-3.5 focus:outline-none cursor-pointer transition-all duration-200 ${(collapsed && !isMobile) ? 'justify-center px-0' : 'px-4'
                    } ${isActive ? 'text-tmain font-black' : 'text-tmuted hover:text-tsub hover:translate-x-1 hover:bg-inbg/55'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId={isMobile ? "activeViewIndicatorMobile" : "activeViewIndicatorDesktop"}
                      className="absolute inset-0 bg-accent-bg border border-accent/45 rounded-xl z-0 shadow-[0_0_22px_var(--accent-bg)]"
                      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                    />
                  )}
                  <Icon size={16} className={`relative z-10 ${isActive ? 'text-accent' : 'text-tmuted'}`} />
                  {(!collapsed || isMobile) && <span className="relative z-10">{v.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Custom Spaces (Workspaces) Section */}
          {(!collapsed || isMobile) && (
            <div className="border-t border-bmuted pt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-tmuted uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setIsSpacesExpanded(!isSpacesExpanded)}
                  className="flex items-center gap-1.5 hover:text-tmain cursor-pointer focus:outline-none"
                >
                  <motion.div
                    animate={{ rotate: isSpacesExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                  <span>My Spaces</span>
                </button>
                <button
                  onClick={() => setShowAddSpace(!showAddSpace)}
                  className="p-1 hover:bg-accent-bg rounded-md text-tmuted hover:text-tmain cursor-pointer focus:outline-none"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Add Space Collapsible Drawer */}
              <AnimatePresence>
                {showAddSpace && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleCreateSpace}
                    className="p-2 border border-bmuted rounded-xl bg-inbg flex flex-col gap-3 overflow-hidden mb-2"
                  >
                    <input
                      type="text"
                      placeholder="Space name..."
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                      className="w-full text-xs bg-inbg border border-bmuted rounded-md px-2 py-1.5 focus:outline-none focus:border-accent text-tmain placeholder-tmuted"
                    />
                    <div className="flex gap-2.5 items-center justify-between">
                      <div className="flex gap-1">
                        {colors.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setNewSpaceColor(c.id)}
                            className={`w-3.5 h-3.5 rounded-full ${c.bg} transition-transform ${newSpaceColor === c.id ? 'scale-125 ring-1 ring-tmain' : ''
                              }`}
                          />
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="px-2 py-1 rounded bg-accent text-white font-semibold text-xs cursor-pointer hover:bg-accent-hover"
                      >
                        Create
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Spaces List Accordion */}
              <AnimatePresence>
                {isSpacesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-0.5 overflow-hidden"
                  >
                    {/* "All Spaces" trigger */}
                    <button
                      onClick={() => {
                        setActiveSpace('all');
                        if (isMobile) setIsMobileSidebarOpen(false);
                      }}
                      className={`relative py-2.5 rounded-xl font-medium text-xs flex items-center gap-3.5 cursor-pointer focus:outline-none transition-all duration-200 ${(collapsed && !isMobile) ? 'justify-center px-0' : 'px-4'
                        } ${activeSpace === 'all' ? 'text-tmain font-black' : 'text-tmuted hover:text-tsub hover:translate-x-1 hover:bg-inbg/55'}`}
                    >
                      {activeSpace === 'all' && (
                        <motion.div
                          layoutId={isMobile ? "activeSpaceIndicatorMobile" : "activeSpaceIndicatorDesktop"}
                          className="absolute inset-0 bg-accent-bg border border-accent/45 rounded-xl z-0 shadow-[0_0_22px_var(--accent-bg)]"
                          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                        />
                      )}
                      <Folder size={14} className={`relative z-10 ${activeSpace === 'all' ? 'text-accent' : 'text-tmuted'}`} />
                      <span className="relative z-10 font-bold uppercase tracking-wider">All Spaces</span>
                    </button>

                    {spaces.map((s) => {
                      const isActive = activeSpace === s.id;
                      const col = colors.find(c => c.id === s.color) || colors[0];
                      return (
                        <div
                          key={s.id}
                          className={`group flex items-center justify-between rounded-xl relative ${(collapsed && !isMobile) ? 'justify-center' : 'px-4'
                            }`}
                        >
                          <button
                            onClick={() => {
                              setActiveSpace(s.id);
                              if (isMobile) setIsMobileSidebarOpen(false);
                            }}
                            className={`flex-1 py-2.5 font-medium text-xs flex items-center gap-3.5 cursor-pointer focus:outline-none transition-all duration-200 rounded-xl ${isActive ? 'text-tmain font-black' : 'text-tmuted hover:text-tsub hover:translate-x-1 hover:bg-inbg/55'
                              }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId={isMobile ? "activeSpaceIndicatorMobile" : "activeSpaceIndicatorDesktop"}
                                className="absolute inset-0 border rounded-xl bg-accent-bg border-accent/45 z-0 shadow-[0_0_22px_var(--accent-bg)]"
                                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                              />
                            )}
                            <Hash size={14} className={`relative z-10 ${col.text}`} />
                            <span className="relative z-10 truncate capitalize">{s.label}</span>
                          </button>

                          {/* Delete Workspace Button */}
                          {spaces.length > 1 && (
                            <button
                              onClick={() => handleDeleteSpace(s.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent-bg text-tmuted hover:text-rose-500 rounded-md cursor-pointer transition-all absolute right-2 z-20 focus:outline-none animate-fade-in"
                              title={`Delete space "${s.label}"`}
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>


      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="h-[calc(100vh-2rem)] sticky top-4 glass-panel rounded-3xl flex-col justify-between p-4 z-20 select-none shrink-0 hidden md:flex"
      >
        {renderContent(isCollapsed, false)}
      </motion.aside>

      {/* Mobile Drawer Navigation Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer pane */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden w-[280px] bg-pbg/95 backdrop-blur-md border-r border-bmuted shadow-2xl rounded-r-3xl flex flex-col justify-between p-4 select-none"
            >
              {renderContent(false, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
