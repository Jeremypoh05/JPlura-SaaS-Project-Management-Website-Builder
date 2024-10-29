'use client';

import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/providers/sidebar-provider";
import { Role } from "@prisma/client";

type LayoutClientProps = {
  children: React.ReactNode;
  notifications: any[];
  userRole: Role;
  subAccountId: string;
};

const LayoutClient = ({ children, notifications, userRole, subAccountId }: LayoutClientProps) => {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={subAccountId} type="subaccount" />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:pl-[60px]" : "md:pl-[260px]"
        )}
      >
        <InfoBar
          notifications={notifications}
          role={userRole}
          subAccountId={subAccountId}
        />
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutClient;