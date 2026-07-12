import { DndContext, closestCorners } from "@dnd-kit/core";
import { invoke } from "@tauri-apps/api/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  flattenTasks,
  groupTasksByStatus,
  useTaskStore,
} from "@/stores/useTaskStore";
import TaskColumn from "./TaskColumn";
import Task from "./Task";
import CreateTask from "./CreateTask";
import { useSortingStore } from "@/stores/useSortingStore";

const columns = [
  { title: "Todo", status: "todo" },
  { title: "In Progress", status: "in-progress" },
  { title: "Completed", status: "completed" },
];

export default function TaskBoard() {
  const tasks = useTaskStore((state) => state.tasks);
  const currentBoardId = useTaskStore((state) => state.currentBoardId);
  const currentIncludeAll = useTaskStore((state) => state.currentIncludeAll);

  const setTasks = useTaskStore((state) => state.setTasks);

  const createTask = useTaskStore((state) => state.createTask);

  const move_to_trash = useTaskStore((state) => state.move_to_trash);

  function getDropStatus(overId, taskList) {
    //can be task or column

    const column = columns.find((column) => column.status === overId);
    if (column) return column.status;

    const targetTask = taskList.find((task) => String(task.id) === overId);
    if (!targetTask) return null;

    return targetTask.status ?? "todo";
  }

  function handleDragOver(event) {
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    setTasks((currentTasks) => {
      const currentTaskList = flattenTasks(currentTasks);
      const nextStatus = getDropStatus(overId, currentTaskList);
      if (!nextStatus) return currentTasks;

      const activeTask = currentTaskList.find(
        (task) => String(task.id) === activeTaskId,
      );

      if (!activeTask || activeTask.status === nextStatus) {
        return currentTasks;
      }

      const updatedTasks = currentTaskList.map((task) => {
        return String(task.id) === activeTaskId
          ? { ...task, status: nextStatus }
          : task;
      });

      return groupTasksByStatus(updatedTasks);
    });
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = String(active.id);
    const activeOverId = String(over.id);
    const taskList = flattenTasks(tasks);

    const activeTask = taskList.find(
      (task) => String(task.id) === activeTaskId,
    );
    if (!activeTask) return;

    const previousStatus = activeTask.status;

    const nextStatus = getDropStatus(activeOverId, taskList);
    if (!nextStatus) return;

    const statusUpdatedTasks = taskList.map((task) =>
      String(task.id) === activeTaskId ? { ...task, status: nextStatus } : task,
    );
    const oldIdx = statusUpdatedTasks.findIndex(
      (task) => String(task.id) === activeTaskId,
    );
    const newIdx = statusUpdatedTasks.findIndex(
      (task) => String(task.id) === activeOverId,
    );
    let reorderedTasks = statusUpdatedTasks;

    if (oldIdx !== -1 && newIdx !== -1) {
      reorderedTasks = arrayMove(statusUpdatedTasks, oldIdx, newIdx);
    }

    const tasksByStatus = groupTasksByStatus(reorderedTasks);
    const tasksToPersist = flattenTasks(tasksByStatus);

    setTasks(tasksByStatus);
    await invoke("update_position", {
      tasks: tasksToPersist,
      boardId: currentBoardId,
      includeAll: currentIncludeAll,
    });
    await invoke("update_task_status", {
      id: Number(activeTaskId),
      status: nextStatus,
    });

    const { sortOptions, sortColumn } = useSortingStore.getState();
    const columnsToReSort = new Set([previousStatus, nextStatus]);

    for (const colStat of columnsToReSort) {
      const sortOption = sortOptions[colStat];
      if (sortOption && sortOption !== "default") {
        await sortColumn(colStat, sortOption);
      }
    }

    // on changing column, i want to initiate sort for both columns. should i do it from here?
  }

  function getTasksForColumn(status) {
    return tasks[status] ?? [];
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="mt-6 grid grid-cols-3 max-[1050px]:grid-cols-2 max-[620px]:grid-cols-1">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.status);
          return (
            <TaskColumn
              key={column.status}
              title={column.title}
              status={column.status}
            >
              {column.status === "todo" && <CreateTask onAdd={createTask} />}

              <SortableContext
                items={columnTasks.map((task) => String(task.id))}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <Task key={task.id} task={task} onDelete={move_to_trash} />
                ))}
              </SortableContext>
            </TaskColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
