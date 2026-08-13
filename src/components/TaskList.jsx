import { useMemo } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';
import EmptyState from './EmptyState';

export default function TaskList() {
  const { 
    tasks, setTasks,
    filter, activeSpace, priorityFilter, searchQuery,
    userSettings
  } = useTasks();

  // Filter tasks according to space, status filter, priorities, and search queries
  const filteredTasks = useMemo(() => tasks.filter(task => {
    // 0. User preference auto-hide completed
    if (userSettings?.hideCompleted && task.completed && filter === 'all') return false;

    // 1. Space filter
    if (activeSpace !== 'all' && task.category !== activeSpace) return false;
    
    // 2. Status filter
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // 3. Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    // 4. Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = task.text.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchText && !matchDesc && !matchCategory) return false;
    }
    
    return true;
  }), [tasks, activeSpace, filter, priorityFilter, searchQuery, userSettings?.hideCompleted]);

  const handleReorder = (newOrder) => {
    // Update the main tasks database based on the new sorted order of the filtered subset
    const filteredIds = new Set(filteredTasks.map(task => task.id));
    let filteredIdx = 0;
    const finalTasks = tasks.map(task => (
      filteredIds.has(task.id) ? newOrder[filteredIdx++] : task
    ));
    
    setTasks(finalTasks);
  };

  return (
    <div className="relative select-none">
      <AnimatePresence mode="popLayout" initial={false}>
        {filteredTasks.length > 0 ? (
          <Reorder.Group 
            axis="y" 
            values={filteredTasks} 
            onReorder={handleReorder}
            className="flex flex-col gap-0.5"
          >
            {filteredTasks.map((task) => (
              <Reorder.Item 
                key={task.id} 
                value={task}
                dragListener={!task.completed} // Disable drag sorting if task is marked complete
                style={{ position: 'relative', zIndex: 1 }}
              >
                <TaskItem task={task} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <EmptyState filter={filter} />
        )}
      </AnimatePresence>
    </div>
  );
}
