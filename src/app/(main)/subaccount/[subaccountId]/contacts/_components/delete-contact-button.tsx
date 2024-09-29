import { deleteContact, saveActivityLogsNotification } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface DeleteContactButtonProps {
  contactId: string; // This prop will be passed down from the ContactPage
  subaccountId: string; // Ensure subaccountId is passed as a prop
}

const DeleteContactButton: React.FC<DeleteContactButtonProps> = ({
  contactId,
  subaccountId,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteContact = async () => {
    setDeleting(true);
    try {
      // Call the delete function with contactId
      const response = await deleteContact(contactId); 

      // Check if response is valid
      if (!response) {
        throw new Error("No response from deleteContact");
      }

      // Save notification
      await saveActivityLogsNotification({
        agencyId: undefined, // Adjust as necessary
        description: `Deleted a contact | ${response?.name || "Unknown"}`, // Fallback if name is not available
        subaccountId: subaccountId,
      });

      // Show success toast
      toast({
        title: "Success",
        description: "Deleted Contact Successfully",
      });
      router.refresh();
      // Optionally refresh the router
      // router.refresh(); // Uncomment if you want to refresh the page
    } catch (error) {
      console.error("Error deleting contact:", error);
      // Show error toast
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could Not Delete Contact",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
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
          <AlertDialogTitle>
            Are you sure you want to delete this contact?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            contact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              style={{
                backgroundColor: isHovered ? "#b22222" : "#800000", // Lighter red on hover
                color: "white",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleDeleteContact}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteContactButton;
