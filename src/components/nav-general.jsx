import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useBoardStore } from "@/stores/useBoardStore";

export function NavGeneral({ items }) {
  const setBoardState = useBoardStore((state) => state.set_state);
  const boardState = useBoardStore((state) => state.states);

  function handleOnClick(event, item) {
    event.preventDefault();

    setBoardState({
      type: item.title === "Trash" ? "trash" : "general",
      projectId: null,
      boardId: null,
      title: item.title,
    });
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        
        <div className="space-y-2 flex-col ">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`cursor-pointer transition-colors hover:bg-slate-300!
                  ${boardState.title === item.title ? "bg-sky-500!" : ""}`}
              >
                <a
                  href={item.url}
                  onClick={(event) => handleOnClick(event, item)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      </SidebarMenu>
    </SidebarGroup>
  );
}
