import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useBoardStore } from "@/stores/useBoardStore";

export function NavGeneral({ items, className }) {
  const setBoardState = useBoardStore((state) => state.set_state);
  const boardState = useBoardStore((state) => state.states);

  function handleOnClick(item) {
    if (item.disabled || !item.type) return;

    setBoardState({
      type: item.type,
      projectId: null,
      boardId: null,
      title: item.title,
    });
  }

  return (
    <SidebarGroup className={className}>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isActive = item.type && boardState.type === item.type;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                type="button"
                tooltip={item.title}
                isActive={Boolean(isActive)}
                disabled={item.disabled}
                title={item.disabled ? `${item.title} is coming soon` : undefined}
                className="h-10 cursor-pointer px-3 data-[active=true]:bg-orange-50! data-[active=true]:text-orange-600! data-[active=true]:hover:bg-orange-50! data-[active=true]:hover:text-orange-600! dark:data-[active=true]:bg-orange-950/40! dark:data-[active=true]:text-orange-300! dark:data-[active=true]:hover:bg-orange-950/40! dark:data-[active=true]:hover:text-orange-300! disabled:cursor-not-allowed"
                onClick={() => handleOnClick(item)}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
