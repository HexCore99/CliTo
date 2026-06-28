import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  setTasks: (newTasks) => {
    //newTasks can be task array or function

    set((state) => ({
      tasks: typeof newTasks === "function" ? newTasks(state.tasks) : newTasks,
    }));
  },

  loadTasks: async () => {
    const savedTasks = await invoke("get_tasks");
    set({
      tasks: savedTasks,
    });
  },

  createTask: async (task) => {
    const name = task.name;
    const priority = task.priority ?? 4;
    const due_date = task.due_date ?? NULL;
    const description = task.description ?? NULL;

    await invoke("create_task", {
      name: name,
      priority: priority,
      due_date: due_date,
      description: description,
    });

    await get().loadTasks();
  },

  deleteTask: async (taskId) => {
    await invoke("delete_task", { id: taskId });

    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },
  updateTaskStatus: async (taskId, newStatus) => {
    const id = Number(taskId);

    await invoke("update_task_status", {
      id,
      status: newStatus,
    });

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task,
      ),
    }));
  },

  changeTaskStatus: async (taskId, status) => {
    const id = Number(taskId);
    const currentTasks = get().tasks;

    const selectedTask = currentTasks.find((task) => task.id === id);
    if (!selectedTask) return;

    const updatedTasks = [
      { ...selectedTask, status },
      ...currentTasks.filter((tsk) => tsk.id !== id),
    ];

    await invoke("update_task_status", { id, status });
    await invoke("update_position", { tasks: updatedTasks });

    await get().loadTasks();
  },

  set_priority: async (taskId, priority) => {
    const id = Number(taskId);
    const newPriority = Number(priority);

    await invoke("set_priority", {
      id: id,
      priority: newPriority,
    });
    set((state) => ({
      tasks: state.tasks.map((task) =>
        Number(task.id) === id ? { ...task, priority: newPriority } : task,
      ),
    }));
  },
}));
