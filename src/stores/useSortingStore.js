import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useTaskStore } from "./useTaskStore";

export const useSortingStore = create((set, get) => ({
  sortOptions: {
    todo: "default",
    "in-progress": "default",
    completed: "default",
  },

  sortColumn: async (columnName, sortOption) => {
    set((state) => ({
      sortOptions: {
        ...state.sortOptions,
        [columnName]: sortOption,
      },
    }));

    const sortedTasks = await invoke("sort_tasks", {
      columnName,
      sortOption,
    });

    console.log("current tasks before sorting:", useTaskStore.getState().tasks);
    console.log("sorted tasks:", sortedTasks);

    useTaskStore.getState().setTasks((currentTasks) => ({
      ...currentTasks,
      [columnName]: sortedTasks,
    }));
    console.log("current tasks after sorting:", useTaskStore.getState().tasks);
    console.log("\n\n\n");

    return sortedTasks;
  },

  getSortConfig: () => {
    const { columnName, sortOption } = get();
    return { columnName, sortOption };
  },
}));
