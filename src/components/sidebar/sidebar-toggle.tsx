// components/sidebar/sidebar-toggle.tsx
"use client";

import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/providers/sidebar-provider";
import React from "react";

const SidebarToggle = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebarContext();

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isCollapsed ? "md:pl-[60px]" : "md:pl-[260px]"
      )}
    >
      {children}
    </div>
  );
};

export default SidebarToggle;
