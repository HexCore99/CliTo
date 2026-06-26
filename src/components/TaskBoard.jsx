import { DndContext, closestCorners } from "@dnd-kit/core";
import { invoke } from "@tauri-apps/api/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import TaskColumn from "./TaskColumn";
import Task from "./Task";
import CreateTask from "./CreateTask";

const columns = [
  { title: "Todo", status: "todo" },
  { title: "In Progress", status: "in-progress" },
  { title: "Completed", status: "completed" },
];

export default function TaskBoard({ tasks, setTasks, onAdd, onDelete }) {
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
      const nextStatus = getDropStatus(overId, currentTasks);
      if (!nextStatus) return currentTasks;

      return currentTasks.map((task) => {
        return String(task.id) === activeTaskId
          ? { ...task, status: nextStatus }
          : task;
      });
    });
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = String(active.id);
    const activeOverId = String(over.id);

    const nextStatus = getDropStatus(activeOverId, tasks);
    if (!nextStatus) return;

    const oldIdx = tasks.findIndex((task) => String(task.id) === activeTaskId);
    const newIdx = tasks.findIndex((task) => String(task.id) === activeOverId);
    let reorderedTasks = tasks;
    if (newIdx !== -1) reorderedTasks = arrayMove(tasks, oldIdx, newIdx);

    setTasks(reorderedTasks);
    await invoke("update_position", { tasks: reorderedTasks });
    await invoke("update_task_status", {
      id: Number(activeTaskId),
      status: nextStatus,
    });
  }

  function getTasksForColumn(status) {
    return tasks.filter((task) => {
      return (task.status ?? "todo") === status;
    });
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
              {column.status === "todo" && <CreateTask onAdd={onAdd} />}

              <SortableContext
                items={columnTasks.map((task) => String(task.id))}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <Task key={task.id} task={task} onDelete={onDelete} />
                ))}
              </SortableContext>
            </TaskColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
