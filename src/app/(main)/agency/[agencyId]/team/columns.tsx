"use client"; // Indicates that this component is a client-side component in Next.js  

import clsx from "clsx"; // Utility for conditionally joining class names  
import { ColumnDef } from "@tanstack/react-table"; // Importing ColumnDef type for defining table columns  
import {
  Agency,
  Permissions,
  Prisma,
  SubAccount,
  User,
  Role, // Import Role from Prisma  
} from "@prisma/client"; // Importing types from Prisma client for type safety  
import Image from "next/image"; // Next.js Image component for optimized image loading  

import { Badge } from "@/components/ui/badge"; // Badge component for displaying status  
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Dropdown menu components for actions  
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
} from "@/components/ui/alert-dialog"; // Alert dialog components for confirmation prompts  
import { Button } from "@/components/ui/button"; // Button component for actions  
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"; // Icons for UI actions  
import { useModal } from "@/providers/modal-provider"; // Custom hook for modal management  
import UserDetails from "@/components/forms/user-details"; // Component for editing user details  

import { deleteUser, getUser } from "@/lib/queries"; // Functions for user-related API calls  
import { useToast } from "@/components/ui/use-toast"; // Hook for displaying toast notifications  
import { useState } from "react"; // React hook for managing state  
import { useRouter } from "next/navigation"; // Hook for navigation in Next.js  
import { UsersWithAgencySubAccountPermissionsSidebarOptions } from "@/lib/types"; // Type for user data  
import CustomModal from "@/components/global/custom-modal"; // Custom modal component for user details  

// Define the role priority mapping  
// This mapping assigns a numeric value to each role, where a lower number indicates a higher authority.  
const rolePriority: Record<string, number> = {
  AGENCY_OWNER: 1, //(highest authority)   
  AGENCY_ADMIN: 2,
  SUBACCOUNT_USER: 3,
  SUBACCOUNT_GUEST: 4, //(lowest authority)  
};

// Custom sorting function for roles  
// This function compares the roles of two rows based on their priority values.  
const customRoleSort = (rowA: any, rowB: any) => {
  const roleA = rowA.original.role; // Role of the first row   
  const roleB = rowB.original.role; // Role of the second row   
  // Return the difference in priority values to determine sort order  
  return (rolePriority[roleA] || Infinity) - (rolePriority[roleB] || Infinity);
};

// Custom sorting function for Owned Accounts  
// This function sorts the owned accounts based on their display names.  
const customOwnedAccountsSort = (rowA: any, rowB: any) => {
  //  filtering the Permissions array for both rows (rowA and rowB) to get only those permissions that grant access. 
  //  This results in two arrays: ownedAccountsA and ownedAccountsB, 
  //  which contain the permissions that allow access to owned accounts.
  const ownedAccountsA = rowA.original.Permissions.filter((per: Permissions) => per.access);
  const ownedAccountsB = rowB.original.Permissions.filter((per: Permissions) => per.access);

  // Construct display names for sorting  
  const displayNameA = rowA.original.role === "AGENCY_OWNER"
    ? `Agency - ${rowA.original.Agency?.name}` // Display name for agency owner  
    : ownedAccountsA.length
      ? `Sub Account - ${ownedAccountsA[0].SubAccount.name}` // Display name for sub-account  
      : "";

  const displayNameB = rowB.original.role === "AGENCY_OWNER"
    ? `Agency - ${rowB.original.Agency?.name}` // Display name for agency owner  
    : ownedAccountsB.length
      ? `Sub Account - ${ownedAccountsB[0].SubAccount.name}` // Display name for sub-account  
      : "";

  // Compare display names for alphabetical sorting  
  return displayNameA.localeCompare(displayNameB);
};

