"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
} from "lucide-react";

// This is sample data.
const data = {
  user: {
    name: "HExEN",
    email: "hexen@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "TODO App",
      logo: <GalleryVerticalEndIcon />,
      plan: "Personal",
    },
  ],
  navMain: [
    {
      title: "Tasks",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Todo",
          url: "#",
        },
        {
          title: "In Progress",
          url: "#",
        },
        {
          title: "Completed",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Coming Soon",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Coming Soon",
      url: "#",
      icon: <FrameIcon />,
    },
  ],
};

export function AppSidebar({ sidebarConfig, onNavItemOpenChange, ...props }) {
  return (
    <Sidebar
      collapsible="icon"
      variant={sidebarConfig?.openAndFloat ? "floating" : "sidebar"}
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          openItems={sidebarConfig?.navOpenItems ?? {}}
          onOpenItemChange={onNavItemOpenChange}
        />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
