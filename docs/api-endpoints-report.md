# ZenFlow Todos App - Exhaustive API Endpoints Report

This document provides a comprehensive, exhaustive specification of all API endpoints required for the **ZenFlow Todos App** to function properly in full production deployment. It details all backend API route handlers, request/response JSON schemas, header requirements, and HTTP status codes identified from the codebase analysis.

---

## Executive Summary of API Surface

| Category | Endpoint Count | Description |
| :--- | :--- | :--- |
| **Tasks API** | 7 | Full CRUD, completion toggle, reordering, and deletion undo operations |
| **Subtasks API** | 3 | Add, completion toggle, and deletion of checklist items |
| **Comments API** | 2 | Activity logging and comment thread retrieval/creation |
| **Spaces API** | 3 | Workspace category management and task migration logic |
| **User Profile API** | 2 | Profile retrieval and detail update endpoints |
| **Settings API** | 2 | Theme preference syncing and UI configuration |
| **Total Endpoints** | **19** | **Full application coverage** |

---

## 1. Defined Backend REST API Endpoints

### 1.1 Tasks Management API (`/api/tasks`)

#### 1.1.1 `GET /api/tasks`
- **HTTP Method:** `GET`
- **Endpoint Path:** `/api/tasks`
- **Purpose:** Retrieve all tasks filtered by space, completion status, priority, or search query.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Accept: application/json`
- **Request Schema:**
  - **Query Parameters:**
    | Parameter | Type | Required | Default | Description |
    | :--- | :--- | :--- | :--- | :--- |
    | `category` | `string` | No | `all` | Filter by space ID (`work`, `personal`, `ideas`, or custom space ID) |
    | `filter` | `string` | No | `all` | Completion status filter: `all`, `active`, `completed` |
    | `priority` | `string` | No | `all` | Priority level filter: `all`, `high`, `medium`, `low` |
    | `search` | `string` | No | None | Text search query matched against task text and description |
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Tasks retrieved successfully.
    - `401 Unauthorized`: Missing or invalid authentication token.
    - `500 Internal Server Error`: Server database query failure.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "id": "task-1721635200000",
          "text": "Optimize dashboard render performance",
          "completed": false,
          "category": "work",
          "priority": "high",
          "dueDate": "2026-07-25",
          "assignee": "MA",
          "recurrence": "none",
          "description": "### Goal\nMake the dashboard load instantly using layout animations.",
          "subtasks": [
            {
              "id": "sub-1",
              "text": "Select custom spring constants",
              "completed": true
            },
            {
              "id": "sub-2",
              "text": "Benchmark FPS drops",
              "completed": false
            }
          ],
          "comments": [
            {
              "id": "comm-1",
              "text": "This looks incredibly responsive on mobile!",
              "timestamp": "2026-07-22T11:21:32.000Z"
            }
          ],
          "createdAt": "2026-07-22T10:00:00.000Z"
        }
      ]
    }
    ```

---

#### 1.1.2 `POST /api/tasks`
- **HTTP Method:** `POST`
- **Endpoint Path:** `/api/tasks`
- **Purpose:** Create a new task entry in the specified workspace.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Request Body JSON:**
    ```json
    {
      "text": "Set up production deployment pipeline",
      "category": "work",
      "priority": "medium",
      "dueDate": "2026-07-30",
      "assignee": "AI",
      "recurrence": "weekly"
    }
    ```
    | Field Name | Type | Required | Validation / Enum |
    | :--- | :--- | :--- | :--- |
    | `text` | `string` | **Yes** | Non-empty string |
    | `category` | `string` | **Yes** | Valid space ID |
    | `priority` | `string` | **Yes** | `low` \| `medium` \| `high` |
    | `dueDate` | `string` \| `null` | No | ISO date string (`YYYY-MM-DD`) or null |
    | `assignee` | `string` \| `null` | No | `MA` \| `AI` \| `TL` or user ID |
    | `recurrence` | `string` | No | Default `none`. Values: `none` \| `daily` \| `weekly` \| `monthly` |
