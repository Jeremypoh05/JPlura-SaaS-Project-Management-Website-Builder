"use client";
import ContactUserForm from "@/components/forms/contact-user-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { CircleFadingPlus, Plus } from "lucide-react";
import React from "react";

type Props = {
  subaccountId: string;
};

const CreateContactButton = ({ 
    subaccountId 
}: Props) => {
  const { setOpen } = useModal();

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Create Or Update Contact information"
        subHeading="Contacts are like customers."
      >
        <ContactUserForm subaccountId={subaccountId} />
      </CustomModal>
    );
  };

    //create a clickable element that triggers the handleCreateContact function when clicked. 
  return (
    <Button className="text-base hover:font-bold flex items-center" size={"lg"} onClick={handleCreateContact}>
      Create Contact
      <CircleFadingPlus className="ml-2 h-6 w-6" />
    </Button>
  );
};

export default CreateContactButton;
