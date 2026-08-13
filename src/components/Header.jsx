import { Search, Settings, Menu } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function Header() {
  const {
    searchQuery, setSearchQuery,
    priorityFilter, setPriorityFilter,
    setIsMobileSidebarOpen,
    userProfile, setActiveView
  } = useTasks();

  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(userProfile?.name);

  return (
    <header className="glass-panel p-4 rounded-3xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none relative z-10 border border-bmain">
      
      {/* Search Bar segment */}
      <div className="flex-1 max-w-md relative flex items-center gap-2">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 rounded-2xl border border-bmuted bg-inbg text-tmuted hover:text-tmain cursor-pointer md:hidden focus:outline-none shrink-0 transition-all hover:border-accent/40"
          title="Open Menu"
        >
          <Menu size={16} />
        </button>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-tmuted" />
          <input
            id="search-input-field"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by text, spacing, categories..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl glass-input text-tmain placeholder-tmuted focus:outline-none"
          />
        </div>
      </div>

      {/* Control Tools Grid */}
      <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end shrink-0 w-full md:w-auto">
        
        {/* Priority Filter drop selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-tmuted uppercase tracking-wider hidden md:inline">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-inbg border border-bmuted rounded-xl px-2.5 py-1.5 text-sm text-tmain font-extrabold focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
        </div>

        {/* Profile Avatar Trigger */}
        <button
          onClick={() => setActiveView('profile')}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center font-black text-white text-sm shadow-md cursor-pointer hover:scale-105 transition-transform border border-accent/20"
          title="User Profile"
        >
          {initials}
        </button>

        {/* Settings Page Navigation Button */}
        <button
          onClick={() => setActiveView('settings')}
          className="p-2 rounded-xl border transition-all focus:outline-none cursor-pointer border-bmuted bg-inbg text-tmuted hover:text-tmain hover:bg-inbg/80 hover:border-accent/30"
          title="Settings"
        >
          <Settings size={14} />
        </button>


      </div>
    </header>
  );
}
