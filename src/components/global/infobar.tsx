"use client";

import { NotificationWithUser, UserWithAgency } from "@/lib/types";
import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Bell } from "lucide-react";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Role } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ModeToggle } from "./mode-toggle";
import CustomSignOutButton from "./custom-sign-out";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { useSidebarContext } from "@/providers/sidebar-provider";
import { getAuthUserDetails, updateNotificationsAsRead } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { toast } from "../ui/use-toast";

type Props = {
  notifications: NotificationWithUser | [];
  role?: Role;
  className?: string;
  subAccountId?: string;
};

const InfoBar = ({ notifications, role, className, subAccountId }: Props) => {
  const { isCollapsed } = useSidebarContext();
  const [allNotifications, setAllNotifications] = useState(notifications);
  const [showAll, setShowAll] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserWithAgency | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    new Set()
  );

  const handleClick = () => {
    //if showAll is false, then we click and pass all notifications(because the condition match with !showAll)
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      // the function filters the original notifications array based on the subAccountId prop. It sets allNotifications to this filtered array.
      //If there are no notifications for the current subaccount, an empty array is set.
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => {
            // First check if this is an assigned ticket notification
            // This helps us properly identify ticket assignments regardless of subaccount
            const isAssignedTicket =
              item.notification.includes("has assigned ticket:") &&
              item.ticketId;

            // Include notifications that either:
            // 1. Belong to the current subaccount directly
            // 2. OR are ticket assignments for the current subaccount
            // The order of evaluation ensures we catch all relevant notifications
            return (
              item.subAccountId === subAccountId ||
              (isAssignedTicket && item.subAccountId === subAccountId)
            );
          }) ?? []
        );
      }
    }
    // the function toggles the value of showAll by negating its previous value using the ! operator. 
    //This ensures that the next time handleClick is invoked, it will perform the opposite action.
    setShowAll((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = await getAuthUserDetails();
      setCurrentUser(user);

      if (user) {
        // 1. Get previously read notifications from localStorage
        const storedReadNotifications = localStorage.getItem(
          `readNotifications_${user.id}`
        );
        const readNotificationSet = storedReadNotifications
          ? new Set<string>(JSON.parse(storedReadNotifications))
          : new Set<string>();
        setReadNotifications(readNotificationSet);

        if (notifications?.length) {
          // 2. Calculate unread notifications
          console.log(
            "Ticket notifications:",
            notifications.filter((n) => n.ticketId)
          );
          console.log(
            "Assigned notifications:",
            notifications.filter((n) => n.userId === user?.id)
          );
          const unreadNotifications = notifications.filter(
            (notif) => !readNotificationSet.has(notif.id)
          );
          setUnreadCount(unreadNotifications.length);

          // 3. Sort notifications with modified priority logic:
          const sorted = [...notifications].sort((a, b) => {
            // Check if notifications are assigned tickets for current user
            const aIsAssignment = a.ticketId && a.userId === user.id;
            const bIsAssignment = b.ticketId && b.userId === user.id;

            // Check if notifications are unread
            const aIsUnread = !readNotificationSet.has(a.id);
            const bIsUnread = !readNotificationSet.has(b.id);

            // Priority 1: Unread assigned tickets to current user
            // This ensures new assignments are always at the top until read
            if (aIsAssignment && bIsAssignment) {
              if (aIsUnread !== bIsUnread) {
                return aIsUnread ? -1 : 1;
              }
            } else if (aIsAssignment && aIsUnread) {
              return -1;
            } else if (bIsAssignment && bIsUnread) {
              return 1;
            }

            // Priority 2: Other unread notifications
            if (aIsUnread !== bIsUnread) {
              return aIsUnread ? -1 : 1;
            }

            // Priority 3: Most recent notifications
            // For read notifications, maintain chronological order
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          // Apply current filter state if needed
          // This ensures the filtered state is maintained when notifications update
          if (!showAll) {
            const filtered = sorted.filter((item) => {
              const isAssignedTicket = item.notification.includes("has assigned ticket:") &&
                item.ticketId;
              return item.subAccountId === subAccountId ||
                (isAssignedTicket && item.subAccountId === subAccountId);
            });
            setAllNotifications(filtered);
          } else {
            setAllNotifications(sorted);
          }
        }
      }
    };

    fetchData();
    // Added showAll and subAccountId as dependencies to ensure proper updates
    // This fixes the issue where filter state wasn't being maintained
  }, [notifications, showAll, subAccountId]);

  const markNotificationsAsRead = async () => {
    if (!currentUser || !allNotifications?.length) return;

    try {
      // 1. Update database
      await updateNotificationsAsRead(currentUser.id);

      // 2. Update local storage (optional, but can help with performance)
      const newReadNotifications = new Set(readNotifications);
      allNotifications.forEach((notif) => newReadNotifications.add(notif.id));
      setReadNotifications(newReadNotifications);

      localStorage.setItem(
        `readNotifications_${currentUser.id}`,
        JSON.stringify(Array.from(newReadNotifications))
      );

      // 3. Update local state and resort based on new read status
      const updatedNotifications = allNotifications.map(notif => ({
        ...notif,
        isRead: true
      }));

      // Resort notifications after marking as read
      const resorted = [...updatedNotifications].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setAllNotifications(resorted);
      
      // 4. Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notifications as read",
      });
    }
  };

  return (
    <>
      <div
        className={twMerge(
          "fixed z-[20] left-0 right-0 top-0 p-3 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]",
          isCollapsed ? "md:left-[56px]" : "md:left-[256px]",
          className
        )}
      >
        <div className="flex items-center gap-2 ml-auto">
          <Sheet>
            <SheetTrigger onClick={markNotificationsAsRead}>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        size="icon"
                        className="rounded-full size-9 bg-primary text-white"
                      >
                        <Bell size={17} />
                        {unreadCount > 0 && (
                          <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {unreadCount}
                          </div>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SheetTrigger>
            <SheetContent className="mt-2 mr-2 pr-4 overflow-y-scroll overflow-x-hidden">
              <SheetHeader className="text-left">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {(role === "AGENCY_ADMIN" || role === "AGENCY_OWNER") && (
                    <Card className="flex items-center justify-between p-4">
                      Current Subaccount
                      <Switch onCheckedChange={handleClick} />
                    </Card>
                  )}
                </SheetDescription>
                {allNotifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex flex-col gap-y-2 pb-3",
                      notification.ticketId &&
                        notification.userId === currentUser?.id &&
                        "bg-blue-500/10 border-l-4 border-blue-500 p-2",
                      !readNotifications.has(notification.id) &&
                        "bg-muted/50 border-l-4 border-primary p-2"
                    )}
                  >
                    <div className="flex gap-4 ">
                      <Avatar>
                        <AvatarImage
                          src={notification.User.avatarUrl}
                          alt="Profile Picture"
                        />
                        <AvatarFallback className="bg-primary">
                          {notification.User.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col w-full">
                        <p>
                          <span className="font-bold">
                            {notification.notification.split("|")[0]}
                          </span>
                          <span className="text-muted-foreground">
                            {notification.notification.split("|")[1]}
                          </span>
                          <span className="font-bold">
                            {notification.notification.split("|")[2]}
                          </span>
                        </p>
                        <small className="text-xs text-muted-foreground text-right">
                          {new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                          {", "}
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                {allNotifications?.length === 0 && (
                  <div
                    className="flex items-center justify-center text-muted-foreground"
                    mb-4
                  >
                    You have no notifications
                  </div>
                )}
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <CustomSignOutButton />
          <ModeToggle />
        </div>
      </div>
    </>
  );
};

export default InfoBar;
