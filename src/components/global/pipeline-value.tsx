"use client";

import React, { useEffect, useMemo, useState } from "react"; // Import React and necessary hooks
import { getPipelines } from "@/lib/queries"; // Import the getPipelines function from the queries library
import { Prisma } from "@prisma/client"; // Import Prisma types from the Prisma client
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"; // Import Card components from the UI library
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
import { BarChart, DonutChart } from "@tremor/react";
import { AlertCircle, BarChart2, CheckCircle2, CircleDollarSign, ListFilter, PieChart, Ticket, TrendingUp } from "lucide-react";

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
  const [laneData, setLaneData] = useState<any[]>([]);

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
    let currentLaneData: any[] = [];

    if (pipelines.length) {
      pipelines.forEach((pipeline) => {
        let pipelineClosedValue = 0;
        let pipelineTotalValue = 0;

        // If this is the selected pipeline, prepare lane data for visualization
        if (pipeline.id === selectedPipelineId) {
          const sortedLanes = [...pipeline.Lane].sort(
            (a, b) => a.order - b.order
          );

          // Transform lane data for visualization
          currentLaneData = sortedLanes.map((lane) => {
            const laneValue = lane.Tickets.reduce(
              (total, ticket) => total + Number(ticket?.value || 0),
              0
            );
            return {
              name: lane.name,
              value: laneValue,
              tickets: lane.Tickets.length,
              order: lane.order,
            };
          });
          setLaneData(currentLaneData);
        }

        // Sort lanes by their order
        const sortedLanes = [...pipeline.Lane].sort(
          (a, b) => a.order - b.order
        );
        sortedLanes.forEach((lane, laneIndex) => {
          // Calculate total value of tickets in this lane
          const laneTicketsTotal = lane.Tickets.reduce(
            (totalTickets, ticket) => {
              // Sum the value of all tickets
              const ticketValue = Number(ticket?.value);
              return totalTickets + ticketValue;
            },
            0
          );
          pipelineTotalValue += laneTicketsTotal; // Add the lane's ticket total to the total value

          // Last lane is considered the "closed" lane
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

      // Update all state values
      setPipelineClosedValue(closedValue); // Set the closed value for the selected pipeline
      setTotalPipelineValue(totalValue); // Set the total value of all tickets in the selected pipeline
      setTotalClosedValue(totalClosedValueAllPipelines); // Set the total closed value for all pipelines
      setTotalValueAllPipelines(totalValueAllPipelines); // Set the total value of all tickets for all pipelines
    }
  }, [selectedPipelineId, pipelines]); // Dependency array to re-run the calculation when selectedPipelineId or pipelines change

  // useMemo to calculate the pipeline rate whenever pipelineClosedValue or totalPipelineValue change
  const pipelineRate = useMemo(
    () => (pipelineClosedValue / totalPipelineValue) * 100 || 0,
    [pipelineClosedValue, totalPipelineValue]
  );

  // useMemo to calculate the total pipeline rate whenever totalClosedValue or totalValueAllPipelines change
  const totalPipelineRate = useMemo(
    () => (totalClosedValue / totalValueAllPipelines) * 100 || 0,
    [totalClosedValue, totalValueAllPipelines]
  );

  // Get currently selected pipeline details
  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  // Render the component
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pipeline Overview Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pipeline Overview</CardTitle>
              <CardDescription>
                Select a pipeline to view details
              </CardDescription>
            </div>
            {/* Pipeline selector */}
            <Select
              value={selectedPipelineId}
              onValueChange={setselectedPipelineId}
            >
              <SelectTrigger className="w-[200px]">
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
          </div>
        </CardHeader>
        <CardContent>
          {/* Bar chart showing value distribution across lanes */}
          <div className="h-80">
            <BarChart
              data={laneData}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              yAxisWidth={60}
            />
          </div>
          {/* Explanation*/}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Note: Total value calculations exclude the last lane of each
                pipeline, as it is considered your closing lane. The closing
                lane value is tracked separately as Closed Value to accurately
                measure pipeline progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Pipeline Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Current Pipeline Progress</CardTitle>
          <CardDescription>
            {selectedPipeline?.name || "Select a pipeline"} (Last lane is counted as closing lane)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Donut chart for current pipeline */}
            <DonutChart
              data={[
                { name: "Closed", value: pipelineClosedValue },
                {
                  name: "In Progress",
                  value: totalPipelineValue - pipelineClosedValue,
                },
              ]}
              category="value"
              index="name"
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              colors={["green", "blue"]}
              className="h-40"
            />
            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">
                  {pipelineRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={pipelineRate}
                indicatorColor="bg-green-500"
                className="h-2"
              />
            </div>
            {/* Value breakdown with icons and better visualization */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-muted/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-muted-foreground">Closed Value</p>
                </div>
                <p className="text-2xl font-bold">${pipelineClosedValue.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    {((pipelineClosedValue / totalPipelineValue) * 100).toFixed(1)}% of total
                  </span>
                </div>
              </div>
              <div className="p-4 bg-muted/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
                <p className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Ticket className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    {laneData.reduce((sum, lane) => sum + lane.tickets, 0)} active tickets
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Pipelines Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Pipelines Status</CardTitle>
              <CardDescription className="mt-[6px]">Overview of all pipeline values</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Donut chart for all pipelines */}
            <DonutChart
              data={[
                { name: "Closed", value: totalClosedValue },
                { name: "In Progress", value: totalValueAllPipelines - totalClosedValue }
              ]}
              category="value"
              index="name"
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              colors={["green", "blue"]}
              className="h-40"
            />
            {/* Overall progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">
                  {totalPipelineRate.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={totalPipelineRate}
                indicatorColor="bg-green-500"
                className="h-2"
              />
            </div>
            {/* Value breakdown with improved visuals */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-muted/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDollarSign className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-muted-foreground">Total Closed</p>
                </div>
                <p className="text-2xl font-bold">
                  ${totalClosedValue.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    {((totalClosedValue / totalValueAllPipelines) * 100).toFixed(1)}% of total
                  </span>
                </div>
              </div>
              <div className="p-4 bg-muted/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
                <p className="text-2xl font-bold">
                  ${totalValueAllPipelines.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <ListFilter className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    Across {pipelines.length} pipelines
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export the PipelineValue component as the default export
export default PipelineValue;
