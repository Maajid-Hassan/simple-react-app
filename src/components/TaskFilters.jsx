import { motion } from 'framer-motion';

export default function TaskFilters({ activeFilter, setActiveFilter, tasks }) {
  const filters = [
    { id: 'all', label: 'All', count: tasks.length },
    { id: 'active', label: 'Active', count: tasks.filter(t => !t.completed).length },
    { id: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length }
  ];

  return (
    <div className="glass-panel p-1.5 rounded-xl flex items-center w-full mb-6">
      {filters.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className="flex-1 relative py-2 text-sm font-medium transition-colors focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Sliding Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeFilterPill"
                className="absolute inset-0 bg-accent-bg rounded-lg shadow-inner border border-accent/20"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30
                }}
              />
            )}
            
            {/* Tab Label & Count */}
            <span className={`relative z-10 transition-colors duration-200 ${
              isActive ? 'text-accent font-semibold' : 'text-tmuted font-normal hover:text-tsub'
            }`}>
              {tab.label}
            </span>
            <span className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full transition-colors duration-200 font-mono ${
              isActive 
                ? 'bg-accent/15 text-accent font-semibold border border-accent/25' 
                : 'bg-inbg/40 text-tmuted border border-bmuted/50'
            }`}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
