import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../../types';
import { taskService } from '../../services/api';
import TaskCard from './TaskCard';
import { Plus, Loader2 } from 'lucide-react';
import Button from '../common/Button';

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onEditTask,
  onDeleteTask,
  onAddTask,
}) => {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', color: 'bg-gray-400', tasks: [] },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500', tasks: [] },
    { id: 'done', title: 'Done', color: 'bg-green-500', tasks: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<TaskStatus | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasks = await taskService.getTasks();
      
      const updatedColumns = columns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.status === column.id)
      }));
      
      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task, columnId: TaskStatus) => {
    setDraggedTask(task);
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: TaskStatus) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedColumn || draggedColumn === targetColumnId) {
      return;
    }

    try {
      await taskService.updateTaskStatus(draggedTask.id, targetColumnId);
      
      setColumns(prevColumns => {
        const newColumns = prevColumns.map(column => {
          if (column.id === draggedColumn) {
            return {
              ...column,
              tasks: column.tasks.filter(task => task.id !== draggedTask.id)
            };
          }
          if (column.id === targetColumnId) {
            return {
              ...column,
              tasks: [...column.tasks, { ...draggedTask, status: targetColumnId }]
            };
          }
          return column;
        });
        return newColumns;
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      await loadTasks();
    } finally {
      setDraggedTask(null);
      setDraggedColumn(null);
      setDragOverColumn(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        <Button onClick={onAddTask} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`bg-gray-50 rounded-lg p-4 min-h-[600px] transition-all duration-200 ${
              dragOverColumn === column.id && draggedColumn !== column.id
                ? 'bg-blue-50 border-2 border-blue-300 border-dashed'
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragLeave={handleDragLeave}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {column.tasks.map((task) => (
                                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className={`cursor-move transition-transform duration-200 ${
                      draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                  <TaskCard
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks in this column</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
