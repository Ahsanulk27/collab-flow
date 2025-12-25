# Task Assignment Feature - Complete Documentation

> **Verified:** This documentation is based on the actual codebase in this project. All code examples, file paths, line numbers, and API endpoints have been verified against the current implementation.

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Database Schema](#architecture--database-schema)
3. [Backend Implementation](#backend-implementation)
4. [API Endpoint Details](#api-endpoint-details)
5. [Request Flow & Execution](#request-flow--execution)
6. [Security & Validation](#security--validation)
7. [Code Walkthrough](#code-walkthrough)
8. [Integration with System](#integration-with-system)
9. [Usage Examples](#usage-examples)
10. [Error Handling](#error-handling)

---

## Overview

The Task Assignment feature allows authenticated users within a workspace to assign tasks to other workspace members. This feature is part of the CollabFlow collaboration platform, enabling team members to delegate work and track task ownership.

### Key Features
- Assign tasks to workspace members by username
- Validate that assigned users are workspace members
- Update task ownership in real-time
- Return complete task information with assigned user details
- Secure authentication and authorization checks

---

## Architecture & Database Schema

### Database Models

The task assignment feature relies on three primary models in the Prisma schema:

#### 1. Task Model (`backend/prisma/schema.prisma`)

```prisma
model Task {
  id           String      @id @default(uuid())
  title        String
  description  String?
  status       String          
  assignedToId String?      // Foreign key to User
  workspaceId  String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relations
  assignedTo   User?       @relation("AssignedTasks", fields: [assignedToId], references: [id])
  workspace    Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}
```

**Key Fields:**
- `assignedToId`: Optional foreign key that stores the ID of the user assigned to the task
- `workspaceId`: Required field linking the task to a workspace
- `assignedTo`: Relation to the User model, allowing access to user details

#### 2. User Model

```prisma
model User {
  id            String          @id @default(uuid())
  name          String?
  email         String          @unique
  passwordHash  String
  profileImage  String?
  createdAt     DateTime        @default(now())

  // Relations
  memberships   WorkspaceMember[]
  assignedTasks Task[]          @relation("AssignedTasks")
  messages      Message[]
}
```

**Key Relations:**
- `assignedTasks`: One-to-many relationship with tasks assigned to this user

#### 3. WorkspaceMember Model (Join Table)

```prisma
model WorkspaceMember {
  id          String     @id @default(uuid())
  userId      String
  workspaceId String
  role        WorkspaceRole @default(MEMBER)
  joinedAt    DateTime   @default(now())

  // Relations
  user        User       @relation(fields: [userId], references: [id])
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId]) 
}
```

**Purpose:**
- Tracks which users belong to which workspaces
- Stores user roles (OWNER, ADMIN, MEMBER)
- Ensures unique membership per user-workspace combination

### Relationship Diagram

```
Workspace
  ├── has many Tasks
  └── has many WorkspaceMembers
        └── references User

Task
  ├── belongs to Workspace
  └── optionally assigned to User (via assignedToId)

User
  ├── has many WorkspaceMemberships
  └── has many assignedTasks
```

---

## Backend Implementation

### File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── taskController.ts      # Contains assignTask function
│   ├── routes/
│   │   └── taskRoutes.ts          # Defines API routes
│   ├── middleware/
│   │   ├── authMiddleware.ts      # Authentication middleware
│   │   └── errorHandler.ts        # Error handling middleware
│   ├── app.ts                      # Express app configuration
│   └── server.ts                   # Server setup
└── prisma/
    └── schema.prisma               # Database schema
```

### 1. Controller: `taskController.ts`

The `assignTask` function is the core of the assignment feature:

**Location:** `backend/src/controllers/taskController.ts` (lines 95-171)  
**Verified:** ✅ Matches actual implementation

```typescript
export const assignTask = async (
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Step 1: Authentication check
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Step 2: Extract taskId from URL parameters
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: "taskId is required" });
    }

    // Step 3: Validate request body
    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    // Step 4: Extract username from request body
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "User name is required" });
    }

    // Step 5: Find and validate task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Step 6: Find user by name
    const assignedUser = await prisma.user.findFirst({
      where: { name },
    });

    if (!assignedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 7: Verify user is a workspace member
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: assignedUser.id,
        workspaceId: task.workspaceId,
      },
    });

    if (!isMember) {
      return res.status(400).json({
        error: "User is not a member of this workspace",
      });
    }

    // Step 8: Update task with assigned user
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: assignedUser.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // Step 9: Return updated task
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};
```

### 2. Routes: `taskRoutes.ts`

**Location:** `backend/src/routes/taskRoutes.ts`  
**Verified:** ✅ Matches actual implementation (line 21)

```typescript
import { Router } from "express";
import {
  createTask,
  getTasksByWorkspace,
  updateTask,
  assignTask,
  deleteTask,
} from "../controllers/taskController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Task assignment endpoint
router.patch("/tasks/:taskId/assign", assignTask);

// Other task routes...
router.post("/workspaces/:workspaceId/tasks", createTask);
router.get("/workspaces/:workspaceId/tasks", getTasksByWorkspace);
router.put("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);

export default router;
```

**Route Registration:** The task router is registered in `app.ts` (line 39):

```typescript
app.use("/api/v1", taskRouter);
```

**Verified:** ✅ Matches actual implementation

This means the full endpoint path is: `/api/v1/tasks/:taskId/assign`

### 3. Authentication Middleware: `authMiddleware.ts`

**Location:** `backend/src/middleware/authMiddleware.ts`  
**Verified:** ✅ Matches actual implementation

All task routes are protected by authentication middleware that:

1. **Extracts JWT Token:** Reads the `Authorization` header
2. **Validates Token:** Verifies the JWT signature using `JWT_SECRET`
3. **Extracts User Info:** Adds `userId` and `email` to the request object
4. **Type Safety:** Uses TypeScript interface `authRequest` extending Express `Request`

```typescript
export interface authRequest extends Request {
  user?: JwtPayload & { userId: string; email: string };
}

export const authMiddleware = async(
  req: authRequest,
  res: Response,
  next: NextFunction
) => {
  // Validates Bearer token and attaches user info to req.user
  // Returns 401 if authentication fails
};
```

### 4. Error Handling: `errorHandler.ts`

**Location:** `backend/src/middleware/errorHandler.ts`

The error handler middleware catches and formats errors:

- **Prisma Errors:** Handles database-specific errors (duplicate keys, not found, etc.)
- **General Errors:** Formats standard HTTP errors
- **Logging:** Logs errors for debugging

---

## API Endpoint Details

### Endpoint Specification

**Method:** `PATCH`  
**Path:** `/api/v1/tasks/:taskId/assign`  
**Authentication:** Required (Bearer token in Authorization header)  
**Content-Type:** `application/json`

### URL Parameters

| Parameter | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| `taskId`  | string | Yes      | UUID of the task to assign |

### Request Body

```json
{
  "name": "John Doe"
}
```

| Field | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| `name` | string | Yes      | Username of the member to assign |

### Success Response

**Status Code:** `200 OK`

```json
{
  "id": "task-uuid",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "status": "IN_PROGRESS",
  "assignedToId": "user-uuid",
  "workspaceId": "workspace-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z",
  "assignedTo": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://example.com/profile.jpg"
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Causes:**
- Missing or invalid JWT token
- Token expired
- Invalid token signature

#### 400 Bad Request
```json
{
  "error": "taskId is required"
}
```
or
```json
{
  "error": "User name is required"
}
```
or
```json
{
  "error": "User is not a member of this workspace"
}
```

#### 404 Not Found
```json
{
  "error": "Task not found"
}
```
or
```json
{
  "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Request Flow & Execution

### Complete Request Lifecycle

```
1. Client Request
   ↓
2. Express App (app.ts)
   ↓
3. CORS Middleware
   ↓
4. JSON Parser
   ↓
5. Route Matching (/api/v1/tasks/:taskId/assign)
   ↓
6. Authentication Middleware (authMiddleware.ts)
   ├─ Extract JWT token
   ├─ Verify token
   └─ Attach user to request
   ↓
7. assignTask Controller (taskController.ts)
   ├─ Validate authentication
   ├─ Extract taskId from params
   ├─ Extract name from body
   ├─ Find task in database
   ├─ Find user by name
   ├─ Verify workspace membership
   ├─ Update task assignment
   └─ Return updated task
   ↓
8. Error Handler (if error occurs)
   ↓
9. JSON Response to Client
```

### Step-by-Step Execution

#### Step 1: Request Arrival
The client sends a PATCH request to `/api/v1/tasks/{taskId}/assign` with:
- Authorization header: `Bearer {jwt_token}`
- Request body: `{ "name": "username" }`

#### Step 2: Authentication
The `authMiddleware` intercepts the request:
- Extracts token from `Authorization: Bearer {token}`
- Verifies token using `JWT_SECRET` from environment variables
- Decodes payload and attaches `userId` and `email` to `req.user`
- If invalid, returns 401 and stops execution

#### Step 3: Controller Execution
The `assignTask` function executes:

1. **Authentication Check:**
   ```typescript
   const userId = req.user?.userId;
   if (!userId) return res.status(401).json({ error: "Unauthorized" });
   ```

2. **Parameter Extraction:**
   ```typescript
   const { taskId } = req.params;  // From URL
   const { name } = req.body;       // From request body
   ```

3. **Task Validation:**
   ```typescript
   const task = await prisma.task.findUnique({
     where: { id: taskId },
     include: { workspace: true },
   });
   ```
   - Queries database for task
   - Includes workspace relation for membership check
   - Returns 404 if task doesn't exist

4. **User Lookup:**
   ```typescript
   const assignedUser = await prisma.user.findFirst({
     where: { name },
   });
   ```
   - Searches for user by name (case-sensitive)
   - Returns 404 if user doesn't exist

5. **Membership Verification:**
   ```typescript
   const isMember = await prisma.workspaceMember.findFirst({
     where: {
       userId: assignedUser.id,
       workspaceId: task.workspaceId,
     },
   });
   ```
   - Checks if user belongs to the task's workspace
   - Returns 400 if user is not a member

6. **Task Update:**
   ```typescript
   const updatedTask = await prisma.task.update({
     where: { id: taskId },
     data: { assignedToId: assignedUser.id },
     include: {
       assignedTo: {
         select: {
           id: true,
           name: true,
           email: true,
           profileImage: true,
         },
       },
     },
   });
   ```
   - Updates `assignedToId` field
   - Automatically updates `updatedAt` timestamp
   - Includes assigned user details in response

7. **Response:**
   ```typescript
   res.json(updatedTask);
   ```
   - Sends 200 OK with complete task object

#### Step 4: Error Handling
If any error occurs:
- Caught by `try-catch` block
- Passed to `next(err)`
- Handled by `errorHandler` middleware
- Formatted and returned to client

---

## Security & Validation

### Security Measures

1. **Authentication Required:**
   - All task routes protected by `authMiddleware`
   - JWT token must be valid and not expired
   - User identity verified before any operation

2. **Workspace Membership Validation:**
   - Users can only assign tasks to workspace members
   - Prevents assigning tasks to users outside the workspace
   - Validates membership before updating task

3. **Input Validation:**
   - `taskId` must be provided in URL
   - `name` must be provided in request body
   - Request body must exist

4. **Database Constraints:**
   - Foreign key constraints ensure data integrity
   - Cascade deletes maintain referential integrity
   - Unique constraints prevent duplicate memberships

### Validation Checks

| Check | Location | Error Code | Message |
|-------|----------|------------|---------|
| User authenticated | Controller | 401 | "Unauthorized" |
| taskId provided | Controller | 400 | "taskId is required" |
| Request body exists | Controller | 400 | "Request body is required" |
| name provided | Controller | 400 | "User name is required" |
| Task exists | Database query | 404 | "Task not found" |
| User exists | Database query | 404 | "User not found" |
| User is workspace member | Database query | 400 | "User is not a member of this workspace" |

---

## Code Walkthrough

### Detailed Code Analysis

#### 1. Prisma Client Usage

```typescript
const prisma = new PrismaClient();
```

The Prisma Client is instantiated at the module level, providing type-safe database access. It's generated from the Prisma schema and includes:
- Type-safe queries
- Automatic relation handling
- Transaction support

#### 2. Type-Safe Request Interface

```typescript
export interface authRequest extends Request {
  user?: JwtPayload & { userId: string; email: string };
}
```

This TypeScript interface extends Express's `Request` type, adding:
- `user` property with JWT payload
- Type safety for `userId` and `email`
- Optional chaining support (`req.user?.userId`)

#### 3. Database Query Pattern

The function uses Prisma's query builder pattern:

```typescript
// Find unique record
await prisma.task.findUnique({ where: { id: taskId } })

// Find first matching record
await prisma.user.findFirst({ where: { name } })

// Update with relations
await prisma.task.update({
  where: { id: taskId },
  data: { assignedToId: assignedUser.id },
  include: { assignedTo: { select: {...} } }
})
```

**Key Prisma Features Used:**
- `findUnique`: Finds record by unique field (primary key)
- `findFirst`: Finds first matching record
- `update`: Updates record and returns updated data
- `include`: Eagerly loads relations
- `select`: Specifies which fields to return

#### 4. Error Propagation

```typescript
try {
  // ... logic ...
} catch (err) {
  next(err);
}
```

Errors are passed to Express error handler via `next()`, allowing:
- Centralized error handling
- Consistent error formatting
- Proper HTTP status codes

---

## Integration with System

### Integration Points

#### 1. Task Creation
Tasks can be created with an initial assignment:

```typescript
// In createTask function
const task = await prisma.task.create({
  data: {
    title,
    description,
    status,
    assignedToId,  // Optional initial assignment
    workspaceId,
  },
});
```

#### 2. Task Updates
The `updateTask` function also supports assignment:

```typescript
// In updateTask function
const task = await prisma.task.update({
  where: { id: taskId },
  data: { title, description, status, assignedToId },
});
```

#### 3. Task Retrieval
Tasks are fetched with assignment information:

```typescript
// In getTasksByWorkspace function
const tasks = await prisma.task.findMany({
  where: { workspaceId },
  orderBy: { createdAt: "asc" },
  // Can include: include: { assignedTo: true }
});
```

### Frontend Integration

While the frontend doesn't currently have a UI for task assignment, the endpoint is ready for integration. The frontend would need to:

1. **Fetch Workspace Members:**
   ```typescript
   GET /api/v1/workspaces/:workspaceId
   // Returns workspace with members array
   ```

2. **Assign Task:**
   ```typescript
   PATCH /api/v1/tasks/:taskId/assign
   Body: { "name": "username" }
   ```

3. **Display Assigned User:**
   The response includes `assignedTo` object with user details.

### Related Features

- **Task Management:** Create, read, update, delete tasks
- **Workspace Management:** Manage workspace members
- **User Management:** User profiles and authentication
- **Real-time Updates:** Could be extended with WebSocket notifications

---

## Usage Examples

### Example 1: Assign Task via cURL

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"name": "John Doe"}'
```

### Example 2: Assign Task via JavaScript (Fetch API)

```javascript
const assignTask = async (taskId, userName) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(
      `${API_BASE}/tasks/${taskId}/assign`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: userName })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const task = await response.json();
    console.log('Task assigned:', task);
    return task;
  } catch (error) {
    console.error('Assignment failed:', error);
    throw error;
  }
};

// Usage
assignTask('task-uuid', 'John Doe');
```

### Example 3: Assign Task via Axios

```javascript
import axios from 'axios';

const assignTask = async (taskId, userName) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.patch(
      `${API_BASE}/tasks/${taskId}/assign`,
      { name: userName },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Error:', error.response.data.error);
    } else {
      // Request failed
      console.error('Request failed:', error.message);
    }
    throw error;
  }
};
```

### Example 4: React Component Integration

```typescript
import { useState } from 'react';
import axios from 'axios';

const TaskAssignment = ({ taskId, workspaceMembers }) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAssign = async () => {
    if (!selectedMember) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE}/tasks/${taskId}/assign`,
        { name: selectedMember },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Task assigned:', response.data);
      // Update UI or trigger refresh
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select 
        value={selectedMember} 
        onChange={(e) => setSelectedMember(e.target.value)}
      >
        <option value="">Select member...</option>
        {workspaceMembers.map(member => (
          <option key={member.user.id} value={member.user.name}>
            {member.user.name}
          </option>
        ))}
      </select>
      <button onClick={handleAssign} disabled={loading || !selectedMember}>
        {loading ? 'Assigning...' : 'Assign Task'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

---

## Error Handling

### Error Types and Responses

#### 1. Authentication Errors

**Scenario:** Invalid or missing JWT token

```typescript
// In authMiddleware
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  res.status(401).json({ error: "Unauthorized" });
  return;
}
```

**Client Handling:**
```javascript
if (error.response?.status === 401) {
  // Redirect to login or refresh token
  window.location.href = '/login';
}
```

#### 2. Validation Errors

**Scenario:** Missing required fields

```typescript
if (!taskId) {
  return res.status(400).json({ error: "taskId is required" });
}

if (!name) {
  return res.status(400).json({ error: "User name is required" });
}
```

**Client Handling:**
```javascript
if (error.response?.status === 400) {
  const message = error.response.data.error;
  // Display validation error to user
  showToast(message, 'error');
}
```

#### 3. Not Found Errors

**Scenario:** Task or user doesn't exist

```typescript
if (!task) {
  return res.status(404).json({ error: "Task not found" });
}

if (!assignedUser) {
  return res.status(404).json({ error: "User not found" });
}
```

**Client Handling:**
```javascript
if (error.response?.status === 404) {
  const message = error.response.data.error;
  // Show not found message
  showDialog(message);
}
```

#### 4. Business Logic Errors

**Scenario:** User is not a workspace member

```typescript
if (!isMember) {
  return res.status(400).json({
    error: "User is not a member of this workspace",
  });
}
```

**Client Handling:**
```javascript
if (error.response?.status === 400) {
  const message = error.response.data.error;
  // Show business logic error
  showWarning(message);
}
```

#### 5. Database Errors

**Scenario:** Database constraint violations

Handled by `errorHandler.ts`:

```typescript
if (err instanceof PrismaClientKnownRequestError) {
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "A record with this value already exists.",
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Record not found.",
    });
  }
}
```

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

### Best Practices

1. **Always Check Response Status:**
   ```javascript
   if (!response.ok) {
     const error = await response.json();
     throw new Error(error.error);
   }
   ```

2. **Handle Network Errors:**
   ```javascript
   try {
     // API call
   } catch (error) {
     if (error.response) {
       // Server responded with error
     } else if (error.request) {
       // Request made but no response
     } else {
       // Error setting up request
     }
   }
   ```

3. **User-Friendly Messages:**
   ```javascript
   const errorMessages = {
     401: 'Please log in to continue',
     404: 'Task or user not found',
     400: 'Invalid request. Please check your input',
     500: 'Server error. Please try again later'
   };
   ```

---

## Summary

The Task Assignment feature is a well-architected component of the CollabFlow platform that:

1. **Securely** assigns tasks to workspace members
2. **Validates** all inputs and business rules
3. **Integrates** seamlessly with the existing task and workspace systems
4. **Provides** clear error messages and status codes
5. **Maintains** data integrity through database constraints

### Key Takeaways

- **Authentication:** All endpoints require valid JWT tokens
- **Validation:** Multiple layers of validation ensure data integrity
- **Type Safety:** TypeScript interfaces provide compile-time safety
- **Error Handling:** Centralized error handling with consistent responses
- **Database Relations:** Prisma ORM manages complex relationships
- **API Design:** RESTful endpoint following HTTP standards

### Future Enhancements

Potential improvements to consider:

1. **Bulk Assignment:** Assign multiple tasks at once
2. **Assignment History:** Track assignment changes over time
3. **Notifications:** Notify users when tasks are assigned to them
4. **Permissions:** Role-based assignment permissions
5. **Unassignment:** Allow removing assignments (set to null)
6. **Search:** Find users by partial name match
7. **Assignment by Email:** Alternative to username lookup

---

## Conclusion

This documentation provides a comprehensive overview of the Task Assignment feature, from database schema to API usage. The implementation follows best practices for security, validation, and error handling, making it a robust and maintainable feature within the CollabFlow platform.

For questions or contributions, please refer to the main project documentation or contact the development team.

