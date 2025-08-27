import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { taskService, aiService } from '../services/api';
import { Task, AISuggestion } from '../types';
import TaskList from './tasks/TaskList';
import TaskModal from './tasks/TaskModal';
import AISuggestionPanel from './ai/AISuggestionPanel';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import Button from './common/Button';
import { Plus, Sparkles, BarChart3, Kanban } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      showToast(error.message || 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSaved = async () => {
    setShowTaskModal(false);
    setEditingTask(null);
    await loadTasks();
    showToast('Task saved successfully!', 'success');
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await loadTasks();
      showToast('Task status updated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      showToast(error.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
      showToast('Task deleted successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      showToast(error.message || 'Failed to delete task', 'error');
    }
  };

  const handleAISuggestion = async () => {
    try {
      setAiLoading(true);
      const suggestion = await aiService.getSuggestion('daily_plan', '');
      setAiSuggestion(suggestion);
      setShowAIPanel(true);
    } catch (error: any) {
      console.error('Failed to get AI suggestion:', error);
      showToast(error.message || 'Failed to get AI suggestion', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600">
            Manage your tasks and get AI-powered suggestions
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleAISuggestion}
            disabled={aiLoading}
            className="flex items-center space-x-2 min-w-[140px]"
          >
            {aiLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>AI Suggestions</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={handleCreateTask}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-100 rounded-xl p-1 shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-md transform scale-105 border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span>List View</span>
            </button>
            
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-700 shadow-md transform scale-105 border border-gray-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Kanban & Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              To Do ({todoTasks.length})
            </h3>
            <TaskList
              tasks={todoTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              In Progress ({inProgressTasks.length})
            </h3>
            <TaskList
              tasks={inProgressTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Done ({doneTasks.length})
            </h3>
            <TaskList
              tasks={doneTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      ) : (
        <AnalyticsDashboard
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleCreateTask}
        />
      )}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => setShowTaskModal(false)}
          onSaved={handleTaskSaved}
        />
      )}

      {showAIPanel && aiSuggestion && (
        <AISuggestionPanel
          suggestion={aiSuggestion}
          onClose={() => setShowAIPanel(false)}
        />
      )}
      
      {aiLoading && !showAIPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting AI Suggestions</h3>
            <p className="text-sm text-gray-600">Please wait while we analyze your tasks and generate personalized recommendations...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
