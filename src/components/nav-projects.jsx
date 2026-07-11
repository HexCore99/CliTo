import { useState } from "react";
import {
  ChevronRightIcon,
  FolderIcon,
  LayoutDashboardIcon,
  PlusIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useProjectStore } from "@/stores/useProjectStore";
import { useBoardStore } from "@/stores/useBoardStore";

export function NavProjects() {
  const projects = useProjectStore((state) => state.projects);
  const error = useProjectStore((state) => state.error);
  const createProject = useProjectStore((state) => state.createProject);
  const createBoard = useProjectStore((state) => state.createBoard);
  const clearError = useProjectStore((state) => state.clearError);
  const boardState = useBoardStore((state) => state.states);
  const setBoardState = useBoardStore((state) => state.set_state);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [creatingBoardFor, setCreatingBoardFor] = useState(null);
  const [boardName, setBoardName] = useState("");

  async function handleCreateProject(event) {
    event.preventDefault();
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    try {
      await createProject(trimmedName);
      setProjectName("");
      setIsCreatingProject(false);
    } catch {
      // The store already exposes the backend error.
    }
  }

  async function handleCreateBoard(event, projectId) {
    event.preventDefault();
    const trimmedName = boardName.trim();
    if (!trimmedName) return;

    try {
      await createBoard(projectId, trimmedName);
      setBoardName("");
      setCreatingBoardFor(null);
    } catch {
      // The store already exposes the backend error.
    }
  }

  function beginCreatingProject() {
    clearError();
    setProjectName("");
    setIsCreatingProject(true);
  }

  function beginCreatingBoard(event, projectId) {
    event.preventDefault();
    event.stopPropagation();
    clearError();
    setBoardName("");
    setCreatingBoardFor(projectId);
  }

  function handleBoardClick(event, project, board) {
    event.preventDefault();

    setBoardState({
      type: "board",
      projectId: project.id,
      boardId: board.id,
      title: board.name,
    });
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>

      <SidebarGroupAction
        type="button"
        title="Create project"
        aria-label="Create project"
        onClick={beginCreatingProject}
      >
        <PlusIcon />
      </SidebarGroupAction>

      <SidebarMenu>
        {isCreatingProject && (
          <SidebarMenuItem className="mb-2">
            <form onSubmit={handleCreateProject}>
              <input
                autoFocus
                type="text"
                value={projectName}
                placeholder="Project name"
                onChange={(event) => setProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setProjectName("");
                    setIsCreatingProject(false);
                    clearError();
                  }
                }}
                className="h-8 w-full rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </form>
          </SidebarMenuItem>
        )}

        {projects.map((project) => (
          <Collapsible
            key={project.id}
            asChild
            defaultOpen
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={project.name}>
                  <ChevronRightIcon className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  <FolderIcon />
                  <span>{project.name}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <SidebarMenuAction
                type="button"
                showOnHover
                title={`Create board in ${project.name}`}
                aria-label={`Create board in ${project.name}`}
                onClick={(event) => beginCreatingBoard(event, project.id)}
              >
                <PlusIcon />
              </SidebarMenuAction>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {project.boards.map((board) => (
                    <SidebarMenuSubItem key={board.id}>
                      <SidebarMenuSubButton
                        href="#"
                        isActive={
                          boardState.type === "board" &&
                          boardState.boardId === board.id
                        }
                        onClick={(event) =>
                          handleBoardClick(event, project, board)
                        }
                      >
                        <LayoutDashboardIcon />
                        <span>{board.name}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}

                  {creatingBoardFor === project.id && (
                    <SidebarMenuSubItem>
                      <form
                        onSubmit={(event) =>
                          handleCreateBoard(event, project.id)
                        }
                      >
                        <input
                          autoFocus
                          type="text"
                          value={boardName}
                          placeholder="Board name"
                          onChange={(event) => setBoardName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setBoardName("");
                              setCreatingBoardFor(null);
                              clearError();
                            }
                          }}
                          className="h-7 w-full rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                        />
                      </form>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>

      {error && <p className="mt-2 px-2 text-xs text-destructive">{error}</p>}
    </SidebarGroup>
  );
}
