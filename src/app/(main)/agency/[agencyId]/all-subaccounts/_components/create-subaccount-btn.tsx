"use client";
import SubAccountDetails from "@/components/forms/subaccount-details";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client";
import { CircleFadingPlus, PlusCircleIcon } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  user: User & {
    //user must satisfy both the User type and the additional properties defined inside the { ... }.
    Agency: // "|"" symbol represents a union type. A union type means that a value can be one of several types.
    | (
          | Agency //A type representing an agency.
          | (null & {
              //A type that combines null with an object containing SubAccount and SideBarOption properties.
              SubAccount: SubAccount[];
              SideBarOption: AgencySidebarOption[];
            })
        )
      | null;
  };
  id: string;
  className: string;
};

const CreateSubaccountButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;

  if (!agencyDetails) return;

  return (
    <Button
      size={"lg"}
      className={twMerge("w-[190px] flex items-center text-base md:!w-[230px] hover:font-bold ", className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subHeading="You can switch between your Agency account and the Sub Account from the sidebar"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        );
      }}
    >
      Create Sub Account
      <CircleFadingPlus className="ml-2 h-5 w-5" />
    </Button>
  );
};

export default CreateSubaccountButton;
