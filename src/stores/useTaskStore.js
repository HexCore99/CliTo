import { invoke } from "@tauri-apps/api/core";
import { newMenu } from "@tauri-apps/api/menu/base";
import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  setTasks: (newTasks) => {
    //newTasks can be task array or function

    set((state) => ({
      tasks: typeof newTasks === "function" ? newTasks(state.tasks) : newTasks,
    }));
  },

  updateTaskField: (taskId, fieldName, newValue) => {
    const id = Number(taskId);

    set((state) => ({
      tasks: state.tasks.map((task) =>
        Number(task.id) === id ? { ...task, [fieldName]: newValue } : task,
      ),
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
    const due_date = task.due_date ?? null;
    const description = task.description ?? null;

    await invoke("create_task", {
      name: name,
      priority: priority,
      dueDate: due_date,
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

    get().updateTaskField(taskId, "status", newStatus);

    // set((state) => ({
    //   tasks: state.tasks.map((task) =>
    //     task.id === id ? { ...task, status: newStatus } : task,
    //   ),
    // }));
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

    get().updateTaskField(taskId, "priority", newPriority);
    // set((state) => ({
    //   tasks: state.tasks.map((task) =>
    //     Number(task.id) === id ? { ...task, priority: newPriority } : task,
    //   ),
    // }));
  },

  set_date: async (taskId, newDate) => {
    const id = Number(taskId);
    const dueDate = newDate ?? null;

    await invoke("set_due_date", {
      id,
      dueDate,
    });

    get().updateTaskField(id, "due_date", dueDate);
  },
}));
