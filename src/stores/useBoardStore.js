import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export const useBoardStore = create((set, get) => ({
  states: {
    active: "All",
  },

  set_state: (newState) => {
    set({
      states: newState,
    });
  },
}));
