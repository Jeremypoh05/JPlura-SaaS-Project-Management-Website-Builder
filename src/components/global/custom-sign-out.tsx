// components/CustomSignOutButton.tsx  
import { useClerk } from "@clerk/nextjs";  
import { useState } from "react";  
import { LogOut } from "lucide-react"; // Importing the LogOut icon  
import { Button } from "../ui/button";  
import {  
  Tooltip,  
  TooltipContent,  
  TooltipProvider,  
  TooltipTrigger,  
} from "@/components/ui/tooltip";  
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

const CustomSignOutButton = () => {  
  const { signOut } = useClerk();  
  const [open, setOpen] = useState(false); // State to control the alert dialog  

  const handleSignOut = async () => {  
    await signOut();  
    window.location.href = "/"; // Refresh the page after sign-out  
  };  

  return (  
    <TooltipProvider delayDuration={100}>  
      <Tooltip>  
        <TooltipTrigger asChild>  
          <Button  
            size="icon"  
            className="rounded-full size-9 bg- flex items-center justify-center bg-primary text-white"  
            onClick={() => setOpen(true)} // Open the alert dialog on click  
          >  
            <LogOut size={17} />  
          </Button>  
        </TooltipTrigger>  
        <TooltipContent>  
          <p>Log Out</p>  
        </TooltipContent>  
      </Tooltip>  
      <AlertDialog open={open} onOpenChange={setOpen}>  
        <AlertDialogContent>  
          <AlertDialogHeader>  
            <AlertDialogTitle>Confirm Log Out</AlertDialogTitle>  
            <AlertDialogDescription>  
              Are you sure you want to log out?  
            </AlertDialogDescription>  
          </AlertDialogHeader>  
          <AlertDialogFooter>  
            <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>  
            <AlertDialogAction className="bg-destructive hover:bg-red-600" onClick={handleSignOut}>Confirm</AlertDialogAction>  
          </AlertDialogFooter>  
        </AlertDialogContent>  
      </AlertDialog>  
    </TooltipProvider>  
  );  
};  

export default CustomSignOutButton;