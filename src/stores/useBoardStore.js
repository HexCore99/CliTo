import { create } from "zustand";

export const useBoardStore = create((set) => ({
  states: {
    type: "general",
    projectId: null,
    boardId: null,
    title: "All",
  },

  set_state: (newState) => {
    set({
      states: newState,
    });
  },
}));
