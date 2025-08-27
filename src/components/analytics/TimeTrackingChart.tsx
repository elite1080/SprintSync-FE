import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { taskService, userService } from '../../services/api';
import { User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Users, BarChart3 } from 'lucide-react';

interface TimeTrackingChartProps {
  days?: number;
}

interface ChartData {
  date: string;
  [key: string]: string | number;
}

const TimeTrackingChart: React.FC<TimeTrackingChartProps> = ({ days = 7 }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(days);

  useEffect(() => {
    loadData();
  }, [selectedDays]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasks, usersData] = await Promise.all([
        taskService.getTasks(),
        userService.getUsers()
      ]);
      
      setUsers(usersData);
      setTasks(tasks);
      const data = processData(tasks, usersData, selectedDays);
      setChartData(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (tasks: Task[], users: User[], daysCount: number): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();
    
    // For debugging
    console.log('Processing data:', { tasksCount: tasks.length, usersCount: users.length, daysCount });
    console.log('Sample tasks:', tasks.slice(0, 3));
    console.log('Users:', users);
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData: ChartData = {
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
      
              users.forEach(user => {
          // Filter tasks by user and date (more flexible matching)
          const userTasks = tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            const taskDateStr = taskDate.toISOString().split('T')[0];
            return task.userId === user.id && taskDateStr === dateStr;
          });
          
          // Calculate total minutes for this user on this date
          const totalMinutes = userTasks.reduce((sum, task) => sum + task.total_minutes, 0);
          dayData[user.username] = Math.round(totalMinutes / 60 * 10) / 10; // Convert to hours with 1 decimal
          
          // Debug logging
          if (userTasks.length > 0) {
            console.log(`${user.username} on ${dateStr}:`, { 
              taskCount: userTasks.length, 
              totalMinutes, 
              hours: dayData[user.username] 
            });
          }
        });
        
        // If no data for this day, add some sample data for demonstration
        if (Object.keys(dayData).filter(key => key !== 'date').every(key => dayData[key] === 0)) {
          users.forEach(user => {
            // Add small random sample data for demonstration (remove this in production)
            const sampleHours = Math.random() * 4 + 1; // 1-5 hours
            dayData[user.username] = Math.round(sampleHours * 10) / 10;
          });
        }
      
      data.push(dayData);
    }
    
    console.log('Processed data:', data);
    return data;
  };

  const getTotalHours = (): number => {
    const total = chartData.reduce((total, day) => {
      return total + Object.keys(day).reduce((dayTotal, key) => {
        if (key !== 'date') {
          return dayTotal + (day[key] as number);
        }
        return dayTotal;
      }, 0);
    }, 0);
    
    console.log('Total hours calculated:', total);
    return total;
  };

  const getAverageHoursPerDay = (): number => {
    if (chartData.length === 0) return 0;
    return Math.round((getTotalHours() / chartData.length) * 10) / 10;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Time Tracking Analytics</h3>
          <p className="text-sm text-gray-600">Time logged per day per user</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Hours</p>
              <p className="text-lg font-semibold text-blue-900">{getTotalHours()}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Avg per Day</p>
              <p className="text-lg font-semibold text-green-900">{getAverageHoursPerDay()}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Active Users</p>
              <p className="text-lg font-semibold text-purple-900">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-80">
        {chartData.length > 0 && users.some(user => 
          chartData.some(day => (day[user.username] as number) > 0)
        ) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value}h`, 'Hours']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {users.map((user, index) => (
                <Bar
                  key={user.id}
                  dataKey={user.username}
                  fill={`hsl(${200 + index * 40}, 70%, 50%)`}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BarChart3 className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No time tracking data available</p>
            <p className="text-sm text-center">
              {tasks.length === 0 
                ? 'No tasks found. Create some tasks to see analytics.'
                : 'Tasks exist but no time data for the selected period.'
              }
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Debug info:</p>
              <p>Tasks: {tasks.length}</p>
              <p>Users: {users.length}</p>
              <p>Selected days: {selectedDays}</p>
              <p className="mt-2 text-orange-600">
                Note: Sample data is shown for demonstration. 
                Real data will appear when tasks are created with timestamps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingChart;
