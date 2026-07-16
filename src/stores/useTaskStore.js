import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export const TASK_STATUSES = ["todo", "in-progress", "completed"];

export function createTaskColumns() {
  return {
    todo: [],
    "in-progress": [],
    completed: [],
  };
}

export function flattenTasks(tasksByStatus) {
  return TASK_STATUSES.flatMap((status) => tasksByStatus[status] ?? []);
}

export function groupTasksByStatus(taskList) {
  return taskList.reduce((tasksByStatus, task) => {
    const status = TASK_STATUSES.includes(task.status) ? task.status : "todo";
    tasksByStatus[status].push(
      status === task.status ? task : { ...task, status },
    );
    return tasksByStatus;
  }, createTaskColumns());
}

function moveTaskToColumn(tasksByStatus, taskId, newStatus) {
  if (!TASK_STATUSES.includes(newStatus)) {
    return tasksByStatus;
  }

  const id = Number(taskId);
  const taskList = flattenTasks(tasksByStatus);
  const selectedTask = taskList.find((task) => Number(task.id) === id);

  if (!selectedTask) {
    return tasksByStatus;
  }

  const remainingTasks = groupTasksByStatus(
    taskList.filter((task) => Number(task.id) !== id),
  );

  return {
    ...remainingTasks,
    [newStatus]: [
      { ...selectedTask, status: newStatus },
      ...remainingTasks[newStatus],
    ],
  };
}

