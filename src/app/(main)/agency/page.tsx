import AgencyDetails from '@/components/forms/agency-details'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { Plan } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string }
}) => {
  console.log("Page.tsx started") 
  console.log("Search Params:", searchParams)  

  const agencyId = await verifyAndAcceptInvitation()
  console.log("Agency ID:", agencyId)  

  //获取用户详细信息
  const user = await getAuthUserDetails()
  console.log("User details:", user) 

  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      console.log("Redirecting to /subaccount")
      return redirect('/subaccount')
    } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {
      if (searchParams.plan) {
        console.log(`Redirecting to /agency/${agencyId}/billing?plan=${searchParams.plan}`)
        return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`)
      }
      if (searchParams.state && searchParams.code) {
        const statePath = searchParams.state.split('___')[0]
        const stateAgencyId = searchParams.state.split('___')[1]
        console.log("State Path:", statePath)
        console.log("State Agency ID:", stateAgencyId)
        if (!stateAgencyId) {
          console.log("Not authorized: Missing stateAgencyId")
          return <div>Not authorized</div>
        }

        console.log(`Redirecting to /agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`)
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        )
      } else {
        console.log(`Redirecting to /agency/${agencyId}`)
        return redirect(`/agency/${agencyId}`)
      }
    } else {
      console.log("Not authorized: Invalid user role")
      return <div>Not authorized</div>
    }
  }

  const authUser = await currentUser()
  console.log("Auth user:", authUser)  

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Agency</h1>
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  )
}

export default Page
