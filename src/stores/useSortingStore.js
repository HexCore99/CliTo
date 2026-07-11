import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { useTaskStore } from "./useTaskStore";

export const useSortingStore = create((set, get) => ({
  sortOptions: {
    todo: "default",
    "in-progress": "default",
    completed: "default",
  },

  loadInitialSorting: async () => {
    const currSortOption = get().sortOptions;

    const currConfig = await invoke("get_ui_config");
    const newSortOptions = currConfig.sort_config.reduce((acc, item) => {
      return {
        ...acc,
        [item.column_name]: item.sort_by,
      };
    }, currSortOption);

    set({ sortOptions: newSortOptions });

    // sort all columns, cz default task loads in db-order
    const boardId = useTaskStore.getState().currentBoardId;

    for (const [columnName, sortOption] of Object.entries(newSortOptions)) {
      await get().sortColumn(columnName, sortOption, boardId, false);
    }
  },

  updateUiConfig: async (columnName, sortOption) => {
    const currConfig = await invoke("get_ui_config");

    const nextConfig = currConfig.sort_config.map((item) =>
      item.column_name === columnName ? { ...item, sort_by: sortOption } : item,
    );

    const newConfig = {
      ...currConfig,
      sort_config: nextConfig,
    };

    await invoke("save_ui_config", { config: newConfig });
  },

  sortColumn: async (
    columnName,
    sortOption,
    boardId = useTaskStore.getState().currentBoardId,
    persistConfig = true,
  ) => {
    set((state) => ({
      sortOptions: {
        ...state.sortOptions,
        [columnName]: sortOption,
      },
    }));

    const sortedTasks = await invoke("sort_tasks", {
      columnName,
      sortOption,
      boardId,
    });

    if (useTaskStore.getState().currentBoardId !== boardId) {
      return sortedTasks;
    }

    useTaskStore.getState().setTasks((currentTasks) => ({
      ...currentTasks,
      [columnName]: sortedTasks,
    }));

    if (persistConfig) {
      await get().updateUiConfig(columnName, sortOption);
    }

    return sortedTasks;
  },

  applyCurrentSorting: async (boardId) => {
    const sortOptions = get().sortOptions;

    for (const [columnName, sortOption] of Object.entries(sortOptions)) {
      await get().sortColumn(columnName, sortOption, boardId, false);
    }
  },

  getSortConfig: () => {
    const { columnName, sortOption } = get();
    return { columnName, sortOption };
  },
}));