export const useTaskStore = create((set, get) => ({
  tasks: createTaskColumns(),
  currentBoardId: null,
  currentIncludeAll: true,
  currentTaskView: "board",

  setTasks: (newTasks) => {
    //newTasks can be task array or function

    set((state) => ({
      tasks: typeof newTasks === "function" ? newTasks(state.tasks) : newTasks,
    }));
  },

  updateTaskField: (taskId, fieldName, newValue) => {
    const id = Number(taskId);

    set((state) => ({
      tasks: Object.fromEntries(
        TASK_STATUSES.map((status) => [
          status,
          state.tasks[status].map((task) =>
            Number(task.id) === id ? { ...task, [fieldName]: newValue } : task,
          ),
        ]),
      ),
    }));
  },

  applyTaskDraft: (taskId, changes) => {
    const id = Number(taskId);

    set((state) => ({
      tasks: groupTasksByStatus(
        flattenTasks(state.tasks).map((task) =>
          Number(task.id) === id ? { ...task, ...changes } : task,
        ),
      ),
    }));
  },

  saveTaskDetails: async (originalTask, draft) => {
    const taskId = Number(originalTask.id);
    const description = draft.description?.trim() || null;
    const notes = (draft.notes ?? [])
      .map((note) => ({
        ...note,
        text: (note.text ?? "").trim(),
        completed: Boolean(note.completed),
      }))
      .filter((note) => note.text);

    await Promise.all([
      invoke("update_task_name", {
        id: taskId,
        updatedTask: draft.name,
      }),
      invoke("update_task_status", { id: taskId, status: draft.status }),
      invoke("set_priority", {
        id: taskId,
        priority: Number(draft.priority),
      }),
      invoke("set_due_date", {
        id: taskId,
        dueDate: draft.due_date ?? null,
      }),
      invoke("set_description", { id: taskId, description }),
    ]);

    const originalNotes = new Map(
      (originalTask.notes ?? []).map((note) => [String(note.id), note]),
    );
    const persistedNotes = notes.filter(
      (note) => typeof note.id === "number",
    );
    const persistedNoteIds = new Set(
      persistedNotes.map((note) => String(note.id)),
    );
    const newNotes = notes.filter((note) => typeof note.id !== "number");

    const createdNotes = await Promise.all(
      newNotes.map((note) =>
        invoke("create_note", {
          taskId,
          description: note.text,
          isCompleted: note.completed,
        }),
      ),
    );

    const updateRequests = persistedNotes
      .filter((note) => {
        const originalNote = originalNotes.get(String(note.id));
        return (
          !originalNote ||
          note.text !== originalNote.text ||
          note.completed !== Boolean(originalNote.completed)
        );
      })
      .map((note) =>
        invoke("update_note", {
          noteId: Number(note.id),
          taskId,
          description: note.text,
          isCompleted: note.completed,
        }),
      );

    const deleteRequests = [...originalNotes.values()]
      .filter(
        (note) =>
          typeof note.id === "number" &&
          !persistedNoteIds.has(String(note.id)),
      )
      .map((note) =>
        invoke("delete_note", {
          noteId: Number(note.id),
          taskId,
        }),
      );

    await Promise.all([...updateRequests, ...deleteRequests]);

    let createdNoteIndex = 0;
    const savedNotes = notes.map((note) => {
      if (typeof note.id === "number") return note;
      return createdNotes[createdNoteIndex++];
    });
    const changes = { ...draft, description, notes: savedNotes };
    const currentTasks = get().tasks;
    const updatedTasks =
      draft.status === originalTask.status
        ? {
            ...currentTasks,
            [draft.status]: currentTasks[draft.status].map((task) =>
              Number(task.id) === taskId
                ? { ...task, ...changes }
                : task,
            ),
          }
        : groupTasksByStatus(
            flattenTasks(currentTasks).map((task) =>
              Number(task.id) === taskId ? { ...task, ...changes } : task,
            ),
          );

    if (draft.status !== originalTask.status) {
      await invoke("update_position", {
        tasks: flattenTasks(updatedTasks),
        boardId: get().currentBoardId,
        includeAll: get().currentIncludeAll,
      });
    }

    set({ tasks: updatedTasks });
    return flattenTasks(updatedTasks).find(
      (task) => Number(task.id) === taskId,
    );
  },


  loadTasks: async (
    boardId = get().currentBoardId,
    includeAll = get().currentIncludeAll,
  ) => {
    const selectedBoardId = boardId ?? null;

    set({
      currentBoardId: selectedBoardId,
      currentIncludeAll: includeAll,
      currentTaskView: "board",
      tasks: createTaskColumns(),
    });

    const tasksFromDB = await invoke("get_tasks", {
      boardId: selectedBoardId,
      includeAll,
    });

    if (
      get().currentTaskView !== "board" ||
      get().currentBoardId !== selectedBoardId ||
      get().currentIncludeAll !== includeAll
    ) {
      return false;
    }

    set({
      tasks: groupTasksByStatus(tasksFromDB),
    });

    return true;
  },

  getTodayTasks: async () => {
    set({
      currentBoardId: null,
      currentIncludeAll: true,
      currentTaskView: "today",
      tasks: createTaskColumns(),
    });

    const tasksFromDB = await invoke("get_today_tasks");

    if (get().currentTaskView !== "today") {
      return false;
    }

    set({
      tasks: groupTasksByStatus(tasksFromDB),
    });

    return true;
  },


  getUpcomingTasks: async () => {
    set({
      currentBoardId: null,
      currentIncludeAll: true,
      currentTaskView: "upcoming",
      tasks: createTaskColumns(),
    });

    const tasksFromDB = await invoke("get_upcoming_tasks");

    if (get().currentTaskView !== "upcoming") {
      return false;
    }

    set({
      tasks: groupTasksByStatus(tasksFromDB),
    });

    return true;
  },

  createTask: async (task) => {
    const name = task.name;
    const status = task.status ?? "todo";
    const priority = task.priority ?? 4;
    const due_date = task.due_date ?? null;
    const description = task.description ?? null;
    const boardId = get().currentBoardId;

    await invoke("create_task", {
      name,
      status,
      priority,
      dueDate: due_date,
      description,
      boardId,
    });

    const activeView = get().currentTaskView;

    if (activeView === "today") {
      await get().getTodayTasks();
    } else if (activeView === "upcoming") {
      await get().getUpcomingTasks();
    } else {
      await get().loadTasks(get().currentBoardId, get().currentIncludeAll);
    }
  },

  moveToTrash: async (taskId) => {
    await invoke("move_to_trash", { id: taskId });

    set((state) => ({
      tasks: Object.fromEntries(
        TASK_STATUSES.map((status) => [
          status,
          state.tasks[status].filter(
            (task) => Number(task.id) !== Number(taskId),
          ),
        ]),
      ),
    }));
  },


  changeTaskStatus: async (taskId, status) => {
    const id = Number(taskId);
    const currentTasks = get().tasks;
    const updatedTasks = moveTaskToColumn(currentTasks, id, status);

    if (updatedTasks === currentTasks) return;

    await invoke("update_task_status", { id, status });
    await invoke("update_position", {
      tasks: flattenTasks(updatedTasks),
      boardId: get().currentBoardId,
      includeAll: get().currentIncludeAll,
    });

    await get().loadTasks();
  },

  setTaskDescription: async (taskId, description) => {
    const id = Number(taskId);
    const nextDescription = description?.trim() || null;

    await invoke("set_description", { id, description: nextDescription });
    get().updateTaskField(id, "description", nextDescription);
  },

  setPriority: async (taskId, priority) => {
    const id = Number(taskId);
    const newPriority = Number(priority);

    await invoke("set_priority", {
      id: id,
      priority: newPriority,
    });

    get().updateTaskField(taskId, "priority", newPriority);
  },

  setDate: async (taskId, newDate) => {
    const id = Number(taskId);
    const dueDate = newDate ?? null;

    await invoke("set_due_date", {
      id,
      dueDate,
    });

    get().updateTaskField(id, "due_date", dueDate);
  },

  updateTaskName: async (taskId, name) => {
    const id = Number(taskId);

    await invoke("update_task_name", {
      id,
      updatedTask: name,
    });

    get().updateTaskField(id, "name", name);
  },

  createNote: async (taskId, description, isCompleted = false) => {
    return invoke("create_note", {
      taskId: Number(taskId),
      isCompleted,
      description,
    });
  },

  updateNote: async (
    noteId,
    taskId,
    description,
    isCompleted = false,
  ) => {
    await invoke("update_note", {
      noteId: Number(noteId),
      taskId: Number(taskId),
      isCompleted,
      description,
    });
  },

  deleteNote: async (noteId, taskId) => {
    await invoke("delete_note", {
      noteId: Number(noteId),
      taskId: Number(taskId),
    });
  },

}));
