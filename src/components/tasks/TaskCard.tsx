import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User } from '../../types';
import { userService } from '../../services/api';
import Button from '../common/Button';
import { Edit, ChevronRight, ChevronLeft, Clock, User as UserIcon, Users } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAssignTask?: (taskId: string, assignedUserId: string) => void;
  isAdmin?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignTask,
  isAdmin = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAssignTask = () => {
    if (selectedUserId && onAssignTask) {
      onAssignTask(task.id, selectedUserId);
      setShowAssignmentModal(false);
      setSelectedUserId('');
    }
  };

  // Helper function to get the effective assignee display
  const getEffectiveAssignee = () => {
    if (task.assignedUser) {
      return { user: task.assignedUser, type: 'assigned', color: 'green' };
    }
    if (task.owner_username) {
      return { username: task.owner_username, type: 'owner', color: 'blue' };
    }
    if (task.createdBy) {
      return { user: task.createdBy, type: 'creator', color: 'blue' };
    }
    return null;
  };

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

      {/* Assignment Information */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <UserIcon className="h-4 w-4" />
                         {(() => {
               const assignee = getEffectiveAssignee();
               if (!assignee) {
                 return <span className="text-gray-500">No owner</span>;
               }
               
               const colorClass = assignee.color === 'green' ? 'text-green-600' : 'text-blue-600';
               const dotColor = assignee.color === 'green' ? 'bg-green-500' : 'bg-blue-500';
               
               if (assignee.type === 'assigned' && assignee.user) {
                 return (
                   <div className="flex items-center space-x-2">
                     <span className={`${colorClass} font-medium`}>
                       Assigned to: {assignee.user.username}
                     </span>
                     <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                   </div>
                 );
               } else if (assignee.type === 'owner') {
                 return (
                   <div className="flex items-center space-x-2">
                     <span className={`${colorClass} font-medium`}>
                       Owner: {assignee.username}
                     </span>
                     <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                   </div>
                 );
               } else if (assignee.type === 'creator' && assignee.user) {
                 return (
                   <div className="flex items-center space-x-2">
                     <span className={`${colorClass} font-medium`}>
                       Created by: {assignee.user.username}
                     </span>
                     <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                   </div>
                 );
               }
               
               return <span className="text-gray-500">No owner</span>;
             })()}
          </div>
                     {!task.assignedUser && task.owner_username && (
             <span className="text-xs text-gray-500 ml-6">
               Task is owned by {task.owner_username}
             </span>
           )}
        </div>
        
        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAssignmentModal(true)}
            className="text-xs px-2 py-1"
          >
            <Users className="h-3 w-3 mr-1" />
            {task.assignedUser ? 'Reassign' : 'Assign'}
          </Button>
        )}
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

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Task</h3>
            <p className="text-sm text-gray-600 mb-4">
              Assign "{task.title}" to a user
            </p>
                         {!task.assignedUser && task.owner_username && (
               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                 <p className="text-sm text-blue-800">
                   <strong>Note:</strong> This task is currently owned by {task.owner_username}.
                   You can assign it to another user if needed.
                 </p>
               </div>
             )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
                             <select
                 value={selectedUserId}
                 onChange={(e) => setSelectedUserId(e.target.value)}
                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                 <option value="">Choose a user...</option>
                 {task.owner_username && (
                   <option value={task.userId} className="font-medium">
                     {task.owner_username} (Current Owner)
                   </option>
                 )}
                 {users
                   .filter(user => !task.owner_username || user.username !== task.owner_username)
                   .map((user) => (
                     <option key={user.id} value={user.id}>
                       {user.username}
                     </option>
                   ))}
               </select>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowAssignmentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignTask}
                disabled={!selectedUserId}
                className="flex-1"
              >
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
