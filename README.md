# SprintSync - AI-Powered Sprint Management

A modern web application for managing software development sprints with AI-powered task suggestions and comprehensive analytics.

## Features

### 🎯 Task Management
- Create, edit, and delete tasks
- Track task status (To Do, In Progress, Done)
- Time tracking with customizable durations
- AI-powered task description suggestions

### 📊 Kanban Board
- Drag-and-drop interface for task management
- Visual status columns (To Do, In Progress, Done)
- Real-time status updates via API calls
- Smooth animations and visual feedback

### 📈 Analytics Dashboard
- Time tracking analytics per user per day
- Interactive bar charts using Recharts
- Configurable time periods (7, 14, 30 days)
- Summary statistics (total hours, average per day, active users)

### 🤖 AI Integration
- Smart task description generation
- Daily planning suggestions
- Context-aware recommendations

### 🔐 Authentication
- User registration and login
- Role-based access control (Admin/User)
- Secure token-based authentication

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Usage

### Kanban Board
- Switch to "Kanban & Analytics" view from the dashboard
- Drag tasks between columns to update their status
- Tasks automatically sync with the backend via API calls
- Visual feedback shows valid drop zones

### Analytics
- View time tracking data in the Analytics tab
- Filter by different time periods
- See breakdowns by user and date
- Monitor team productivity metrics

## API Integration

The application integrates with a backend API that provides:
- Task CRUD operations
- User management
- AI suggestion endpoints
- Real-time status updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a pull request

## License

This project is licensed under the MIT License.
