import { useState } from "react";

export default function CreateTask({ onAdd }) {
  const [taskName, setTaskName] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    const task = {
      id: Date.now(),
      name: taskName,
    };

    onAdd(task);
    setTaskName("");
  }

  return (
    <form onSubmit={handleAdd} className="flex justify-between gap-5">
      <input
        type="text"
        placeholder="Enter task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="w-full h-10 px-5 py-5 outline-none focus:ring-2 focus:ring-gray-300 bg-slate-200 backdrop-blur-md rounded-4xl"
      />
      <button className="bg-amber-500 w-fit h-10 px-5 py-2  rounded-2xl hover:bg-amber-600 hover:cursor-pointer hover:shadow-2xl ">
        Add
      </button>
    </form>
  );
}
