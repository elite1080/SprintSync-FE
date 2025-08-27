import React, { useState, useEffect } from 'react';
import { TimeLog, UserTimeLog, User } from '../../types';
import { taskService, userService } from '../../services/api';
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
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(days);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [averageHoursPerDay, setAverageHoursPerDay] = useState(0);

  useEffect(() => {
    loadData();
  }, [selectedDays]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // First, get the time tracking data to determine if this is admin or user data
      const timeLogs = await taskService.getTimeTracked();
      
      if (!Array.isArray(timeLogs)) {
        console.error('Invalid time tracking data received:', timeLogs);
        setChartData([]);
        return;
      }
      
      // Check if this is admin data by looking for users array in the first time log
      // If no users array, it's non-admin data
      const isAdminData = timeLogs.length > 0 && timeLogs[0].users && Array.isArray(timeLogs[0].users) && timeLogs[0].users.length > 0;
      setIsAdmin(isAdminData);
      
      let usersData: User[] = [];
      
      if (isAdminData) {
        // Only fetch users if this is admin data
        try {
          usersData = await userService.getUsers();
          if (!Array.isArray(usersData)) {
            console.error('Invalid users data received:', usersData);
            setChartData([]);
            return;
          }
          setUsers(usersData);
        } catch (userError) {
          console.error('Failed to fetch users (admin required):', userError);
          // If we can't get users, we can't show admin view
          setIsAdmin(false);
          setUsers([]);
        }
      } else {
        // For non-admin users, we don't need to fetch all users
        setUsers([]);
      }
      
      try {
        const data = processTimeTrackingData(timeLogs, usersData, selectedDays, isAdminData);
        setChartData(data);
        
        // Calculate totals
        const total = calculateTotalHours(data);
        const average = data.length > 0 ? total / data.length : 0;
        setTotalHours(total);
        setAverageHoursPerDay(average);
      } catch (processingError) {
        console.error('Error processing time tracking data:', processingError);
        setChartData([]);
      }
    } catch (error) {
      console.error('Failed to load time tracking data:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const processTimeTrackingData = (timeLogs: TimeLog[], users: User[], daysCount: number, isAdminData: boolean): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();
    
    // Validate today's date
    if (isNaN(today.getTime())) {
      console.error('Invalid current date');
      return [];
    }
    

    
    try {
      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Validate the calculated date
        if (isNaN(date.getTime())) {
          console.error(`Invalid calculated date for day ${i}`);
          continue;
        }
        
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData: ChartData = {
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        };
        
        // Find time log data for this date
        const timeLogForDate = timeLogs.find(log => log.date === dateStr);
        
        if (timeLogForDate) {
          if (isAdminData && timeLogForDate.users) {
            // Admin view: show data for all users
            timeLogForDate.users.forEach(userLog => {
              const hours = Math.round((userLog.minutes / 60) * 10) / 10;
              dayData[userLog.username] = hours;
            });
          } else {
            // Non-admin view: show data for the current user only
            const hours = Math.round((timeLogForDate.total_minutes / 60) * 10) / 10;
            dayData['Time Tracked'] = hours;
          }
        } else {
          // No data for this date, set to 0
          if (isAdminData) {
            users.forEach(user => {
              dayData[user.username] = 0;
            });
          } else {
            dayData['Time Tracked'] = 0;
          }
        }
        
        // Ensure all users have a value for this date (for admin view)
        if (isAdminData) {
          users.forEach(user => {
            if (dayData[user.username] === undefined) {
              dayData[user.username] = 0;
            }
          });
        }
        
        data.push(dayData);
      }
      
      return data;
    } catch (error) {
      console.error('Error processing time tracking data:', error);
      return [];
    }
  };

  const calculateTotalHours = (data: ChartData[]): number => {
    const total = data.reduce((total, day) => {
      return total + Object.keys(day).reduce((dayTotal, key) => {
        if (key !== 'date') {
          return dayTotal + (day[key] as number);
        }
        return dayTotal;
      }, 0);
    }, 0);
    
    return Math.round(total * 10) / 10;
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
          <p className="text-sm text-gray-600">
            {isAdmin ? 'Time logged per day per user' : 'Your time logged per day'}
          </p>
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
              <p className="text-lg font-semibold text-blue-900">{totalHours}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Avg per Day</p>
              <p className="text-lg font-semibold text-green-900">{Math.round(averageHoursPerDay * 10) / 10}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">
                {isAdmin ? 'Active Users' : 'Log Count'}
              </p>
              <p className="text-lg font-semibold text-purple-900">
                {isAdmin ? users.length : (chartData.length > 0 ? chartData.filter(day => (day['Time Tracked'] as number) > 0).length : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

             <div className="h-80">
        
        {chartData.length > 0 && chartData.some(day => 
          Object.keys(day).some(key => key !== 'date' && (day[key] as number) > 0)
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
              {isAdmin ? (
                // Admin view: show bars for each user
                users.map((user, index) => (
                  <Bar
                    key={user.id}
                    dataKey={user.username}
                    fill={`hsl(${200 + index * 40}, 70%, 50%)`}
                    radius={[2, 2, 0, 0]}
                  />
                ))
              ) : (
                // Non-admin view: show single bar for time tracked
                <Bar
                  dataKey="Time Tracked"
                  fill="hsl(200, 70%, 50%)"
                  radius={[2, 2, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BarChart3 className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No time tracking data available</p>
            <p className="text-sm text-center">
              {isAdmin 
                ? 'No time tracking data found for the selected period.'
                : 'No time tracking data found for your account.'
              }
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Debug info:</p>
              <p>Users: {users.length}</p>
              <p>Selected days: {selectedDays}</p>
              <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingChart;
