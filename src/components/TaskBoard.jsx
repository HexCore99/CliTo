import { DndContext } from "@dnd-kit/core";
import TaskColumn from "./TaskColumn";
import Task from "./Task";
import CreateTask from "./CreateTask";

const columns = [
  { title: "Todo", status: "todo" },
  { title: "In Progress", status: "in-progress" },
  { title: "Completed", status: "completed" },
];

export default function TaskBoard({ tasks, onAdd, onDelete, onDropTask }) {
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    onDropTask(Number(active.id), over.id);
  }
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mt-6 grid grid-cols-3 max-[1050px]:grid-cols-2 max-[620px]:grid-cols-1">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
          >
            {column.status === "todo" && <CreateTask onAdd={onAdd} />}

            {tasks
              .filter((task) => (task.status ?? "todo") === column.status)
              .map((task) => (
                <Task key={task.id} task={task} onDelete={onDelete} />
              ))}
          </TaskColumn>
        ))}
      </div>
    </DndContext>
  );
}
