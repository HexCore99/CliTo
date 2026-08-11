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
    const justTaskId = useTaskStore.getState().currentJustTaskId;
    const includeAll = useTaskStore.getState().currentIncludeAll;

    for (const [columnName, sortOption] of Object.entries(newSortOptions)) {
      await get().sortColumn(
        columnName,
        sortOption,
        boardId,
        includeAll,
        justTaskId,
        false,
      );
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
    includeAll = useTaskStore.getState().currentIncludeAll,
    justTaskId = useTaskStore.getState().currentJustTaskId,
    persistConfig = true,
  ) => {
    const taskView = useTaskStore.getState().currentTaskView;

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
      includeAll,
      taskView,
      justTaskId,
    });

    if (
      useTaskStore.getState().currentBoardId !== boardId ||
      useTaskStore.getState().currentJustTaskId !== justTaskId ||
      useTaskStore.getState().currentIncludeAll !== includeAll ||
      useTaskStore.getState().currentTaskView !== taskView
    ) {
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

  applyCurrentSorting: async (boardId, includeAll, justTaskId = null) => {
    const sortOptions = get().sortOptions;
    const taskView = useTaskStore.getState().currentTaskView;

    for (const [columnName, sortOption] of Object.entries(sortOptions)) {
      if (useTaskStore.getState().currentTaskView !== taskView) return;

      await get().sortColumn(
        columnName,
        sortOption,
        boardId,
        includeAll,
        justTaskId,
        false,
      );
    }
  },

  getSortConfig: () => {
    const { columnName, sortOption } = get();
    return { columnName, sortOption };
  },
}));
