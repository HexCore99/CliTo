import { create } from "zustand";

export const useBoardStore = create((set) => ({
  states: {
    type: "general",
    projectId: null,
    boardId: null,
    title: "All Tasks",
  },

  set_state: (newState) => {
    set({
      states: newState,
    });
  },
}));
