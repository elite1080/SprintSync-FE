import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../../types';
import { taskService, aiService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { X, Sparkles } from 'lucide-react';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  onSaved: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSaved }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [totalMinutes, setTotalMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setTotalMinutes(task.total_minutes);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && task) {
        await taskService.updateTask(task.id, {
          title,
          description,
          status,
          total_minutes: totalMinutes,
        });
      } else {
        if (!user) {
          throw new Error('User not authenticated');
        }
        await taskService.createTask({
          title,
          description,
          status,
          total_minutes: totalMinutes,
          userId: user.id,
        });
      }
      onSaved();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      showToast(error.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAIDescription = async () => {
    if (!title.trim()) return;
    
    setAiLoading(true);
    try {
      const suggestion = await aiService.getSuggestion('task_description', title);
      setDescription(suggestion.content);
      showToast('AI description generated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to get AI suggestion:', error);
      showToast(error.message || 'Failed to get AI suggestion', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const timeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 300, label: '5 hours' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="h-2 w-2" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAIDescription}
                disabled={!title.trim() || aiLoading}
                className="flex items-center space-x-1 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                <span>{aiLoading ? 'Generating...' : 'AI Help'}</span>
              </Button>
            </div>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              placeholder="Enter task description or use AI to generate one"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="input-field"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="totalMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time
              </label>
              <select
                id="totalMinutes"
                value={totalMinutes}
                onChange={(e) => setTotalMinutes(Number(e.target.value))}
                className="input-field"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
