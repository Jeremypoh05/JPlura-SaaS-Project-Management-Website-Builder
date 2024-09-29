"use client";

import { Button } from "@/components/ui/button";
import {
  deleteSubAccount,
  getSubaccountDetails,
  saveActivityLogsNotification,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast"; // Import toast for notifications
import { Trash2 } from "lucide-react"; // Import an icon for the button

type Props = {
  subaccountId: string;
  subaccountName: string; // Pass subaccount name for logging  
  onDeleteSuccess: () => void; // Callback for successful deletion  
};

const DeleteButton = ({ subaccountId, subaccountName, onDeleteSuccess }: Props) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [deleting, setDeleting] = useState(false); // State to manage loading state  

  const handleDelete = async () => {
    setDeleting(true); // Set deleting state to true  
    try {
      console.log(`Delete button clicked for subaccount ID: ${subaccountId}`);
      console.log(`Subaccount name: ${subaccountName}`); // Log the name of the subaccount  

      const response = await getSubaccountDetails(subaccountId);
      console.log(`Fetching details for subaccount:`, response);

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a subaccount | ${response?.name}`,
        subaccountId,
      });

      await deleteSubAccount(subaccountId);
      console.log(
        `Subaccount with ID ${subaccountId} and name '${subaccountName}' has been deleted.`
      );

      // Show success toast  
      toast({
        title: "Success",
        description: "Subaccount deleted successfully.",
      });

      onDeleteSuccess(); // Call the success callback to close the alert dialog  
      router.refresh(); // Refresh the router after deletion  
    } catch (error) {
      console.error("Error deleting subaccount:", error);
      // Show error toast  
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not delete subaccount.",
      });
    } finally {
      setDeleting(false); // Reset deleting state  
    }
  };

  return (
    <Button
      style={{
        backgroundColor: isHovered ? "#b22222" : "#800000", // Lighter red on hover  
        color: "white",
      }}
      onClick={handleDelete}
      disabled={deleting} // Disable button while deleting  
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
};  

export default DeleteButton;
