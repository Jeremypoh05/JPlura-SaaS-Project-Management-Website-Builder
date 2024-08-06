"use client";

import { SubAccount } from "@prisma/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DeleteButton from "./_components/delete-button";
import { CommandEmpty, CommandItem } from "@/components/ui/command";

type SubaccountItemProps = {
    subaccount: SubAccount;
};

const SubaccountItem = ({ subaccount }: SubaccountItemProps) => {
    const handleItemClick = () => {
        console.log(`Clicked subaccount ID: ${subaccount.id}`);
    };

    return (
        <CommandItem className="max-h-full h-[120px] !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all">
            <Link
                href={`/subaccount/${subaccount.id}`}
                className="flex gap-4 w-full h-full"
                onClick={handleItemClick}
            >
                <div className="relative w-32">
                    <Image
                        src={subaccount.subAccountLogo}
                        alt="subaccount logo"
                        fill
                        className="rounded-md object-contain bg-muted/50 p-4"
                    />
                </div>
                <div className="flex flex-col justify-between">
                    <div className="flex flex-col">
                        {subaccount.name}
                        <span className="text-muted-foreground text-xs">
                            {subaccount.address} <br />
                            {subaccount.zipCode}, {subaccount.state}
                        </span>
                    </div>
                </div>
            </Link>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        size={"sm"}
                        variant={"destructive"}
                        className="w-20 hover:bg-red-600 hover:text-white !text-white"
                    >
                        Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            This action cannot be undone. This will delete the subaccount and
                            all data related to the subaccount.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive">
                            <DeleteButton
                                subaccountId={subaccount.id}
                                subaccountName={subaccount.name}
                            />
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CommandItem>
    );
};

export default SubaccountItem;
