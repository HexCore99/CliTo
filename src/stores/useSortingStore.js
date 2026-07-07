import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useTaskStore } from "./useTaskStore";

export const useSortingStore = create((set, get) => ({
  columnName: null,
  sortOption: "default",
  sortColumn: async (columnName, sortOption) => {
    set({
      columnName: columnName,
      sortOption: sortOption,
    });

    const sortedTasks = await invoke("sort_tasks", {
      columnName,
      sortOption,
    });

    useTaskStore.getState().setTasks((currentTasks) => ({
      ...currentTasks,
      [columnName]: sortedTasks,
    }));

    return sortedTasks;
  },
}));
