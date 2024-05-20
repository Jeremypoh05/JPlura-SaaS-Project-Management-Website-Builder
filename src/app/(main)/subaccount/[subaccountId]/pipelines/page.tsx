import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: { subaccountId: string };
};

//If the subAccountId in the params object matches with an existing pipeline's subAccountId in the database, then pipelineExists
const Pipelines = async ({ params }: Props) => {
  const pipelineExists = await db.pipeline.findFirst({
    where: { subAccountId: params.subaccountId },
  });

  //if exists, we will redirect, the pipelineExits.id will be the pipeline.id 
  if (pipelineExists)
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${pipelineExists.id}`
    );

    //If no pipeline exists for a given subaccount, the Pipelines component attempts to create a new pipeline with the name "First Pipeline" and redirects to the details page of the newly created pipeline.
    //but probably will not use this logic, because already have created in upsertSubaccount query. 
    try {
    const response = await db.pipeline.create({
      data: { name: "First Pipeline", subAccountId: params.subaccountId },
    });

    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${response.id}`
    );
  } catch (error) {
    console.log();
  }

  return <div>Pipelines</div>;
};

export default Pipelines;
