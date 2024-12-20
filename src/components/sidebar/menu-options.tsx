"use client";

import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
} from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import {
  ChevronsLeft,
  ChevronsUpDown,
  Compass,
  Menu,
  PlusCircleIcon,
} from "lucide-react";
import clsx from "clsx";
import { AspectRatio } from "../ui/aspect-ratio";
import { Popover, PopoverTrigger } from "../ui/popover";
import Image from "next/image";
import { PopoverContent } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Link from "next/link";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "../global/custom-modal";
import SubAccountDetails from "../forms/subaccount-details";
import { Separator } from "../ui/separator";
import { icons } from "@/lib/constants";
import { UserButton } from "@clerk/nextjs";
import { UserWithAgency } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/providers/sidebar-provider";

type Props = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string;
  details:
  | UserWithAgency["Agency"]
  | (SubAccount & { SidebarOption: SubAccountSidebarOption[] });
  user: UserWithAgency;
  id: string;
};

const MenuOptions = ({
  defaultOpen,
  subAccounts,
  sidebarOpt,
  sidebarLogo,
  details,
  user,
  id,
}: Props) => {
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const { setOpen } = useModal();
  const [isMounted, setIsMounted] = useState(false);
  const [sortedSubAccounts, setSortedSubAccounts] =
    useState<SubAccount[]>(subAccounts); // Initialize state with existing subaccounts
  const [isAlertOpen, setAlertOpen] = useState(false); // State for alert dialog

  // Determine the maximum number of subaccounts allowed based on the current plan.
  const currentPlan = user?.Agency?.Subscription?.plan;
  const maxSubaccounts = currentPlan
    ? currentPlan === "price_1PQ8HWRqpSbtJ03827K2PbCM"
      ? Infinity // Unlimited Plan
      : currentPlan === "price_1PQ8HVRqpSbtJ038LxC6uWrX"
        ? 3 // Basic Plan
        : 1 // Default to 1 subaccount if no plan
    : 1; // Default to 1 subaccount if no plan

  const handleCollapse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  //useMemo is used for memoization, which optimizes performance by caching the result of a function.
  //It re - runs the function only when one of its dependencies changes, ensuring that it's only recalculated when defaultOpen changes.
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (!details) return null;

  const sidebarOrder = [
    "Dashboard",
    "Billing",
    "Settings",
    "Sub Accounts",
    "Team",
    "Funnels",
    "Media",
    "Automations",
    "Pipelines",
    "Contacts",
  ];

  // Function to add a new subaccount to the state
  const addSubaccount = (newSubaccount: SubAccount) => {
    setSortedSubAccounts((prev) => [...prev, newSubaccount]);
  };

  const handleCreateSubaccount = () => {
    if (sortedSubAccounts.length >= maxSubaccounts) {
      // If the limit is reached, open the alert dialog
      setAlertOpen(true);
    } else {
      // Otherwise, open the modal
      setOpen(
        <CustomModal
          title="Create a Subaccount"
          subHeading="You can switch between your Agency account and the Subaccount from the sidebar"
        >
          <SubAccountDetails
            agencyDetails={user?.Agency as Agency}
            userId={user?.id as string}
            userName={user?.name}
            addSubaccount={addSubaccount}
          />
        </CustomModal>
      );
    }
  };

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:!hidden flex"
      >
        <Button variant="outline" size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side={"left"}
        className={cn(
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] py-6 px-2",
          "transition-all duration-300 ease-in-out",
          {
            "md:inline-block z-0": defaultOpen,
            "inline-block md:hidden z-[100]": !defaultOpen,
          },
          isCollapsed ? "w-[60px]" : "w-[260px]"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-1 top-2",
            "rounded-full",
            "hidden md:flex items-center justify-center", // Only show on md and above
            "hover:scale-105 transition-all duration-300",
            // Light mode styles
            "bg-background border-2 border-border",
            "hover:bg-primary-foreground",
            // Dark mode styles
            "dark:bg-muted dark:hover:bg-gray-800",
            "dark:border-border",
            // Shadow and blur effects
            "shadow-sm backdrop-blur-sm",
            isCollapsed ? "rotate-180" : "",
            "!z-50"
          )}
          onClick={handleCollapse}
        >
          <ChevronsLeft
            className={cn(
              "h-4 w-4",
              "text-muted-foreground",
              "transition-colors duration-300",
              "group-hover:text-primary"
            )}
          />
        </Button>

        <div
          className={clsx(
            "transition-all duration-300",
            isCollapsed
              ? "opacity-0 invisible w-0"
              : "opacity-100 visible w-auto"
          )}
        >
          {/* Logo */}
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center gap-2 justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col whitespace-pre-wrap text-xs text-yellow-700 font-bold hover:text-yellow-600 leading-5">
                    {details.name}
                    <span className="text-muted-foreground text-xs">
                      {details.address}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown size={16} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 md:w-[242px] h-80 mt-4 z-[200]">
              <Command className="text-xs rounded-lg shadow-md !m-0">
                <CommandInput
                  placeholder="Search Accounts..."
                  className="text-xs"
                />
                <CommandList>
                  <CommandEmpty>No results found</CommandEmpty>
                  {(user?.role === "AGENCY_OWNER" ||
                    user?.role === "AGENCY_ADMIN") &&
                    user?.Agency && (
                      <CommandGroup heading="Agency">
                        <CommandItem className="!bg-transparent my-2 text-primary border-[2px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1 text-yellow-700 hover:text-yellow-600 text-xs">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground font-medium text-xs">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1 text-xs">
                                  {user?.Agency?.name}
                                  <span className="text-muted-foreground font-medium text-xs">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  {/* if subAccounts is truthy. If it is, it maps over each subaccount in the subAccounts array and renders them as CommandItem components.   
                  If subAccounts is falsy (for example, if it's an empty array), it displays the text "No Accounts". */}
                  <CommandGroup heading="Sub Accounts">
                    {!!sortedSubAccounts // Use sortedSubAccounts instead of subAccounts
                      ? sortedSubAccounts.map((subaccount) => (
                        <CommandItem
                          className="!bg-transparent mb-1 border border-border rounded-md hover:!bg-muted cursor-pointer transition-all"
                          key={subaccount.id}
                        >
                          {defaultOpen ? (
                            <Link
                              href={`/subaccount/${subaccount.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={subaccount.subAccountLogo}
                                  alt="subaccount Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1 text-xs">
                                {subaccount.name}
                                <span className="text-muted-foreground font-medium text-xs">
                                  {subaccount.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/subaccount/${subaccount.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subaccount.subAccountLogo}
                                    alt="subaccount Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1 text-xs">
                                  {subaccount.name}
                                  <span className="text-muted-foreground font-medium text-xs">
                                    {subaccount.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                      : "No Accounts"}
                  </CommandGroup>
                </CommandList>
                {(user?.role === "AGENCY_OWNER" ||
                  user?.role === "AGENCY_ADMIN") && (
                    <SheetClose>
                      <Button
                        className="w-full flex gap-2 bg-blue-700/30 hover:bg-blue-700/10"
                        onClick={handleCreateSubaccount}
                      >
                        <PlusCircleIcon size={15} />
                        Create Sub Account
                      </Button>
                    </SheetClose>
                  )}
              </Command>
            </PopoverContent>
          </Popover>

          {/* Navigation Menu */}
          <div className="px-2">
            <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
            <Separator className="mb-2" />
            <nav className="relative">
              <Command className="rounded-lg overflow-visible bg-transparent">
                <CommandInput placeholder="Search..." />
                <CommandList className="py-2 overflow-visible">
                  <CommandEmpty>No Results Found</CommandEmpty>
                  <CommandGroup className="overflow-visible">
                    {/*since this sidebarOpt props have associated with AgencySidebarOption[] | SubAccountSidebarOption[];  
                    and they have already have data when creating Agency or update Agency through upsertAgency(queries.ts), so we can map it from backend and render  it*/}
                    {sidebarOpt
                      .sort((a, b) => {
                        const orderA = sidebarOrder.indexOf(a.name);
                        const orderB = sidebarOrder.indexOf(b.name);
                        return (
                          (orderA === -1 ? 999 : orderA) -
                          (orderB === -1 ? 999 : orderB)
                        );
                      })
                      .map((sidebarOptions) => {
                        let val;
                        const result = icons.find(
                          (icon) => icon.value === sidebarOptions.icon
                        );
                        if (result) {
                          val = <result.path />;
                        }
                        return (
                          <CommandItem
                            key={sidebarOptions.id}
                            className="md:w-[270px] w-full"
                          >
                            <Link
                              href={sidebarOptions.link}
                              className="flex items-center gap-3 hover:bg-transparent rounded-md transition-all md-w-full w-[240px]"
                            >
                              {val}
                              <span>{sidebarOptions.name}</span>
                            </Link>
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </nav>
          </div>
        </div>

        {/* User Button */}
        <div
          className={clsx(
            "flex items-center justify-end md:mt-0 mt-10",
            isCollapsed ? "mt-auto" : ""
          )}
        >
          <div className="fixed mt-20">
            <UserButton
              showName={!isCollapsed}
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-[40px] w-[40px]",
                  userButtonPopoverActionButton__signOut: {
                    display: "none",
                  },
                },
              }}
            />
          </div>
        </div>
      </SheetContent>

      {/* Alert Dialog for Upgrade Plan */}
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="p-0">
          {/* Full-width background image */}
          <div
            className="w-full h-64 bg-cover bg-center rounded-xl	"
            style={{ backgroundImage: "url('/assets/upgrade_plan.png')" }}
          />
          <div className="p-6 text-center">
            {/* Title and Description */}
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                Limit Reached
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                You have reached the maximum number of subaccounts allowed for
                your current plan. Please upgrade your current plan to align
                your needs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {/* List of features or benefits of upgrading */}
            <ul className="text-left list-disc list-inside mt-4 leading-8">
              <li>Unlimited Subaccounts</li>
              <li>Unlimited Team Members</li>
              <li>24/7 Supports</li>
              <li>And more!</li>
            </ul>
            {/* Footer with action buttons */}
            <AlertDialogFooter className="mt-6">
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-800"
                onClick={() => setAlertOpen(false)}
              >
                Close
              </AlertDialogAction>
              <AlertDialogAction
                className="bg-blue-700 text-white"
                onClick={() => {
                  // Redirect to the billing page or handle upgrade logic
                  window.location.href = `/agency/${user?.Agency?.id}/billing`;
                }}
              >
                Upgrade Plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};

export default MenuOptions;
