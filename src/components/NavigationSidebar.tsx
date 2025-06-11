"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  HomeIcon,
  LibraryIcon,
  FlameIcon,
  Currency,
  User2Icon,
  HeartIcon,
  FormInputIcon,
  FileIcon,
} from "lucide-react";
import { SidebarNavLink } from "./SidebarNavLink";
import { Roles } from "../../types/globals";

const candidateItems = [
  { title: "My Profile", href: "/profile", icon: User2Icon },
  { title: "My Resume", href: "/resume", icon: FormInputIcon },
  { title: "My Job Applications", href: "/applications", icon: FormInputIcon },
  { title: "Favorite Jobs", href: "/favorites", icon: FileIcon },
  { title: "All Candidates", href: "/candidates", icon: FileIcon },
  { title: "All Jobs", href: "/jobs", icon: HeartIcon },
  { title: "All Companies", href: "/companies", icon: FileIcon },
  { title: "Jobs Analytics", href: "/analysis/jobs", icon: FileIcon },
];

const companyItems = [
  { title: "My Profile", href: "/profile", icon: LibraryIcon },
  { title: "New Job", href: "/jobs/create", icon: FlameIcon },
  { title: "Favorite Candidates", href: "/favorites", icon: Currency },
  { title: "My Job Applications", href: "/applications", icon: FlameIcon },
  { title: "All Candidates", href: "/candidates", icon: FileIcon },
  { title: "All Jobs", href: "/jobs", icon: HeartIcon },
  { title: "All Companies", href: "/companies", icon: FileIcon },
  { title: "Candidate Analytics", href: "/analysis/candidates", icon: FileIcon },
];

const defaultItems = [
  { title: "Home", href: "/", icon: HomeIcon },
  { title: "About", href: "/about", icon: LibraryIcon },
  { title: "Services", href: "/services", icon: FlameIcon },
  { title: "Partnerships & Media", href: "/partnership-media", icon: FlameIcon },
  { title: "Pricing Plan", href: "/pricing-plan", icon: Currency },
  { title: "Contact", href: "/contact", icon: FlameIcon },
];

export const NavigationSidebar = ({ role, userId }: { role?: Roles; userId?: string }) => {
  return (
    <Sidebar className="pt-16 z-40 border-none bg-white!" collapsible="icon">
      <SidebarContent>
        {role === "CANDIDATE" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {candidateItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarNavLink {...item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!userId && (
          <>
            <Separator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {defaultItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarNavLink {...item} />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {role === "COMPANY" && (
          <>
            <Separator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {companyItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarNavLink {...item} />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
};