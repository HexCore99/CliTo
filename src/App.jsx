import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Task from "./components/Task";
import CreateTask from "./components/CreateTask";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function App() {
  const [tasks, setTasks] = useState([]);

  async function onDelete(taskId) {
    console.log("creating task");
    console.log(taskId);
    await invoke("delete_task", { id: taskId });
    setTasks(tasks.filter((task) => task.id !== taskId));
  }
  async function createTask(task) {
    const name = await invoke("create_task", { name: task.name });
    setTasks([...tasks, task]);
  }
  console.log(tasks);

  useEffect(() => {
    async function loadTasks() {
      const savedTasks = await invoke("get_tasks");
      setTasks(savedTasks);
    }
    loadTasks();
  }, []);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <header className="flex h-14 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-sm font-medium">Todo</h1>
          </header>

          <main className="p-6">
            <h2 className="text-2xl font-bold tracking-tight">Todo App</h2>
            <p className="text-muted-foreground">
              Your task manager content will go here.
            </p>
            <div className="flex-col space-y-4">
              <CreateTask onAdd={createTask} />
              {tasks.map((task) => (
                <Task key={task.id} task={task} onDelete={onDelete} />
              ))}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
