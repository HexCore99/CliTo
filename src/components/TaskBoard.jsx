import { DndContext } from "@dnd-kit/core";
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
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIdx = tasks.findIndex((task) => String(task.id) === active.id);
    const newIdx = tasks.findIndex((task) => String(task.id) === over.id);
    const reorderedTasks = arrayMove(tasks, oldIdx, newIdx);

    setTasks([...reorderedTasks]);
    console.log(" id is what? ", active.id);
    console.log(newIdx);
    invoke("update_position", { tasks: reorderedTasks });
  }

  return (
    <DndContext modifiers={[restrictToWindowEdges]} onDragEnd={handleDragEnd}>
      <div className="mt-6 grid grid-cols-3 max-[1050px]:grid-cols-2 max-[620px]:grid-cols-1">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
          >
            {column.status === "todo" && <CreateTask onAdd={onAdd} />}

            <SortableContext
              items={tasks.map((t) => String(t.id))}
              strategy={verticalListSortingStrategy}
            >
              {tasks
                .filter((task) => (task.status ?? "todo") === column.status)
                .map((task) => (
                  <Task key={task.id} task={task} onDelete={onDelete} />
                ))}
            </SortableContext>
          </TaskColumn>
        ))}
      </div>
    </DndContext>
  );
}
