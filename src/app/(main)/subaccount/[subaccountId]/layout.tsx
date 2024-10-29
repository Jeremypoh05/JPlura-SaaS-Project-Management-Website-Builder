import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/providers/sidebar-provider";
import { currentUser } from "@clerk/nextjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React, { createContext } from "react";
import LayoutClient from "./layout-client";
import SidebarToggle from "@/components/sidebar/sidebar-toggle";

type Props = {
  children: React.ReactNode;
  params: { subaccountId: string };
};

const SubaccountLayout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) return <Unauthorized />;
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }

  let notifications: any = [];

  //if they don't have any role, return
  if (!user.privateMetadata.role) {
    return <Unauthorized />;
  } else {
    //if yes, check their auth details and whether they have permission or not
    const allPermissions = await getAuthUserDetails();
    const hasPermission = allPermissions?.Permissions.find(
      (permissions) =>
        //check if permission is true and the permissions.subAccount Id is equal to the current params id from the Url.
        permissions.access && permissions.subAccountId === params.subaccountId
    );
    if (!hasPermission) {
      return <Unauthorized />;
    }

    const allNotifications = await getNotificationAndUser(agencyId);

    //if we are admin or owner, we can filter the notifications based on the current subaccount.
    if (
      user.privateMetadata.role === "AGENCY_ADMIN" ||
      user.privateMetadata.role === "AGENCY_OWNER"
    ) {
      notifications = allNotifications;
    } else {
      const filteredNoti = allNotifications?.filter(
        (item) => item.subAccountId === params.subaccountId
      );
      if (filteredNoti) notifications = filteredNoti;
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.subaccountId} type="subaccount" />
      <SidebarToggle>
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          subAccountId={params.subaccountId as string}
        />
        <div className="relative -ml-1">
          {children}
        </div>
      </SidebarToggle>
    </div>
  );
};

export default SubaccountLayout;
