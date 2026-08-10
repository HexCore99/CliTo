import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import TaskBoard from "./components/TaskBoard";
import { useEffect, useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTaskStore } from "./stores/useTaskStore";
import { useSortingStore } from "./stores/useSortingStore";
import { useBoardStore } from "./stores/useBoardStore";
import {useTrashStore} from "./stores/useTrashStore"
import TrashBoard from "./components/TrashBoard";
import { useProjectStore } from "./stores/useProjectStore";
import Settings from "./Settings";
import SearchBoard from "./components/SearchBoard";

export default function App() {
  const [uiConfig, setUiConfig] = useState(null);

  const loadTasks = useTaskStore((state) => state.loadTasks);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);
  const getUpcomingTasks = useTaskStore((state) => state.getUpcomingTasks);
  const getSearchTasks = useTaskStore((state) => state.getSearchTasks);
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

  const selectedTheme = uiConfig?.appearance?.theme ?? "system";

  useLayoutEffect(() => {
    if (!uiConfig) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isDark =
        selectedTheme === "dark" ||
        (selectedTheme === "system" && mediaQuery.matches);

      document.documentElement.classList.toggle("dark", isDark);
    };

    applyTheme();

    if (selectedTheme !== "system") return undefined;

    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [selectedTheme, uiConfig]);

  useEffect(() => {
    if (boardState.type === "trash" || boardState.type === "settings") return;

    if (boardState.type === "today") {
      getTodayTasks();
      return;
    }

    if (boardState.type === "upcoming") {
      getUpcomingTasks();
      return;
    }

    if (boardState.type === "search") {
      getSearchTasks();
      return;
    }

    const boardId = boardState.type === "board" ? boardState.boardId : null;
    const includeAll = boardState.type === "general";

    async function loadSelectedBoard() {
      const loaded = await loadTasks(boardId, includeAll);

      if (loaded) {
        await applyCurrentSorting(boardId, includeAll);
      }
    }

    loadSelectedBoard();
  }, [
    boardState.type,
    boardState.boardId,
    loadTasks,
    getTodayTasks,
    getUpcomingTasks,
    getSearchTasks,
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

  function setNavItemOpen(itemKey, open) {
    saveUiConfig({
      ...uiConfig,
      sidebar: {
        ...uiConfig.sidebar,
        navOpenItems: {
          ...uiConfig.sidebar.navOpenItems,
          [itemKey]: open,
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
            <span className="font-medium">{boardState.title}</span>
          </header>

          <main className="p-6"></main>

          {boardState.type === "settings" ? (
            <Settings config={uiConfig} onConfigChange={saveUiConfig} />
          ) : boardState.type === "trash" ? (
            <TrashBoard />
          ) : boardState.type === "search" ? (
            <SearchBoard />
          ) : (
            <TaskBoard defaultTaskPriority={uiConfig.taskDefaults.priority} />
          )}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
