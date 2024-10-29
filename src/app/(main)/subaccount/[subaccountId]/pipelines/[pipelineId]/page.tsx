import { db } from "@/lib/db";
import { getLanesWithTicketAndTags, getPipelineDetails, updateLanesOrder, updateTicketsOrder } from "@/lib/queries";
import { LaneDetail } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PipelineInfoBar from "../_components/pipeline-inforbar";
import PipelineSettings from "../_components/pipleline-settings";
import PipelineView from "../_components/pipeline-view";

type Props = {
  params: { subaccountId: string; pipelineId: string };
};

const PipelinesPage = async ({ params }: Props) => {
  //pass the pipelineId from the URL parameters to the getPipelineDetails function.
  //e.g.,  URL might be something like /subaccount/123/pipeline/456. Then, params object will then have these URL parameters, such as { subaccountId: "123", pipelineId: "456" }.
  //When calling getPipelineDetails(params.pipelineId), means that params.pipelineId is "456" in this example. to the getPipelineDetails.
  //The getPipelineDetails function is defined to take an argument, which is the pipelineId. Here, pipelineIdd will be "456" (the value passed from params.pipelineId).
  //then, if match, it returns the result stored in the response from the query. Hence, here we will get every data.
  const pipelineDetails = await getPipelineDetails(params.pipelineId);
  console.log("pipelineDetails", pipelineDetails);

  if (!pipelineDetails)
    return redirect(`/subaccount/${params.subaccountId}/pipelines`);

  //we need this because we need a dropdown menu that shows all the pipelines.
  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: params.subaccountId },
  });

  const lanes = (await getLanesWithTicketAndTags(
    params.pipelineId
  )) as LaneDetail[];

  return (
    <Tabs defaultValue="view" className="w-full mt-[-10px]">
      <TabsList className="bg-transparent border-b-2 w-full h-13 justify-between mb-4">
        <PipelineInfoBar
          pipelineId={params.pipelineId}
          subAccountId={params.subaccountId}
          pipelines={pipelines}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={params.pipelineId}
          subaccountId={params.subaccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          subaccountId={params.subaccountId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PipelinesPage;
