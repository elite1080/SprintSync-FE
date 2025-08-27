import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import Button from '../common/Button';
import { Edit, ChevronRight, ChevronLeft, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusOptions = (currentStatus: TaskStatus): TaskStatus[] => {
    switch (currentStatus) {
      case 'todo':
        return ['in_progress'];
      case 'in_progress':
        return ['todo', 'done'];
      case 'done':
        return ['in_progress'];
      default:
        return [];
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'todo':
        return 'bg-gray-400';
      case 'in_progress':
        return 'bg-blue-500';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins || 0}m`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
        <div className="flex items-center space-x-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="p-1 h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatTime(task.total_minutes)}</span>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(task.status)}`}>
          {getStatusLabel(task.status)}
        </div>
      </div>

      {showActions && (
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(task)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="flex-1"
            >
              Delete
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Move to:</p>
            <div className="flex space-x-2">
              {getStatusOptions(task.status).map((status) => (
                <Button
                  key={status}
                  variant="secondary"
                  size="sm"
                  onClick={() => onStatusChange(task.id, status)}
                  className="flex-1 text-xs"
                >
                  {status === 'in_progress' && task.status === 'todo' && (
                    <ChevronRight className="h-3 w-3 mr-1 inline" />
                  )}
                  {status === 'done' && task.status === 'in_progress' && (
                    <ChevronRight className="h-3 w-3 mr-1 inline" />
                  )}
                  {status === 'in_progress' && task.status === 'done' && (
                    <ChevronLeft className="h-3 w-3 mr-1 inline" />
                  )}
                  {status === 'todo' && task.status === 'in_progress' && (
                    <ChevronLeft className="h-3 w-3 mr-1 inline" />
                  )}
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
