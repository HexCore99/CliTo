import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import TaskBoard from "./components/TaskBoard";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [uiConfig, setUiConfig] = useState(null);

  async function onDelete(taskId) {
    await invoke("delete_task", { id: taskId });
    setTasks(tasks.filter((task) => task.id !== taskId));
  }
  async function createTask(task) {
    const name = await invoke("create_task", { name: task.name });
    setTasks([...tasks, task]);
  }

  async function saveUiConfig(nextConfig) {
    setUiConfig(nextConfig);
    await invoke("save_ui_config", { config: nextConfig });
  }

  async function moveTask(taskId, status) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    );

    await invoke("update_task_status", { id: taskId, status });
  }
  function setSidebarOpen(open) {
    saveUiConfig({
      ...uiConfig,
      sidebar: {
        ...uiConfig.sidebar,
        open: open,
      },
    });
  }

  function setNavItemOpen(title, open) {
    saveUiConfig({
      ...uiConfig,
      sidebar: {
        ...uiConfig.sidebar,
        navOpenItems: {
          ...uiConfig.sidebar.navOpenItems,
          [title]: open,
        },
      },
    });
  }

  useEffect(() => {
    async function loadInitialTasks() {
      const savedTasks = await invoke("get_tasks");
      setTasks(savedTasks);
    }

    async function loadInitialConfig() {
      const savedUiConfig = await invoke("get_ui_config");
      setUiConfig(savedUiConfig);
    }

    loadInitialTasks();
    loadInitialConfig();
  }, []);

  if (!uiConfig) return null;

  return (
    <TooltipProvider>
      <SidebarProvider
        open={uiConfig.sidebar.open}
        onOpenChange={setSidebarOpen}
      >
        <AppSidebar
          sidebarConfig={uiConfig.sidebar}
          onNavItemOpenChange={setNavItemOpen}
        />

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
          </main>
          <TaskBoard
            tasks={tasks}
            setTasks={setTasks}
            onAdd={createTask}
            onDelete={onDelete}
            onDropTask={moveTask}
          />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
