import { useDroppable } from "@dnd-kit/core";

export default function TaskColumn({ title, status, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      className={`min-h-[calc(100vh-10rem)] border-r border-gray-200 px-6 last:border-r-0 ${isOver ? "bg-blue-50" : ""}`}
    >
      <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold">
        {title}
      </h3>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
