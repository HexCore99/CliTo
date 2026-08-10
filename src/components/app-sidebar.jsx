import { NavGeneral } from "@/components/nav-general";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  CalendarDaysIcon,
  ListTodoIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react";

const data = {
  primary: [
    {
      title: "All Tasks",
      type: "general",
      icon: <ListTodoIcon />,
    },
    {
      title: "Today",
      type: "today",
      icon: <SunIcon />,
    },
    {
      title: "Upcoming",
      type: "upcoming",
      icon: <CalendarDaysIcon />,
    },
    {
      title: "Search",
      type: "search",
      icon: <SearchIcon />,
    },
  ],
  utility: [
    {
      title: "Settings",
      type: "settings",
      icon: <SettingsIcon />,
    },
    {
      title: "Trash",
      type: "trash",
      icon: <Trash2Icon />,
    },
  ],
};

export function AppSidebar({
  sidebarConfig,
  onNavItemOpenChange,
  ...props
}) {
  return (
    <Sidebar
      collapsible="icon"
      variant={sidebarConfig?.openAndFloat ? "floating" : "sidebar"}
      {...props}
    >
      <SidebarContent>
        <NavGeneral items={data.primary} className="pt-3" />

        <div className="mx-4 border-t border-sidebar-border" />

        <NavProjects
          navOpenItems={sidebarConfig?.navOpenItems}
          onNavItemOpenChange={onNavItemOpenChange}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <NavGeneral items={data.utility} className="p-0" />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
