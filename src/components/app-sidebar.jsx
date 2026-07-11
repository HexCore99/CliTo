import { NavGeneral } from "@/components/nav-general";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ListIcon, Trash2Icon } from "lucide-react";

const data = {
  general: [
    {
      title: "All",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "Trash",
      url: "#",
      icon: <Trash2Icon />,
    },
  ],
};

export function AppSidebar({ sidebarConfig, ...props }) {
  return (
    <Sidebar
      collapsible="icon"
      variant={sidebarConfig?.openAndFloat ? "floating" : "sidebar"}
      {...props}
    >
      <SidebarContent>
        <NavGeneral items={data.general} />
        <NavProjects />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
