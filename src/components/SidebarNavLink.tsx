"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // If you have a className utility
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavLinkProps {
  href: string;
  title: string;
  icon: React.ElementType;
  onClick?: () => void;
}

export const SidebarNavLink = ({ href, title, icon: Icon, onClick }: SidebarNavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <SidebarMenuButton tooltip={title} asChild isActive={isActive} onClick={onClick}>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-4 w-full px-3 py-2 rounded-md transition",
          isActive
            ? "underline not-last:bg-muted text-primary font-semibold"
            : "hover:bg-muted/50"
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm">{title}</span>
      </Link>
    </SidebarMenuButton>
  );
};