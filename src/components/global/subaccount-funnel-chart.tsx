"use client"; // This file is a client-side component
import { DonutChart } from "@tremor/react"; // Import the DonutChart component from the Tremor library
import React from "react"; // Import React

// Define the Props type with a single property 'data' of any type
type Props = { data: any };

// Define the SubaccountFunnelChart component, which takes 'data' as a prop
const SubaccountFunnelChart = ({ data }: Props) => {
  return (
    // Container div with styling classes
    <div className="h-fit flex transition-all items-start">
      {/* Render the DonutChart component with various props */}
      <DonutChart
        className="h-60 w-60" // Set height and width of the chart
        data={data} // Pass the data prop to the chart
        category="totalFunnelVisits" // Specify the category field in the data
        index="name" // Specify the index field in the data
        colors={["blue-400", "primary", "blue-600", "blue-700", "blue-800"]} // Define the colors for the chart segments
        showAnimation={true} // Enable animations
        customTooltip={customTooltip} // Use a custom tooltip component
        variant="pie" // Specify the variant of the chart (pie chart)
      />
    </div>
  );
};

// Export the SubaccountFunnelChart component as the default export
export default SubaccountFunnelChart;

const customTooltip = ({
  payload,
  active,
}: {
  payload: any;
  active: boolean;
}) => {
  if (!active || !payload) return null;

  const categoryPayload = payload?.[0];
  if (!categoryPayload) return null;
  return (
    <div className="ml-[100px] dark:text-white text-black w-fit dark:bg-muted/60 backdrop-blur-md bg-background/60 !rounded-lg p-2 shadow-2xl">
      <div className="flex items-center flex-1 space-x-2.5">
        <div
          className={`w-5 h-5 rounded-full  bg-${categoryPayload?.color} rounded`}
        />
        <div className="w-full">
          <div className="flex items-center justify-between space-x-8">
            <p className="text-right whitespace-nowrap">
              {categoryPayload.name}
            </p>
            <p className="font-medium text-right whitespace-nowrap ">
              {categoryPayload.value}
            </p>
          </div>
        </div>
      </div>
      {categoryPayload.payload.FunnelPages?.map((page: any) => (
        <div
          key={page.id}
          className="dark:text-white/70 text-black flex justify-between items-center"
        >
          <small>{page.name}</small>
          <small>{page.visits}</small>
        </div>
      ))}
    </div>
  );
};
