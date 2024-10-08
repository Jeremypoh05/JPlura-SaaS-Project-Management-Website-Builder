import { deleteFunnel, saveActivityLogsNotification } from "@/lib/queries";
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

interface DeleteFunnelButtonProps {
  funnelId: string; //this props passed down to this component from the parent component, which, is the column definition in columns.tsx.
  subaccountId: string;
}
//renders the delete button and handles the confirmation dialog.
const DeleteFunnelButton: React.FC<DeleteFunnelButtonProps> = ({
  funnelId, subaccountId
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);  
  const [deleting, setDeleting] = useState(false);

  const handleDeleteFunnel = async () => {
    setDeleting(true);
    try {
      // Call the delete function with contactId  
      const response = await deleteFunnel(funnelId);  // Call the delete function with funnelId

      // Check if response is valid  
      if (!response) {
        throw new Error("No response from deleteContact");
      }

      // Save notification  
      await saveActivityLogsNotification({
        agencyId: undefined, // Adjust as necessary  
        description: `Deleted a funnel | ${response?.name || "Unknown"}`, // Fallback if name is not available  
        subaccountId: subaccountId, //
      });

      // Show success toast  
      toast({
        title: "Success",
        description: "Deleted Funnel Successfully",
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
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this funnel?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            funnel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              style={{
                backgroundColor: isHovered ? '#b22222' : '#800000', // Lighter red on hover  
                color: 'white',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleDeleteFunnel}
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

export default DeleteFunnelButton;