// Check here: https://ui.shadcn.com/docs/components/data-table  
// Define the columns for the data table  
export const columns: ColumnDef<UsersWithAgencySubAccountPermissionsSidebarOptions>[] =
  [
    {
      accessorKey: "id", // Unique identifier for the row  
      header: "", // No header for this column  
      cell: () => {
        return null; // No cell content  
      },
    },
    {
      accessorKey: "name", // Key for accessing the name property  
      header: "Name", // Header for the column  
      cell: ({ row }) => { // Render function for the cell  
        const avatarUrl = row.getValue("avatarUrl") as string; // Get avatar URL  
        return (
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 relative flex-none">
              <Image
                src={avatarUrl} // Display the user's avatar  
                fill
                className="rounded-full object-cover"
                alt="avatar image"
              />
            </div>
            <span>{row.getValue("name")}</span> 
          </div>
        );
      },
    },
    {
      accessorKey: "avatarUrl", // Key for accessing the avatar URL  
      header: "", // No header for this column  
      cell: () => {
        return null; // No cell content  
      },
    },
    { accessorKey: "email", header: "Email" }, // Column for email addresses  

    {
      accessorKey: "SubAccount", // Key for accessing sub-account information  
      header: "Owned Accounts", // Header for the column  
      cell: ({ row }) => { // Render function for the cell  
        const isAgencyOwner = row.getValue("role") === "AGENCY_OWNER"; // Check if the user is an agency owner  
        const ownedAccounts = row.original?.Permissions.filter(
          (per: Permissions) => per.access // Filter owned accounts with access  
        );

        // Render the owned accounts based on the user's role  
        if (isAgencyOwner)
          return (
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-2">
                <Badge className="bg-slate-600 whitespace-nowrap">
                  Agency - {row?.original?.Agency?.name}
                </Badge>
              </div>
            </div>
          );
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              {ownedAccounts?.length ? ( // Check if there are owned accounts  
                ownedAccounts.map((account) => (
                  <Badge
                    key={account.id} // Unique key for each badge  
                    className="bg-slate-600 w-fit whitespace-nowrap"
                  >
                    Sub Account - {account.SubAccount.name} 
                  </Badge>
                ))
              ) : (
                <div className="text-muted-foreground">No Access Yet</div> // Message if no access  
              )}
            </div>
          </div>
        );
      },
      sortingFn: customOwnedAccountsSort, // Use custom sorting function for Owned Accounts  
    },
    {
      accessorKey: "role", // Key for accessing the role property  
      header: "Role", // Header for the column  
      cell: ({ row }) => { // Render function for the cell  
        const role: Role = row.getValue("role"); // Get the user's role  
        return (
          <Badge
            className={clsx({ // Conditional class names based on role  
              "bg-emerald-500": role === "AGENCY_OWNER",
              "bg-orange-400": role === "AGENCY_ADMIN",
              "bg-primary": role === "SUBACCOUNT_USER",
              "bg-muted": role === "SUBACCOUNT_GUEST",
            })}
          >
            {role} 
          </Badge>
        );
      },
      sortingFn: customRoleSort, // Use custom sorting function for Role  
    },
    {
      id: "actions", // Unique identifier for the actions column  
      cell: ({ row }) => { // Render function for the cell  
        const rowData = row.original; // Get the original row data  

        return <CellActions rowData={rowData} />; // Render cell actions component  
      },
    },
  ];

// Define the props for the CellActions component  
interface CellActionsProps {
  rowData: UsersWithAgencySubAccountPermissionsSidebarOptions; // Type for row data  
}

// CellActions component for rendering action buttons for each user  
const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { data, setOpen } = useModal(); // Modal management  
  const { toast } = useToast(); // Toast notifications  
  const [loading, setLoading] = useState(false); // Loading state for actions  
  const router = useRouter(); // Router for navigation  
  if (!rowData) return; // Return if no row data  
  if (!rowData.Agency) return; // Return if no agency data  

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" /> 
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData?.email)} // Copy email to clipboard  
          >
            <Copy size={15} /> Copy Email
          </DropdownMenuItem>
          <DropdownMenuSeparator /> 
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  subHeading="You can change permissions only when the user has an owned subaccount"
                  title="Edit User Details"
                >
                  <UserDetails
                    type="agency"
                    id={rowData?.Agency?.id || null} // Pass agency ID to UserDetails  
                    subAccounts={rowData?.Agency?.SubAccount} // Pass sub-accounts to UserDetails  
                  />
                </CustomModal>,
                async () => {
                  return { user: await getUser(rowData?.id) }; // Fetch user data for editing  
                }
              );
            }}
          >
            <Edit size={15} /> Edit Details
          </DropdownMenuItem>
          {rowData.role !== "AGENCY_OWNER" && ( // Conditional rendering for remove action  
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2" onClick={() => { }}>
                <Trash size={15} /> Remove User
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure? // Confirmation title
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the user
            and related data. // Confirmation message
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading} // Disable button while loading  
            className="bg-destructive hover:bg-red-600"
            onClick={async () => {
              setLoading(true); // Set loading state  
              await deleteUser(rowData.id); // Call delete user function  
              toast({
              title: "Deleted User", // Toast notification title  
                description:
                  "The user has been deleted from this agency they no longer have access to the agency", // Toast notification description  
              });
              setLoading(false); // Reset loading state  
              router.refresh(); // Refresh the router to update the UI  
            }}
          >
            Delete // Delete action button
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};