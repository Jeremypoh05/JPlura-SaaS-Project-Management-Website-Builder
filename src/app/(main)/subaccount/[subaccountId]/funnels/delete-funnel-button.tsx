import { deleteFunnel } from "@/lib/queries";
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

interface DeleteFunnelButtonProps {
  funnelId: string; //this props passed down to this component from the parent component, which, is the column definition in columns.tsx.
}
//renders the delete button and handles the confirmation dialog.
const DeleteFunnelButton: React.FC<DeleteFunnelButtonProps> = ({
  funnelId,
}) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteFunnel = async () => {
    setDeleting(true);
    try {
      //This function makes an API call to the backend to delete the funnel.
      //It takes funnelId as an argument and sends it to the backend
      await deleteFunnel(funnelId);  // Call the delete function with funnelId
      router.refresh(); // Refresh the page to reflect changes
    } catch (error) {
      console.error("Error deleting funnel:", error);
    }
    setDeleting(false);
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
          <AlertDialogAction onClick={handleDeleteFunnel} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFunnelButton;