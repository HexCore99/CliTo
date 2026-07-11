import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useTaskStore } from "./useTaskStore";
import { useProjectStore } from "./useProjectStore";
export const useTrashStore = create((set) => ({
  trashTasks: [],

  get_trash_tasks: async () => {
    const tasks = await invoke("get_trash_tasks");
    set({ trashTasks: tasks });
  },

  restore_task: async (taskId) => {
    await invoke("restore_from_trash", { id: taskId });

    set((state) => ({
      trashTasks: state.trashTasks.filter(
        (task) => Number(task.id) !== Number(taskId),
      ),
    }));
    await useProjectStore.getState().loadProjects();
    await useTaskStore.getState().loadTasks();
  },

  delete_from_trash: async (taskId) => {
    await invoke("delete_from_trash", { id: taskId });

    set((state) => ({
      trashTasks: state.trashTasks.filter(
        (task) => Number(task.id) !== Number(taskId),
      ),
    }));
  },

  empty_trash: async () => {
    await invoke("empty_trash");
    set({ trashTasks:[] });
  },
}));