- **Response Schema:**
  - **Status Codes:**
    - `201 Created`: Task created successfully.
    - `400 Bad Request`: Validation failure (e.g. empty task text).
    - `401 Unauthorized`: Unauthorized request.
    - `500 Internal Server Error`: Failed to persist task.
  - **Success Response Body (201 Created):**
    ```json
    {
      "success": true,
      "message": "Task created successfully",
      "data": {
        "id": "task-1721635299000",
        "text": "Set up production deployment pipeline",
        "completed": false,
        "category": "work",
        "priority": "medium",
        "dueDate": "2026-07-30",
        "assignee": "AI",
        "recurrence": "weekly",
        "description": "",
        "subtasks": [],
        "comments": [],
        "createdAt": "2026-07-22T12:21:39.000Z"
      }
    }
    ```

---

#### 1.1.3 `PATCH /api/tasks/:id`
- **HTTP Method:** `PATCH`
- **Endpoint Path:** `/api/tasks/:id`
- **Purpose:** Update editable fields of a task (title text, detailed markdown description, priority, space category, due date, assignee, recurrence).
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Path Parameters:**
    - `id` (`string`, required): Unique ID of the task (e.g. `task-1721635200000`).
  - **Request Body JSON:**
    ```json
    {
      "text": "Refactored Dashboard component layout",
      "description": "### Progress\nCompleted smooth layout transitions and fixed spring physics.",
      "priority": "high",
      "dueDate": "2026-07-28",
      "assignee": "MA",
      "recurrence": "none"
    }
    ```
    | Field Name | Type | Required | Description |
    | :--- | :--- | :--- | :--- |
    | `text` | `string` | No | Updated task title |
    | `description` | `string` | No | Markdown content for task description |
    | `priority` | `string` | No | `low` \| `medium` \| `high` |
    | `category` | `string` | No | Space ID |
    | `dueDate` | `string` \| `null` | No | ISO date string or null |
    | `assignee` | `string` \| `null` | No | Assignee code or null |
    | `recurrence` | `string` | No | Recurrence frequency |
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Task updated successfully.
    - `400 Bad Request`: Invalid payload parameters.
    - `404 Not Found`: Task ID not found.
    - `500 Internal Server Error`: Database update error.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Task updated successfully",
      "data": {
        "id": "task-1721635200000",
        "text": "Refactored Dashboard component layout",
        "completed": false,
        "category": "work",
        "priority": "high",
        "dueDate": "2026-07-28",
        "assignee": "MA",
        "recurrence": "none",
        "description": "### Progress\nCompleted smooth layout transitions and fixed spring physics.",
        "subtasks": [],
        "comments": [],
        "createdAt": "2026-07-22T10:00:00.000Z"
      }
    }
    ```

---

#### 1.1.4 `PATCH /api/tasks/:id/toggle`
- **HTTP Method:** `PATCH`
- **Endpoint Path:** `/api/tasks/:id/toggle`
- **Purpose:** Toggle a task's completion status.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Path Parameters:**
    - `id` (`string`, required): Unique ID of the task.
  - **Request Body JSON:** None (or optional boolean payload)
    ```json
    {}
    ```
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Task completion state updated.
    - `404 Not Found`: Task not found.
    - `500 Internal Server Error`: Server error.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "taskId": "task-1721635200000",
      "completed": true
    }
    ```

---

