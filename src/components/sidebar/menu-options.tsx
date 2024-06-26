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
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from "lucide-react";
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

type Props = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string;
  details: any;
  user: any;
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
  const { setOpen } = useModal();
  const [isMounted, setIsMounted] = useState(false);

  //useMemo is used for memoization, which optimizes performance by caching the result of a function.
  //It re - runs the function only when one of its dependencies changes, ensuring that it's only recalculated when defaultOpen changes.
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  const sidebarOrder = [
    "Dashboard",
    "Launchpad",
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

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
        className={clsx(
          // Sets the background color to a shade with 80% opacity.
          "bg-background/80 backdrop-blur-xl fixed top-0 border-none py-6 px-2 ",
          {
            //Shows the element as an inline-block on medium-sized screens and larger.
            "hidden md:inline-block z-0 w-[310px]": defaultOpen,
            //This is applied when defaultOpn is false. Hides the element on medium-sized screens and larger(which is a full-width sidebar will be hidden, else we will have 2 sidebar).
            "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <div>
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
                  <div className="flex flex-col whitespace-pre-wrap">
                    {details.name}
                    <span className="text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown size={16} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-[282px] h-80 mt-4 z-[200]">
              <Command className="rounded-lg shadow-md">
                <CommandInput placeholder="Search Accounts..." />
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
                              <div className="flex flex-col flex-1">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground">
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
                                <div className="flex flex-col flex-1">
                                  {user?.Agency?.name}
                                  <span className="text-muted-foreground">
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
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                          <CommandItem key={subaccount.id}>
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
                                <div className="flex flex-col flex-1">
                                  {subaccount.name}
                                  <span className="text-muted-foreground">
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
                                  <div className="flex flex-col flex-1">
                                    {subaccount.name}
                                    <span className="text-muted-foreground">
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
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create a Subaccount"
                            subHeading="You can switch between your Agency account and the Subaccount from the sidebar"
                          >
                            <SubAccountDetails
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        );
                      }}
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
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
                            className="md:w-[320px] w-full"
                          >
                            <Link
                              href={sidebarOptions.link}
                              className="flex items-center gap-3 hover:bg-transparent rounded-md transition-all md-w-full w-[290px]"
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
        <div className="flex items-end justify-end md:mt-0 mt-10">
          <UserButton
            showName
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
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
