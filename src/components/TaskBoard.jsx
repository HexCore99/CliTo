import { useState } from "react";
import TaskColumn from "./TaskColumn";
import Task from "./Task";
import CreateTask from "./CreateTask";

const columns = [
  { title: "Todo", status: "todo" },
  { title: "In Progress", status: "in-progress" },
  { title: "Completed", status: "completed" },
];

export default function TaskBoard({ tasks, setTasks, onAdd, onDelete }) {
  return (
    <div className="mt-6 grid grid-cols-3">
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
  );
}
