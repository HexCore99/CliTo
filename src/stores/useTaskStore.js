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

  loadTasks: async (boardId = get().currentBoardId) => {
    const selectedBoardId = boardId ?? null;

    set({
      currentBoardId: selectedBoardId,
      tasks: createTaskColumns(),
    });

    const tasksFromDB = await invoke("get_tasks", {
      boardId: selectedBoardId,
    });

    if (get().currentBoardId !== selectedBoardId) {
      return false;
    }

    set({
      tasks: groupTasksByStatus(tasksFromDB),
    });

    return true;
  },

  createTask: async (task) => {
    const name = task.name;
    const priority = task.priority ?? 4;
    const due_date = task.due_date ?? null;
    const description = task.description ?? null;
    const boardId = get().currentBoardId;

    await invoke("create_task", {
      name: name,
      priority: priority,
      dueDate: due_date,
      description: description,
      boardId,
    });

    await get().loadTasks(boardId);
  },

  move_to_trash: async (taskId) => {
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
  updateTaskStatus: async (taskId, newStatus) => {
    const id = Number(taskId);

    await invoke("update_task_status", {
      id,
      status: newStatus,
    });

    set((state) => ({
      tasks: moveTaskToColumn(state.tasks, id, newStatus),
    }));

    // set((state) => ({
    //   tasks: state.tasks.map((task) =>
    //     task.id === id ? { ...task, status: newStatus } : task,
    //   ),
    // }));
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
    });

    await get().loadTasks();
  },

  set_priority: async (taskId, priority) => {
    const id = Number(taskId);
    const newPriority = Number(priority);

    await invoke("set_priority", {
      id: id,
      priority: newPriority,
    });

    get().updateTaskField(taskId, "priority", newPriority);
  },

  set_date: async (taskId, newDate) => {
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

    await invoke("update_task_desc", {
      id,
      updatedTask: name,
    });

    get().updateTaskField(id, "name", name);
  },
}));
