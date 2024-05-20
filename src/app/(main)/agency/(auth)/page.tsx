import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react";
import { Plan } from "@prisma/client";
import { currentUser } from "@clerk/nextjs";
import AgencyDetails from "@/components/forms/agency-details";

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  console.log(agencyId);
  //get user details, check what access they have and depending on that we're going to send them to the sub accounts or keep them in this agency account
  //and if they have an acc, we have to send them to that specific account
  const user = await getAuthUserDetails();

  //if agencyId exists,
  if (agencyId) {
    if (user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER") {
      return redirect("/subaccount");
    }
    //if they are the agency admin, check whether they have subscribe the plan
    else if (user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") {
      //If a plan parameter is present in the URL's search parameters, it redirects the user to the billing page for the specified agency and plan.
      if (searchParams.plan) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${searchParams.plan}`
        );
      }

      //If a state parameter is present in the URL's search parameters
      if (searchParams.state) {
        //extract specific pieces of information encoded within the state parameter to use these individual pieces of information independently
        //split("___")[0] is the value before ___, and split("___")[1] is the value after ___
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];
        if (!stateAgencyId) return <div>Not authorized</div>;
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
        //once we receive the the code, we need to update and confirm that every thing is successful and something related with stripe while connecting account.
      } else return redirect(`/agency/${agencyId}`);
    } else {
      // if agencyId not exits
      return <div>Not authorized</div>;
    }
  }

  //if everything above not satisfied, we let user to create a new agency.
  const authUser = await currentUser();
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Agency</h1>
        {/*passing email address */}
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  );
};

export default Page;
