"use client"; // This file is a client-side component
import { getPipelines } from "@/lib/queries"; // Import the getPipelines function from the queries library
import { Prisma } from "@prisma/client"; // Import Prisma types from the Prisma client
import React, { useEffect, useMemo, useState } from "react"; // Import React and necessary hooks
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card"; // Import Card components from the UI library
import { Progress } from "../ui/progress"; // Import Progress component from the UI library
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select"; // Import Select components from the UI library

// Define the Props type with a single property 'subaccountId' of type string
type Props = {
  subaccountId: string;
};

// Define the PipelineValue component, which takes 'subaccountId' as a prop
const PipelineValue = ({ subaccountId }: Props) => {
  // State to store the fetched pipelines
  const [pipelines, setPipelines] = useState<
    Prisma.PromiseReturnType<typeof getPipelines>
  >([]);

  // State to store the selected pipeline ID
  const [selectedPipelineId, setselectedPipelineId] = useState("");
  // State to store the value of tickets in the last lane of the selected pipeline
  const [pipelineClosedValue, setPipelineClosedValue] = useState(0);
  // State to store the total value of all tickets in the selected pipeline
  const [totalPipelineValue, setTotalPipelineValue] = useState(0);
  // State to store the total closed value for all pipelines
  const [totalClosedValue, setTotalClosedValue] = useState(0);
  // State to store the total value of all tickets for all pipelines
  const [totalValueAllPipelines, setTotalValueAllPipelines] = useState(0);

  // useEffect to fetch pipelines when the component mounts or subaccountId changes
  useEffect(() => {
    const fetchData = async () => {
      const res = await getPipelines(subaccountId); // Fetch pipelines using the subaccountId
      setPipelines(res); // Set the fetched pipelines to the state
      setselectedPipelineId(res[0]?.id); // Set the first pipeline ID as the selected pipeline ID
    };
    fetchData();
  }, [subaccountId]); // Dependency array to re-run the effect when subaccountId changes

  // useEffect to calculate the total pipeline value and pipelineClosedValue whenever selectedPipelineId or pipelines change
  useEffect(() => {
    let closedValue = 0;
    let totalValue = 0;
    let totalClosedValueAllPipelines = 0;
    let totalValueAllPipelines = 0;

    if (pipelines.length) {
      pipelines.forEach((pipeline) => {
        let pipelineClosedValue = 0;
        let pipelineTotalValue = 0;

        // Sort lanes by their order
        const sortedLanes = [...pipeline.Lane].sort(
          (a, b) => a.order - b.order
        );
        sortedLanes.forEach((lane, laneIndex) => {
          const laneTicketsTotal = lane.Tickets.reduce(
            (totalTickets, ticket) => {
              // Sum the value of all tickets
              const ticketValue = Number(ticket?.value);
              return totalTickets + ticketValue;
            },
            0
          );
          pipelineTotalValue += laneTicketsTotal; // Add the lane's ticket total to the total value
          // Check if the lane is the last lane
          if (laneIndex === sortedLanes.length - 1) {
            pipelineClosedValue = laneTicketsTotal; // Set the closed value for the last lane
          }
        });

        // Add to total values for all pipelines
        totalClosedValueAllPipelines += pipelineClosedValue;
        totalValueAllPipelines += pipelineTotalValue;

        // If this is the selected pipeline, set the state for it
        if (pipeline.id === selectedPipelineId) {
          closedValue = pipelineClosedValue;
          totalValue = pipelineTotalValue;
        }
      });

      setPipelineClosedValue(closedValue); // Set the closed value for the selected pipeline
      setTotalPipelineValue(totalValue); // Set the total value of all tickets in the selected pipeline
      setTotalClosedValue(totalClosedValueAllPipelines); // Set the total closed value for all pipelines
      setTotalValueAllPipelines(totalValueAllPipelines); // Set the total value of all tickets for all pipelines
    }
  }, [selectedPipelineId, pipelines]); // Dependency array to re-run the calculation when selectedPipelineId or pipelines change

  // useMemo to calculate the pipeline rate whenever pipelineClosedValue or totalPipelineValue change
  const pipelineRate = useMemo(
    () => (pipelineClosedValue / totalPipelineValue) * 100,
    [pipelineClosedValue, totalPipelineValue]
  );

  // useMemo to calculate the total pipeline rate whenever totalClosedValue or totalValueAllPipelines change
  const totalPipelineRate = useMemo(
    () => (totalClosedValue / totalValueAllPipelines) * 100,
    [totalClosedValue, totalValueAllPipelines]
  );

  // Render the component
  return (
    <Card className="relative w-full xl:w-[350px]">
      <CardHeader>
        <CardDescription className="text-black font-semibold dark:text-white">
          Current Pipeline Value
        </CardDescription>
        <small className="text-xs dark:text-gray-400  text-muted-foreground">
          Pipeline Progress
        </small>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs dark:text-gray-300  text-muted-foreground">
              Closed ${pipelineClosedValue}
            </p>
          </div>
          <div>
            <p className="text-xs dark:text-gray-300  text-muted-foreground">
              Total ${totalPipelineValue}
            </p>
          </div>
        </div>
        <Progress
          color="green"
          indicatorColor="bg-blue-300"
          value={pipelineRate}
          className="h-2"
        />
      </CardHeader>
      <CardHeader>
        <CardDescription className="text-black font-semibold dark:text-white">
          Total Pipeline Value
        </CardDescription>
        <small className="text-xs dark:text-gray-400  text-muted-foreground">
          Total Pipeline Progress
        </small>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs dark:text-gray-300  text-muted-foreground">
              Closed ${totalClosedValue}
            </p>
          </div>
          <div>
            <p className="text-xs dark:text-gray-300  text-muted-foreground">
              Total ${totalValueAllPipelines}
            </p>
          </div>
        </div>
        <Progress
          color="blue"
          indicatorColor="bg-blue-600"
          value={totalPipelineRate}
          className="h-2"
        />
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-2">
          Total value of all tickets in the given pipeline except the last lane.
          Your last lane is considered your closing lane in every pipeline.
        </p>
        <Select
          value={selectedPipelineId}
          onValueChange={setselectedPipelineId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a pipeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pipelines</SelectLabel>
              {pipelines.map((pipeline) => (
                <SelectItem value={pipeline.id} key={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

// Export the PipelineValue component as the default export
export default PipelineValue;
