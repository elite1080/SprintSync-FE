# SprintSync Demo Data

This file contains sample data structures that the frontend expects from the backend API.

## Sample Users

```json
[
  {
    "id": "1",
    "email": "admin@sprintsync.com",
    "username": "admin",
    "isAdmin": true,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": "2",
    "email": "engineer@sprintsync.com",
    "username": "john_engineer",
    "isAdmin": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

## Sample Tasks

```json
[
  {
    "id": "1",
    "title": "Implement user authentication",
    "description": "Set up JWT-based authentication system with login/register endpoints",
    "status": "in_progress",
    "totalMinutes": 240,
    "assignedTo": "2",
    "createdBy": "1",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T14:00:00Z"
  },
  {
    "id": "2",
    "title": "Design database schema",
    "description": "Create ERD and implement database tables for users and tasks",
    "status": "done",
    "totalMinutes": 180,
    "assignedTo": "1",
    "createdBy": "1",
    "createdAt": "2024-01-14T09:00:00Z",
    "updatedAt": "2024-01-14T16:00:00Z"
  },
  {
    "id": "3",
    "title": "Set up CI/CD pipeline",
    "description": "Configure GitHub Actions for automated testing and deployment",
    "status": "todo",
    "totalMinutes": 120,
    "assignedTo": "2",
    "createdBy": "1",
    "createdAt": "2024-01-15T15:00:00Z",
    "updatedAt": "2024-01-15T15:00:00Z"
  }
]
```

## Sample AI Suggestions

### Task Description Generation
```json
{
  "type": "task_description",
  "content": "This task involves implementing a comprehensive user authentication system including user registration, login, password reset functionality, and session management. The system should support JWT tokens, implement proper password hashing, and include rate limiting for security.",
  "confidence": 0.92
}
```

### Daily Plan Suggestion
```json
{
  "type": "daily_plan",
  "content": "Based on your current tasks and priorities, here's a suggested daily plan:\n\n1. **Morning (9:00-11:00)**: Review and update the database schema design\n2. **Mid-morning (11:00-12:30)**: Continue implementing user authentication\n3. **Afternoon (2:00-4:00)**: Set up the CI/CD pipeline\n4. **Late afternoon (4:00-5:00)**: Code review and testing\n\nTotal estimated time: 6.5 hours",
  "confidence": 0.88
}
```

## API Endpoints Expected

The frontend expects these backend endpoints:

- `POST /auth/login` - User authentication (username + password)
- `POST /auth/register` - User registration (email + password + username)
- `GET /users/me` - Current user info
- `GET /tasks` - Fetch all tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/status` - Update task status
- `POST /ai/suggest` - Get AI suggestions

## Testing the Frontend

1. Start the backend server (expected at http://localhost:8000)
2. Start the frontend: `npm run dev`
3. Navigate to http://localhost:3000
4. Use the sample user credentials to test the application

### Sample Login Credentials
- **Username**: `admin`, **Password**: (set by backend)
- **Username**: `john_engineer`, **Password**: (set by backend)

## Notes

- The frontend is configured to proxy API requests to `/api/*` which will be forwarded to the backend
- **Login now uses username + password** instead of email + password
- Registration still requires email + password + username
- JWT tokens are stored in localStorage for authentication
- The application gracefully handles API errors and shows appropriate messages
- All components are responsive and work on mobile devices
