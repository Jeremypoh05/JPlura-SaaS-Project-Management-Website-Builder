import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  searchParams: { state: string; code: string }; //an object which comes from Stripes
  //when we wire up Stripe, when the user comes back to this page after they have connected their Stripe acc. We are going to get access to this state.(Basically the subcaccount id that we're gonna to send them to.)
  //while "code" is needed to basically just kind of finish up the authentication process.
};

const SubAccountMainPage = async ({ searchParams }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorized />;
  }

  const user = await getAuthUserDetails();
  if (!user) return;

  // using the find method from the JavaScript Array prototype to search for the first subaccount (permission) in the Permissions array of the user object, where the access property is true.
  const getFirstSubaccountWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  );

  if (searchParams.state) {
      //If searchParams.state exits, extract the statePath and stateSubaccountId from the searchParams.state by splitting it using the ___ delimiter.
    const statePath = searchParams.state.split("___")[0];
    const stateSubaccountId = searchParams.state.split("___")[1];

    if (!stateSubaccountId) return <Unauthorized />;
    
      //If stateSubaccountId is present, redirect the user to the /subaccount route with the stateSubaccountId
    return redirect(
      `/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`
    );
  }

  //if user have permission with access equal to true, we will bring them to the first sub account.
    if (getFirstSubaccountWithAccess) {
        return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`)
    }
    return <Unauthorized />
};

export default SubAccountMainPage;
