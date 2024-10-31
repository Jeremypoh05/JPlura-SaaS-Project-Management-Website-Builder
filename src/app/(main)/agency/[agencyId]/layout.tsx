  import BlurPage from '@/components/global/blur-page'
  import InfoBar from '@/components/global/infobar'
  import Sidebar from '@/components/sidebar'
  import SidebarToggle from '@/components/sidebar/sidebar-toggle'
  import Unauthorized from '@/components/unauthorized'
  import { getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries'
  import { currentUser } from '@clerk/nextjs'
  import { redirect } from 'next/navigation'
  import React from 'react'

  type Props = {
    children: React.ReactNode
    params: { agencyId: string }
  }

  const layout = async ({
    children,
    params,
  }: Props) => {

    const agencyId = await verifyAndAcceptInvitation();
    const user = await currentUser();

    if (!user) {
      return redirect('/');
    }

    if (!agencyId) {
      return redirect('/agency');
    }

    if (
      user.privateMetadata.role !== 'AGENCY_OWNER' &&
      user.privateMetadata.role !== 'AGENCY_ADMIN'
    ) {
      return <Unauthorized />
      //console.log('user', user.privateMetadata.role);
    }

    let allNoti: any = []
    const notifications = await getNotificationAndUser(agencyId);
    if (notifications) allNoti = notifications;

    return (
      <div className='h-screen overflow-hidden'>
        <Sidebar
          id={params.agencyId}
          type='agency'
        />
        <SidebarToggle>
          <InfoBar notifications={allNoti} role={allNoti.User?.role} />
          <div className='relative -ml-1'>
            <BlurPage>{children}</BlurPage>
          </div>
          </SidebarToggle>
      </div>
    )
  }

  export default layout