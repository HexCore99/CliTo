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
import { useSortingStore } from "./stores/useSortingStore";
import { useBoardStore } from "./stores/useBoardStore";
import {useTrashStore} from "./stores/useTrashStore"
import TrashBoard from "./components/TrashBoard";
import { useProjectStore } from "./stores/useProjectStore";

export default function App() {
  const [uiConfig, setUiConfig] = useState(null);

  const loadTasks = useTaskStore((state) => state.loadTasks);
  const boardState = useBoardStore((state) => state.states);
  const loadProjects = useProjectStore((state) => state.loadProjects);

  const loadInitialSorting = useSortingStore(
    (state) => state.loadInitialSorting,
  );
  const applyCurrentSorting = useSortingStore(
    (state) => state.applyCurrentSorting,
  );

  async function saveUiConfig(nextConfig) {
    setUiConfig(nextConfig);
    await invoke("save_ui_config", { config: nextConfig });
  }

  useEffect(() => {
    async function loadInitialConfig() {
      const savedUiConfig = await invoke("get_ui_config");
      setUiConfig(savedUiConfig);
    }
    loadProjects();

    loadInitialConfig();
    loadInitialSorting();
  }, [loadProjects, loadInitialSorting]);

  useEffect(() => {
    if (boardState.type === "trash") return;

    const boardId = boardState.type === "board" ? boardState.boardId : null;

    async function loadSelectedBoard() {
      const loaded = await loadTasks(boardId);

      if (loaded) {
        await applyCurrentSorting(boardId);
      }
    }

    loadSelectedBoard();
  }, [
    boardState.type,
    boardState.boardId,
    loadTasks,
    applyCurrentSorting,
  ]);

  function setSidebarOpen(open) {
    saveUiConfig({
      ...uiConfig,
      sidebar: {
        ...uiConfig.sidebar,
        open: open,
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
        <AppSidebar sidebarConfig={uiConfig.sidebar} />

        <SidebarInset>
          <header className="flex h-14 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <span className="font-medium">{boardState.title}</span>
          </header>

          <main className="p-6"></main>

          {boardState.type === "trash" ? <TrashBoard /> : <TaskBoard />}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
