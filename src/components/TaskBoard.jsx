import { useEffect, useRef, useState } from "react";
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
import { useBoardStore } from "@/stores/useBoardStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useSortingStore } from "@/stores/useSortingStore";
import TaskColumn from "./TaskColumn";
import Task from "./Task";
import CreateTask from "./CreateTask";
import TaskDetailsPanel from "./task-details/TaskDetailsPanel";

const columns = [
  { title: "Todo", status: "todo" },
  { title: "In Progress", status: "in-progress" },
  { title: "Completed", status: "completed" },
];

function getTaskBreadcrumb(task, projects) {
  if (task.board_id == null) return ["All Tasks"];

  for (const project of projects) {
    const board = project.boards.find(
      (candidate) => Number(candidate.id) === Number(task.board_id),
    );

    if (board) return [project.name, board.name];
  }

  return ["All Tasks"];
}

export default function TaskBoard() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [boardScroll, setBoardScroll] = useState({ left: 0, max: 0 });
  const boardScrollRef = useRef(null);

  const tasks = useTaskStore((state) => state.tasks);
  const currentBoardId = useTaskStore((state) => state.currentBoardId);
  const currentIncludeAll = useTaskStore((state) => state.currentIncludeAll);
  const setTasks = useTaskStore((state) => state.setTasks);
  const createTask = useTaskStore((state) => state.createTask);
  const moveToTrash = useTaskStore((state) => state.move_to_trash);
  const applyTaskDraft = useTaskStore((state) => state.applyTaskDraft);

  const boardState = useBoardStore((state) => state.states);
  const projects = useProjectStore((state) => state.projects);

  const visibleTasks = flattenTasks(tasks);
  const selectedTask = visibleTasks.find(
    (task) => Number(task.id) === Number(selectedTaskId),
  );

  useEffect(() => {
    setSelectedTaskId(null);
  }, [boardState.type, boardState.boardId]);

  useEffect(() => {
    if (selectedTaskId != null && !selectedTask) {
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, selectedTask]);

  useEffect(() => {
    const scroller = boardScrollRef.current;

    if (!scroller || selectedTaskId == null) {
      setBoardScroll({ left: 0, max: 0 });
      return;
    }

    function updateScrollRange() {
      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      setBoardScroll({ left: Math.min(scroller.scrollLeft, max), max });
    }

    const frameId = requestAnimationFrame(updateScrollRange);
    const resizeObserver = new ResizeObserver(updateScrollRange);
    resizeObserver.observe(scroller);

    if (scroller.firstElementChild) {
      resizeObserver.observe(scroller.firstElementChild);
    }

    window.addEventListener("resize", updateScrollRange);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollRange);
    };
  }, [selectedTaskId]);

  function getDropStatus(overId, taskList) {
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
  }

  function getTasksForColumn(status) {
    return tasks[status] ?? [];
  }

  function handleSaveDraft(taskId, changes) {
    applyTaskDraft(taskId, changes);
    setSelectedTaskId(null);
  }

  async function handleDeleteTask(taskId) {
    await moveToTrash(taskId);
    setSelectedTaskId(null);
  }

  const boardGridClassName = selectedTask
    ? "mt-6 grid w-full min-w-[1050px] grid-cols-[repeat(3,minmax(350px,1fr))] max-[1428px]:min-w-[calc(100%+416px)] max-[1428px]:pr-[416px]"
    : "mt-6 grid w-full min-w-[1050px] grid-cols-[repeat(3,minmax(350px,1fr))]";

  const boardScrollClassName = selectedTask
    ? "min-w-0 flex-1 overflow-x-auto max-[1428px]:h-full max-[1428px]:overflow-y-auto max-[1428px]:pb-14"
    : "min-w-0 flex-1 overflow-x-auto";

  const boardContainerClassName = selectedTask
    ? "relative flex w-full overflow-hidden max-[1428px]:h-[calc(100vh-6.5rem)] min-[1429px]:min-h-[calc(100vh-3.5rem)]"
    : "flex min-h-[calc(100vh-3.5rem)] w-full overflow-hidden";

  function handleBoardScroll(event) {
    const scroller = event.currentTarget;
    setBoardScroll((currentScroll) => ({
      ...currentScroll,
      left: scroller.scrollLeft,
    }));
  }

  function handleBoardSliderChange(event) {
    const left = Number(event.target.value);
    boardScrollRef.current?.scrollTo({ left, behavior: "auto" });
    setBoardScroll((currentScroll) => ({ ...currentScroll, left }));
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
      onDragStart={() => setSelectedTaskId(null)}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={boardContainerClassName}>
        <div
          ref={boardScrollRef}
          className={boardScrollClassName}
          onScroll={handleBoardScroll}
        >
          <div className={boardGridClassName}>
            {columns.map((column) => {
              const columnTasks = getTasksForColumn(column.status);

              return (
                <TaskColumn
                  key={column.status}
                  title={column.title}
                  status={column.status}
                >
                  {column.status === "todo" && (
                    <CreateTask onAdd={createTask} />
                  )}

                  <SortableContext
                    items={columnTasks.map((task) => String(task.id))}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <Task
                        key={task.id}
                        task={task}
                        isSelected={Number(selectedTaskId) === Number(task.id)}
                        onOpenDetails={setSelectedTaskId}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </SortableContext>
                </TaskColumn>
              );
            })}
          </div>
        </div>

        {/* {selectedTask && boardScroll.max > 0 && (
          <div className="absolute right-[424px] bottom-3 left-4 z-40 flex items-center rounded-full border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur min-[1429px]:hidden">
            <input
              type="range"
              min="0"
              max={boardScroll.max}
              step="1"
              value={Math.min(boardScroll.left, boardScroll.max)}
              aria-label="Scroll task columns horizontally"
              className="h-2 w-full cursor-ew-resize accent-orange-500"
              onChange={handleBoardSliderChange}
            />
          </div>
        )}*/}

        {selectedTask && (
          <TaskDetailsPanel
            task={selectedTask}
            breadcrumb={getTaskBreadcrumb(selectedTask, projects)}
            onClose={() => setSelectedTaskId(null)}
            onDelete={handleDeleteTask}
            onSave={handleSaveDraft}
          />
        )}
      </div>
    </DndContext>
  );
}
