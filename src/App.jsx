import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from './context/TaskContext';

// Import Views components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskStats from './components/TaskStats';
import TaskInput from './components/TaskInput';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import CalendarView from './components/CalendarView';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Settings from './components/Settings';

// Import Overlays
import ToastContainer from './components/ToastContainer';

export default function App() {
  const {
    activeView,
    tasks,
    filter,
    setFilter,
    theme,
    srAnnouncement
  } = useTasks();

  const isLightTheme = theme === 'lightblue' || theme === 'lightpurple';

  return (
    <div className="min-h-screen relative flex bg-pbg text-tmain select-none">
      {/* Screen Reader Live Announcements Region */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {srAnnouncement}
      </div>

      {/* Premium Ambient Backdrop Glow */}
      <div className="glow-bg" />
      
      {/* Decorative Grid Mesh */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" 
        style={{
          '--grid-color': isLightTheme ? 'rgba(0, 0, 0, 0.015)' : 'rgba(255, 255, 255, 0.012)'
        }}
      />

      {/* Main Orchestrator Grid layout */}
      <div className="flex flex-col md:flex-row w-full min-h-screen p-2 sm:p-4 gap-4 md:gap-6 z-10 relative">
        
        {/* Left Column: Sidebar Project Navigation */}
        <Sidebar />

        {/* Right Column: Content Desk Wrapper */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Header Panel */}
          <Header />
          
          {/* View Switcher Pane Layout */}
          <div className="flex-1 min-h-0 pb-16 xl:pb-4">
            
            {/* Main Workspace View */}
            <div className="flex flex-col gap-6 min-w-0 h-full w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="flex flex-col gap-6 h-full"
                >
                  {activeView === 'list' && (
                    <>
                      <TaskStats tasks={tasks} />
                      <TaskInput />
                      <TaskFilters activeFilter={filter} setActiveFilter={setFilter} tasks={tasks} />
                      <TaskList />
                    </>
                  )}
                  {activeView === 'kanban' && <KanbanBoard />}
                  {activeView === 'calendar' && <CalendarView />}
                  {activeView === 'matrix' && <EisenhowerMatrix />}
                  {activeView === 'dashboard' && <Dashboard />}
                  {activeView === 'profile' && <Profile />}
                  {activeView === 'settings' && <Settings />}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Undo notifications layer stack */}
      <ToastContainer />
    </div>
  );
}
