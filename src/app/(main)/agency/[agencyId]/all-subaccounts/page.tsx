"use client"; // Ensure this is a client component  

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/queries";
import { SubAccount } from "@prisma/client";
import React, { useEffect, useState } from "react"; // Import useEffect and useState  
import CreateSubaccountButton from "./_components/create-subaccount-btn";
import SubaccountItem from "./subaccount-item";
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
import { UserWithAgency } from "@/lib/types";

type Props = {
  params: { agencyId: string };
};

const AllSubaccountsPage = ({ params }: Props) => {
  const [user, setUser] = useState<UserWithAgency | null>(null); // Use the updated type  
  const [sortedSubAccounts, setSortedSubAccounts] = useState<SubAccount[]>([]); // State for sorted subaccounts  
  const [isAlertOpen, setAlertOpen] = useState(false); // State for alert dialog  

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getAuthUserDetails();
      setUser(userDetails || null); // Set user to null if userDetails is undefined  
      if (userDetails?.Agency?.SubAccount) {
        const sorted = userDetails.Agency.SubAccount.sort(
          (a: SubAccount, b: SubAccount) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setSortedSubAccounts(sorted);
      }
    };

    fetchUserDetails();
  }, []); // Fetch user details on component mount  

  if (!user) return null; // Return null if no user is found  

  // Determine the maximum number of subaccounts allowed based on the current plan.  
  const currentPlan = user.Agency?.Subscription?.plan; // Get the current plan  
  const maxSubaccounts = currentPlan ?
    (currentPlan === "price_1PQ8HWRqpSbtJ03827K2PbCM" ? Infinity : // Unlimited Plan  
      currentPlan === "price_1PQ8HVRqpSbtJ038LxC6uWrX" ? 4 : // Basic Plan  
        1) // Default to 1 subaccount if no plan  
    : 1; // Default to 1 subaccount if no plan  

  // Log the current subaccount count and current plan  
  console.log("Current Subaccounts:", sortedSubAccounts.length);
  console.log("Current Plan:", currentPlan);

  // Construct the billing URL dynamically  
  const billingUrl = `${process.env.NEXT_PUBLIC_URL}agency/${params.agencyId}/billing`;

  // Function to add a new subaccount to the state  
  const addSubaccount = (newSubaccount: SubAccount) => {
    setSortedSubAccounts((prev) => [...prev, newSubaccount]);
  };

  // Function to remove a subaccount from the state  
  const removeSubaccount = (subaccountId: string) => {
    //takes the previous state (prev) as an argument
    //filter method creates a new array containing all elements that pass the test implemented by the provided function. 
    //In this case, the test checks whether the id of each subaccount is not equal to the subaccountId passed to the remove Subaccount function.
    setSortedSubAccounts((prev) => prev.filter((subaccount) => subaccount.id !== subaccountId));
    //The condition subaccount.id !== subaccountId means that only subaccounts whose id does not match the subaccountId will be included in the new array. 
    //This effectively removes the subaccount with the matching id.
  };

  return (
    <div className="flex flex-col">
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
                  You have reached the maximum number of subaccounts allowed for your current plan. Please upgrade your current plan to align your needs.
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

      <CreateSubaccountButton
        user={user}
        id={params.agencyId}
        className="w-[200px] self-end m-4"
        maxSubaccounts={maxSubaccounts}
        currentSubaccounts={sortedSubAccounts.length}
        setAlertOpen={setAlertOpen} // Pass the alert state handler  
        setSortedSubAccounts={setSortedSubAccounts} // Pass the setter for sorted subaccounts  
        addSubaccount={addSubaccount} // Pass the addSubaccount function  
      />
      <Command className="rounded-lg bg-transparent">
        <CommandInput placeholder="Search Account..." />
        <CommandList>
          <CommandEmpty>No Results Found.</CommandEmpty>
          <CommandGroup heading="Sub Accounts">
            {sortedSubAccounts.length ? ( // Check the length of sortedSubAccounts  
              sortedSubAccounts.map((subaccount: SubAccount) => (
                <SubaccountItem
                  key={subaccount.id}
                  subaccount={subaccount}
                  onDelete={removeSubaccount} // Pass the remove function  
                />
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