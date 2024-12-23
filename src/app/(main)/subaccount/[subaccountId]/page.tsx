import BlurPage from '@/components/global/blur-page'
import PipelineValue from '@/components/global/pipeline-value'
import SubaccountFunnelChart from '@/components/global/subaccount-funnel-chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { db } from '@/lib/db'
import { Contact2 } from 'lucide-react'
import React from 'react'

// Props type definition for the page component
type Props = {
  params: { subaccountId: string } // URL parameter for subaccount ID
  searchParams: { // Query parameter for any additional codes
    code: string
  }
}

const SubaccountPageId = async ({ params, searchParams }: Props) => {
  
  //Fetch all funnels for the subaccount, including their pages.
  const funnels = await db.funnel.findMany({
    where: {
      subAccountId: params.subaccountId,
    },
    include: {
      FunnelPages: true, // Include related funnel pages
    },
  })

  // Transform funnel data to include total visits for each funnel
  // Calculate total visits for each funnel.
  const funnelPerformanceMetrics = funnels.map((funnel) => ({
    ...funnel,
    totalFunnelVisits: funnel.FunnelPages.reduce(
      (total, page) => total + page.visits,
      0
    ),
  }))

  return (
    <BlurPage>
      <div className="relative h-full">
        <div className="flex flex-col gap-4 pb-6">
          {/* Pipeline Visualization Section */}
          <div className="w-full">
            <PipelineValue subaccountId={params.subaccountId} />
          </div>

          {/* Funnel Performance Section */}
          <div className="w-full">
            <SubaccountFunnelChart data={funnelPerformanceMetrics} />
          </div>
        </div>
      </div>
    </BlurPage>
  )
}

export default SubaccountPageId
