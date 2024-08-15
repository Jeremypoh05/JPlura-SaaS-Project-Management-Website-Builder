import FunnelEditor from '@/app/(main)/subaccount/[subaccountId]/funnels/[funnelId]/editor/[funnelPageId]/_components/funnel-editor'
import { db } from '@/lib/db'
import { getDomainContent } from '@/lib/queries'
import EditorProvider from '@/providers/editor/editor-provider'
import { notFound } from 'next/navigation'
import React from 'react'

const Page = async ({
  params,
}: {
  params: { domain: string; path: string }
}) => {
  // Logging the received domain and path parameters
  console.log("Domain:", params.domain);
  console.log("Path:", params.path);

  // Fetching domain data
  const domainData = await getDomainContent(params.domain.slice(0, -1));
  console.log("Domain Data:", domainData);

  if (!domainData) {
    console.log("Domain data not found");
    return notFound();
  }

  // Finding the specific page data within the domain data
  const pageData = domainData?.FunnelPages.find(
    (page) => page.pathName === `${params.path}`
  );
  console.log("Page Data:", pageData);

  if (!pageData) {
    console.log("Page data not found");
    return notFound();
  }

  await db.funnelPage.update({
    where: {
      id: pageData.id,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
  });

  
  return (
    <EditorProvider
      subaccountId={domainData.subAccountId}
      pageDetails={pageData}
      funnelId={domainData.id}
    >
      <FunnelEditor funnelPageId={pageData.id} liveMode={true} />
    </EditorProvider>
  );
};

export default Page;