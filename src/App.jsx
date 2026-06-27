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
import { useTaskStore } from "./stores/useTaskStore";

export default function App() {
  const [uiConfig, setUiConfig] = useState(null);

  const loadTasks = useTaskStore((state) => state.loadTasks);

  async function saveUiConfig(nextConfig) {
    setUiConfig(nextConfig);
    await invoke("save_ui_config", { config: nextConfig });
  }

  useEffect(() => {
    async function loadInitialConfig() {
      const savedUiConfig = await invoke("get_ui_config");
      setUiConfig(savedUiConfig);
    }

    loadTasks();
    loadInitialConfig();
  }, [loadTasks]);

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
          <TaskBoard />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
