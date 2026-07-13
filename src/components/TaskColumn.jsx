import { useDroppable } from "@dnd-kit/core";
import Sorting from "./ui/Sorting";

export default function TaskColumn({ title, status, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[calc(100vh-10rem)] w-full min-w-[350px] border-r border-gray-200 px-6 last:border-r-0 ${isOver ? "bg-blue-50" : ""}`}
    >
      <h3 className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2 text-lg font-semibold">
        {title}
        <Sorting columnName={status} />
      </h3>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
