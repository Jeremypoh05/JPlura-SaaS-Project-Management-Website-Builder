// components/CustomSignOutButton.tsx
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { LogOut } from "lucide-react"; // Importing the LogOut icon
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CustomSignOutButton = () => {
  const { signOut } = useClerk();

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
            className="rounded-full size-9 bg- flex items-center justify-center bg-primary text-white "
            onClick={handleSignOut}
          >
            <LogOut size={17} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Log Out</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomSignOutButton;
