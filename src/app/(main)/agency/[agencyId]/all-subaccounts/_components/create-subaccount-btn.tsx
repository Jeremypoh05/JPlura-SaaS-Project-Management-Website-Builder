"use client";
import SubAccountDetails from "@/components/forms/subaccount-details";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { Agency, SubAccount, User } from "@prisma/client";
import { CircleFadingPlus } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  user: User & {
    //user must satisfy both the User type and the additional properties defined inside the { ... }.
    Agency: Agency | null;  // "|" symbol represents a union type. A union type means that a value can be one of several types.
  };
  id: string;
  className: string;
  maxSubaccounts: number; // Add maxSubaccounts prop  
  currentSubaccounts: number; // Add currentSubaccounts prop  
  setAlertOpen: (open: boolean) => void; // Add setAlertOpen prop  
  setSortedSubAccounts: React.Dispatch<React.SetStateAction<SubAccount[]>>; // Add setSortedSubAccounts prop  
  addSubaccount: (newSubaccount: SubAccount) => void; // Add addSubaccount prop  
};

const CreateSubaccountButton = ({ className, id, user, maxSubaccounts, currentSubaccounts, setAlertOpen, setSortedSubAccounts, addSubaccount }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;

  if (!agencyDetails) return null;

  const handleCreateSubaccount = () => {
    console.log("Button Clicked: Current Subaccounts:", currentSubaccounts, "Max Subaccounts:", maxSubaccounts);
    if (currentSubaccounts >= maxSubaccounts) {
      // If the limit is reached, open the alert dialog  
      console.log("Opening Alert Dialog");
      setAlertOpen(true);
    } else {
      // Otherwise, open the modal  
      setOpen(
        <CustomModal
          title="Create a Subaccount"
          subHeading="You can switch between your Agency account and the Sub Account from the sidebar"
        >
          <SubAccountDetails
            agencyDetails={agencyDetails}
            userId={user.id}
            userName={user.name}
            addSubaccount={addSubaccount} // Pass the addSubaccount function  
          />
        </CustomModal>
      );
    }
  };

  return (
    <Button
      size={"lg"}
      className={twMerge("w-[190px] flex items-center text-base md:!w-[230px] hover:font-bold ", className)}
      onClick={handleCreateSubaccount}
    >
      Create Sub Account
      <CircleFadingPlus className="ml-2 h-5 w-5" />
    </Button>
  );
};

export default CreateSubaccountButton;