#### 1.1.5 `PATCH /api/tasks/reorder`
- **HTTP Method:** `PATCH`
- **Endpoint Path:** `/api/tasks/reorder`
- **Purpose:** Update task array order after keyboard shift (Shift + Arrow Up/Down) or drag-and-drop actions.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Request Body JSON:**
    ```json
    {
      "orderedTaskIds": [
        "task-1721635299000",
        "task-1721635200000",
        "task-1721635100000"
      ]
    }
    ```
    | Field Name | Type | Required | Description |
    | :--- | :--- | :--- | :--- |
    | `orderedTaskIds` | `array of strings` | **Yes** | Complete array of task IDs in desired new order |
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Tasks reordered successfully.
    - `400 Bad Request`: Invalid or incomplete array of task IDs.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Tasks reordered successfully"
    }
    ```

---

#### 1.1.6 `DELETE /api/tasks/:id`
- **HTTP Method:** `DELETE`
- **Endpoint Path:** `/api/tasks/:id`
- **Purpose:** Soft-delete or remove a task card. Returns the deleted task payload to enable client-side pausable toast UNDO functionality.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:**
  - **Path Parameters:**
    - `id` (`string`, required): Unique ID of the task to delete.
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Task deleted successfully (returns deleted task data for potential restore).
    - `404 Not Found`: Task not found.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Task deleted successfully",
      "deletedTask": {
        "id": "task-1721635200000",
        "text": "Optimize dashboard render performance",
        "completed": false,
        "category": "work",
        "priority": "high",
        "dueDate": "2026-07-25",
        "assignee": "MA",
        "recurrence": "none",
        "description": "...",
        "subtasks": [],
        "comments": [],
        "createdAt": "2026-07-22T10:00:00.000Z"
      }
    }
    ```

---

#### 1.1.7 `POST /api/tasks/:id/restore`
- **HTTP Method:** `POST`
- **Endpoint Path:** `/api/tasks/:id/restore`
- **Purpose:** Restore a deleted task when the user clicks the "Undo" button on an active toast notification.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Path Parameters:**
    - `id` (`string`, required): Unique ID of task to restore.
  - **Request Body JSON (Optional Backup Payload):**
    ```json
    {
      "taskBackup": {
        "id": "task-1721635200000",
        "text": "Optimize dashboard render performance",
        "completed": false,
        "category": "work",
        "priority": "high",
        "createdAt": "2026-07-22T10:00:00.000Z"
      }
    }
    ```
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Task restored successfully.
    - `404 Not Found`: Task payload unavailable for restoration.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Task restored successfully",
      "data": {
        "id": "task-1721635200000",
        "text": "Optimize dashboard render performance",
        "completed": false,
        "category": "work",
        "priority": "high"
      }
    }
    ```

---

### 1.2 Subtasks / Checklist API (`/api/tasks/:taskId/subtasks`)

#### 1.2.1 `POST /api/tasks/:taskId/subtasks`
- **HTTP Method:** `POST`
- **Endpoint Path:** `/api/tasks/:taskId/subtasks`
- **Purpose:** Add a new subtask/checklist item to a specific parent task.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Path Parameters:**
    - `taskId` (`string`, required): Parent task ID.
  - **Request Body JSON:**
    ```json
    {
      "text": "Benchmark FPS drops on lower-end devices"
    }
    ```
    | Field Name | Type | Required | Description |
    | :--- | :--- | :--- | :--- |
    | `text` | `string` | **Yes** | Subtask checklist item text |
- **Response Schema:**
  - **Status Codes:**
    - `201 Created`: Subtask added.
    - `400 Bad Request`: Missing text string.
    - `404 Not Found`: Parent task not found.
  - **Success Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "sub-1721635350000",
        "text": "Benchmark FPS drops on lower-end devices",
        "completed": false
      }
    }
    ```

---

