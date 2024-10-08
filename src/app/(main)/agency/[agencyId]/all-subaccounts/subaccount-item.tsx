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
import React, { useState } from "react";
import DeleteButton from "./_components/delete-button";
import { CommandEmpty, CommandItem } from "@/components/ui/command";
import { Trash2 } from "lucide-react";

type SubaccountItemProps = {
  subaccount: SubAccount;
  onDelete: (subaccountId: string) => void; // Add onDelete prop  
};

const SubaccountItem = ({ subaccount, onDelete }: SubaccountItemProps) => {
  const [isAlertOpen, setAlertOpen] = useState(false); // State for alert dialog

  const handleItemClick = () => {
    console.log(`Clicked subaccount ID: ${subaccount.id}`);
  };

  return (
    <CommandItem className="max-h-full h-[120px] !custom-scrollbar !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all">
      <Link
        href={`/subaccount/${subaccount.id}`}
        className="flex gap-4 w-full h-full"
        onClick={handleItemClick}
      >
        <div className="relative w-36 overflow-hidden">
          <Image
            src={subaccount.subAccountLogo}
            alt="subaccount logo"
            fill
            className="rounded-md pb-1 object-contain bg-muted/50 transition-transform duration-300 ease-in-out transform hover:scale-125"
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
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button
            className="text-base hover:font-bold flex items-center"
            variant="destructive"
          >
            Delete
            <Trash2 className="ml-2 h-4 w-4 mb-1" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete the subaccount and
              all data related to the subaccount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <DeleteButton
                subaccountId={subaccount.id}
                subaccountName={subaccount.name}
                onDeleteSuccess={() => {
                  setAlertOpen(false); // Close the alert dialog on successful deletion
                  onDelete(subaccount.id); // Call the onDelete function to remove the subaccount  
                }}
              />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CommandItem>
  );
};
export default SubaccountItem;
