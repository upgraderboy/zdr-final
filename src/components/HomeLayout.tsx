// components/HomeLayout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { HomeNavBar } from "./HomeNavBar";
import { NavigationSidebar } from "./NavigationSidebar";
import Footer from "./Footer";
import { Roles } from "../../types/globals";

interface HomeLayoutProps {
  children: ReactNode;
  role?: Roles;
  userId?: string;
}

export const HomeLayout = ({ children, role, userId }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Nav */}
        <HomeNavBar role={role} />

        {/* Main Content + Sidebar */}
        <div className="flex flex-1">
          {
            userId && (
              <NavigationSidebar role={role} userId={userId} />
            )
          }

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto my-10">
            {children}
          </main>
        </div>

        {/* Footer always at bottom */}
        <Footer />
      </div>
    </SidebarProvider>
  );
};