#### 1.2.2 `PATCH /api/tasks/:taskId/subtasks/:subId/toggle`
- **HTTP Method:** `PATCH`
- **Endpoint Path:** `/api/tasks/:taskId/subtasks/:subId/toggle`
- **Purpose:** Toggle completion status of a subtask item.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Path Parameters:**
    - `taskId` (`string`, required): Parent task ID.
    - `subId` (`string`, required): Subtask item ID.
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Subtask status updated.
    - `404 Not Found`: Subtask or parent task not found.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "subId": "sub-1721635350000",
      "completed": true,
      "subtaskCompletionPercent": 50
    }
    ```

---

#### 1.2.3 `DELETE /api/tasks/:taskId/subtasks/:subId`
- **HTTP Method:** `DELETE`
- **Endpoint Path:** `/api/tasks/:taskId/subtasks/:subId`
- **Purpose:** Remove a subtask item from a parent task.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:**
  - **Path Parameters:**
    - `taskId` (`string`, required): Parent task ID.
    - `subId` (`string`, required): Subtask ID.
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Subtask deleted.
    - `404 Not Found`: Subtask not found.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Subtask deleted successfully"
    }
    ```

---

### 1.3 Comments & Activity Feed API (`/api/tasks/:taskId/comments`)

#### 1.3.1 `GET /api/tasks/:taskId/comments`
- **HTTP Method:** `GET`
- **Endpoint Path:** `/api/tasks/:taskId/comments`
- **Purpose:** Retrieve all activity comments associated with a specific task.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:**
  - **Path Parameters:**
    - `taskId` (`string`, required): Parent task ID.
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Comments retrieved.
    - `404 Not Found`: Parent task not found.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "comments": [
        {
          "id": "comm-1",
          "text": "This looks incredibly responsive on mobile!",
          "timestamp": "2026-07-22T11:21:32.000Z"
        }
      ]
    }
    ```

---

#### 1.3.2 `POST /api/tasks/:taskId/comments`
- **HTTP Method:** `POST`
- **Endpoint Path:** `/api/tasks/:taskId/comments`
- **Purpose:** Add a comment/activity log to a task.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Path Parameters:**
    - `taskId` (`string`, required): Parent task ID.
  - **Request Body JSON:**
    ```json
    {
      "text": "Updated physics spring stiffness to 220 and damping to 24."
    }
    ```
    | Field Name | Type | Required | Description |
    | :--- | :--- | :--- | :--- |
    | `text` | `string` | **Yes** | Comment text |
- **Response Schema:**
  - **Status Codes:**
    - `201 Created`: Comment created successfully.
    - `400 Bad Request`: Empty comment text.
  - **Success Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "comm-1721635400000",
        "text": "Updated physics spring stiffness to 220 and damping to 24.",
        "timestamp": "2026-07-22T12:22:00.000Z"
      }
    }
    ```

---

### 1.4 Spaces / Workspaces API (`/api/spaces`)

#### 1.4.1 `GET /api/spaces`
- **HTTP Method:** `GET`
- **Endpoint Path:** `/api/spaces`
- **Purpose:** Retrieve all user defined spaces/workspaces (e.g. Work, Personal, Ideas).
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:** None
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: List of spaces returned.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        { "id": "work", "label": "Work", "color": "indigo" },
        { "id": "personal", "label": "Personal", "color": "emerald" },
        { "id": "ideas", "label": "Ideas", "color": "amber" }
      ]
    }
    ```

---

#### 1.4.2 `POST /api/spaces`
- **HTTP Method:** `POST`
- **Endpoint Path:** `/api/spaces`
- **Purpose:** Create a new custom space/workspace.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Request Body JSON:**
    ```json
    {
      "label": "Marketing",
      "color": "purple"
    }
    ```
    | Field Name | Type | Required | Valid Values |
    | :--- | :--- | :--- | :--- |
    | `label` | `string` | **Yes** | Space display name |
    | `color` | `string` | **Yes** | `indigo` \| `emerald` \| `amber` \| `rose` \| `purple` |
- **Response Schema:**
  - **Status Codes:**
    - `201 Created`: Space created.
    - `400 Bad Request`: Validation failure.
  - **Success Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "space-1721635450000",
        "label": "Marketing",
        "color": "purple"
      }
    }
    ```

---

