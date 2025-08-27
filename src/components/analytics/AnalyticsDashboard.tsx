import React, { useState } from 'react';
import { Task } from '../../types';
import KanbanBoard from '../tasks/KanbanBoard';
import TimeTrackingChart from './TimeTrackingChart';
import { BarChart3, Kanban } from 'lucide-react';

interface AnalyticsDashboardProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

type ViewMode = 'kanban' | 'analytics';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onEditTask,
  onDeleteTask,
  onAddTask,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Dashboard</h2>
          <p className="text-sm text-gray-600">Manage tasks and track progress</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <div className="bg-gray-100 rounded-xl p-1 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-blue-700 shadow-md transform scale-105 border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban</span>
              </button>
              
              <button
                onClick={() => setViewMode('analytics')}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'analytics'
                    ? 'bg-white text-blue-700 shadow-md transform scale-105 border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onAddTask={onAddTask}
        />
      ) : (
        <TimeTrackingChart days={7} />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
