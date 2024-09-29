import SubAccountDetails from "@/components/forms/subaccount-details";
import UserDetails from "@/components/forms/user-details";
import BlurPage from "@/components/global/blur-page";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import { SubAccount } from "@prisma/client";
import React from "react";

type Props = {
  params: { subaccountId: string };
};

const SubaccountSettingPage = async ({ params }: Props) => {
  const authUser = await currentUser();

  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  });

  if (!userDetails) return null;

  const subAccount = await db.subAccount.findUnique({
    where: { id: params.subaccountId },
  });

  if (!subAccount) return null;

  // where agency id matches the current subaccount id from the URL .agencyId
  const agencyDetails = await db.agency.findUnique({
    where: { id: subAccount.agencyId },
    include: { SubAccount: true },
  });

  if (!agencyDetails) return null;
  const subAccounts = agencyDetails.SubAccount;

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <SubAccountDetails
          agencyDetails={agencyDetails}
          details={subAccount}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="subaccount"
          id={params.subaccountId}
          subAccounts={subAccounts}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  );
};

export default SubaccountSettingPage;