#### 1.4.3 `DELETE /api/spaces/:id`
- **HTTP Method:** `DELETE`
- **Endpoint Path:** `/api/spaces/:id`
- **Purpose:** Delete a custom space. Reassigns all tasks belonging to the deleted space to the first default remaining space.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:**
  - **Path Parameters:**
    - `id` (`string`, required): Space ID to delete.
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Space deleted and tasks migrated.
    - `400 Bad Request`: Cannot delete the last remaining space.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Space deleted successfully",
      "migratedTasksCount": 3,
      "fallbackSpaceId": "work"
    }
    ```

---

### 1.5 User Profile API (`/api/profile`)

#### 1.5.1 `GET /api/profile`
- **HTTP Method:** `GET`
- **Endpoint Path:** `/api/profile`
- **Purpose:** Retrieve the user profile details.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:** None
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Profile details returned.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "name": "Sherwyn Titus",
        "age": 25,
        "email": "sherwyn@zenflow.app",
        "number": "+1 555 0199"
      }
    }
    ```

---

#### 1.5.2 `PUT /api/profile`
- **HTTP Method:** `PUT`
- **Endpoint Path:** `/api/profile`
- **Purpose:** Update user profile details (Name, Age, Email, Phone Number).
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Request Body JSON:**
    ```json
    {
      "name": "Murali Anand",
      "age": 28,
      "email": "murali@zenflow.app",
      "number": "+1 555 0244"
    }
    ```
    | Field Name | Type | Required | Description |
    | :--- | :--- | :--- | :--- |
    | `name` | `string` | No | User's full name |
    | `age` | `number` \| `string` | No | User's age |
    | `email` | `string` | No | User's email address |
    | `number` | `string` | No | User's phone number |
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Profile updated.
    - `400 Bad Request`: Invalid email format or fields.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Profile updated successfully",
      "data": {
        "name": "Murali Anand",
        "age": 28,
        "email": "murali@zenflow.app",
        "number": "+1 555 0244"
      }
    }
    ```

---

### 1.6 Settings API (`/api/user/settings`)

#### 1.6.1 `GET /api/user/settings`
- **HTTP Method:** `GET`
- **Endpoint Path:** `/api/user/settings`
- **Purpose:** Retrieve user UI settings and active theme selection.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
- **Request Schema:** None
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Settings retrieved.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "theme": "obsidian",
        "defaultView": "list"
      }
    }
    ```

---

#### 1.6.2 `PATCH /api/user/settings`
- **HTTP Method:** `PATCH`
- **Endpoint Path:** `/api/user/settings`
- **Purpose:** Persist changes to active theme or user interface preferences.
- **Authentication & Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Required)
  - `Content-Type: application/json`
- **Request Schema:**
  - **Request Body JSON:**
    ```json
    {
      "theme": "cyberpunk"
    }
    ```
    | Field Name | Type | Required | Valid Values |
    | :--- | :--- | :--- | :--- |
    | `theme` | `string` | No | `obsidian` \| `cyberpunk` \| `lightblue` \| `lightpurple` |
- **Response Schema:**
  - **Status Codes:**
    - `200 OK`: Settings saved.
    - `400 Bad Request`: Invalid theme ID.
  - **Success Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Theme setting updated to cyberpunk",
      "data": {
        "theme": "cyberpunk"
      }
    }
    ```

---

## 2. Summary Matrix of Status Codes

| Code | Meaning | When Returned in ZenFlow API |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | `GET`, `PATCH`, `DELETE` operations for tasks, subtasks, comments, profile, and settings |
| `201 Created` | Resource created | `POST` creation of tasks, subtasks, comments, and spaces |
| `400 Bad Request` | Validation failure | Missing required fields (e.g. empty task text or invalid space colors) |
| `401 Unauthorized` | Authentication error | Missing or invalid bearer token in Authorization header |
| `404 Not Found` | Resource missing | Requested task, subtask, comment, or space ID does not exist |
| `500 Internal Server Error` | Database/Server error | Unhandled backend exception or database query failure |

---
*Report generated automatically for ZenFlow Todos App.*
