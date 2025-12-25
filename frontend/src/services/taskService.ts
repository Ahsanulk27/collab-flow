import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const taskService = {
  // Get all tasks for a workspace
  getTasksByWorkspace: async (workspaceId: string) => {
    const res = await axios.get(
      `${API_BASE}/workspaces/${workspaceId}/tasks`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  // Assign a task to a user
  assignTask: async (taskId: string, userName: string) => {
    const res = await axios.patch(
      `${API_BASE}/tasks/${taskId}/assign`,
      { name: userName },
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  // Update a task
  updateTask: async (taskId: string, updates: any) => {
    const res = await axios.put(`${API_BASE}/tasks/${taskId}`, updates, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Create a task
  createTask: async (workspaceId: string, taskData: any) => {
    const res = await axios.post(
      `${API_BASE}/workspaces/${workspaceId}/tasks`,
      taskData,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data;
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    const res = await axios.delete(`${API_BASE}/tasks/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};

