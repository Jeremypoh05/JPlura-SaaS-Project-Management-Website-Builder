import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount"; //since we gonna use the same sidebar
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null;
  if (!user.Agency) return;

  const details =
    type === "agency"
      ? user.Agency
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id);
  //if type prop is 'subaccount', uses the find method to search for a subaccount within the SubAccount array of the Agency object.
  // checks if the id of the current subaccount matches the id passed to the Sidebar component.
  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  if (!details) return;

  let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

  if (!isWhiteLabeledAgency) {
    if (type === "subaccount") {
      //If user?.Agency.SubAccount exists, search for a subaccount within the SubAccount array if the id of the subaccount matches the id passed to the Sidebar component.
      //if subaccount match and successfully found, returned subAccountLogo else return user.Agency.agencyLogo
      sideBarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sidebarOpt = type === 'agency'
    ? user.Agency?.SidebarOption || []
    : (user.Agency?.SubAccount?.find((subaccount) => subaccount.id === id)
      ?.SidebarOption || []);

  //filter out subaccounts based on whether the current user has permission to access them.
  // check if the current user has access to a particular subaccount. It checks if there exists a permission object where the subAccountId matches the id of the current subaccount being filtered, and also checks if the access property of that permission is true.
  //filter() method is used to select subaccounts based on whether the user has access permissions.
  const subaccounts = user.Agency.SubAccount?.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  ) || [];
  // console.log("User Data:", user);
  // console.log("Agency Sidebar Options:", user.Agency?.SidebarOption);
  // console.log("SubAccount Sidebar Options:", user.Agency?.SubAccount);
  // console.log("User Permissions:", user.Permissions);

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
       {/*for mobile navbar */}
        <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subaccounts}
        user={user}
      />
      
    </>
  );
};

export default Sidebar;
