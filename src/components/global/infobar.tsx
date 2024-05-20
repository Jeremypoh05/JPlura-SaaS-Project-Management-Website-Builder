"use client";

import { NotificationWithUser } from "@/lib/types";
import { UserButton } from "@clerk/nextjs";
import React, { useState } from "react";
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

type Props = {
  notifications: NotificationWithUser | [];
  role?: Role;
  className?: string;
  subAccountId?: string;
};

const InfoBar = ({ notifications, role, className, subAccountId }: Props) => {
  const [allNotifications, setAllNotifications] = useState(notifications);
  const [showAll, setShowAll] = useState(true);

  const handleClick = () => {
    //if showAll is false, then we click and pass all notifications(because the condition match with !showAll)
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      // the function filters the original notifications array based on the subAccountId prop. It sets allNotifications to this filtered array.
      //If there are no notifications for the current subaccount, an empty array is set.
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => item.subAccountId === subAccountId) ??
            []
        );
      }
    }
    // the function toggles the value of showAll by negating its previous value using the ! operator. This ensures that the next time handleClick is invoked, it will perform the opposite action.
    setShowAll((prev) => !prev);
  };

  return (
    <>
      <div
        className={twMerge(
          "fixed z-[20] md:left-[316px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]"
        )}
      >
        <div className="flex items-center gap-2 ml-auto">
          <Sheet>
            <SheetTrigger>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="rounded-full size-9 bg- flex items-center justify-center bg-primary text-white "
                    >
                      <Bell size={17} />
                    </Button>
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
                    className="flex flex-col gap-y-2 pb-3 text-ellipsis"
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
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {", "}
                          {new Date(notification.createdAt).toLocaleDateString()}
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
