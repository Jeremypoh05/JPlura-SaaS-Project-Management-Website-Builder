import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/queries";
import { SubAccount } from "@prisma/client";
import React from "react";
import CreateSubaccountButton from "./_components/create-subaccount-btn";
import SubaccountItem from "./subaccount-item";

type Props = {
  params: { agencyId: string };
};

const AllSubaccountsPage = async ({ params }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null; // Return null if no user is found  

  // Ensure that sortedSubAccounts is always defined  
  const sortedSubAccounts = user?.Agency?.SubAccount
    ? user.Agency.SubAccount.sort(
      (a: SubAccount, b: SubAccount) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    : []; // Default to an empty array if not present  

  return (
    <div className="flex flex-col">
      <CreateSubaccountButton user={user} id={params.agencyId} className="w-[200px] self-end m-4" />
      <Command className="rounded-lg bg-transparent">
        <CommandInput placeholder="Search Account..." />
        <CommandList>
          <CommandEmpty>No Results Found.</CommandEmpty>
          <CommandGroup heading="Sub Accounts">
            {sortedSubAccounts.length ? ( // Check the length of sortedSubAccounts  
              sortedSubAccounts.map((subaccount: SubAccount) => (
                <SubaccountItem key={subaccount.id} subaccount={subaccount} />
              ))
            ) : (
              <div className="text-muted-foreground text-center p-4">
                No Sub Accounts
              </div>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default AllSubaccountsPage;
