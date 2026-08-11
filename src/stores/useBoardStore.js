import { create } from "zustand";

export const useBoardStore = create((set) => ({
  states: {
    type: "general",
    projectId: null,
    boardId: null,
    justTaskId: null,
    title: "All Tasks",
    focusedTaskId: null,
  },

  set_state: (newState) => {
    set({
      states: newState,
    });
  },
}));
