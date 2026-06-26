import { useDroppable } from "@dnd-kit/core";

export default function TaskColumn({ title, status, onDropTask, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event) {
    event.preventDefault();

    const taskId = Number(event.dataTransfer.getData("taskId"));
    onDropTask(taskId, status);
  }

  return (
    <section
      ref={setNodeRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`min-h-[calc(100vh-10rem)] border-r border-gray-200 px-6 last:border-r-0 ${isOver ? "bg-blue-50" : ""}`}
    >
      <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold">
        {title}
      </h3>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
