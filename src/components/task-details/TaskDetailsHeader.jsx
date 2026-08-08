import { FolderIcon, XIcon } from "lucide-react";

export default function TaskDetailsHeader({
  name,
  breadcrumb,
  onNameChange,
  onClose,
}) {
  return (
    <header className="border-b border-border px-5 py-4">
      <div className="flex items-start gap-3">
        <textarea
          value={name}
          rows={1}
          aria-label="Task title"
          className="min-h-9 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent text-2xl font-semibold leading-tight break-words text-foreground outline-none [field-sizing:content] placeholder:text-muted-foreground"
          placeholder="Untitled task"
          onChange={(event) => onNameChange(event.target.value)}
        />

        <button
          type="button"
          title="Close task details"
          aria-label="Close task details"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onClose}
        >
          <XIcon size={20} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <FolderIcon size={16} />
        {breadcrumb.map((item, index) => (
          <span key={item + index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            <span>{item}</span>
          </span>
        ))}
      </div>
    </header>
  );
}
