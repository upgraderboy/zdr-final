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
import { trpc } from "@/trpc/client"; // Adjust if your path is different
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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

const defaultItems = [
  { title: "Home", href: "/", icon: HomeIcon },
  { title: "About", href: "/about", icon: LibraryIcon },
  { title: "Services", href: "/services", icon: FlameIcon },
  { title: "Partnerships & Media", href: "/partnership-media", icon: FlameIcon },
  { title: "Pricing Plan", href: "/pricing-plan", icon: Currency },
  { title: "Contact", href: "/contact", icon: FlameIcon },
];

export const NavigationSidebar = ({ role, userId }: { role?: Roles; userId?: string }) => {
  const { data: company, isLoading } = trpc.companies.getProfile.useQuery(undefined, {
    enabled: role === "COMPANY",
  });
  const pathname = usePathname();
  const isCompanyProfilePage = /^\/companies\/[^/]+$/.test(pathname);
  // While loading company data
  if (role === "COMPANY" && isLoading) return null;

  const companyItems = [
    {
      title: "My Profile",
      href: company ? `/companies/${company.id}` : "/profile",
      icon: LibraryIcon,
    },

    { title: "Favorite Candidates", href: "/favorites", icon: Currency },
    { title: "My Job Applications", href: "/applications", icon: FlameIcon },
    { title: "All Candidates", href: "/candidates", icon: FileIcon },
    { title: "All Jobs", href: "/jobs", icon: HeartIcon },
    { title: "All Companies", href: "/companies", icon: FileIcon },
    { title: "Candidate Analytics", href: "/analysis/candidates", icon: FileIcon },
  ];

  return (
    <Sidebar className={cn("pt-16 z-40 border-none", isCompanyProfilePage && "justify-center items-center flex")} collapsible="icon">
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

        {role === "COMPANY" && company && (
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
