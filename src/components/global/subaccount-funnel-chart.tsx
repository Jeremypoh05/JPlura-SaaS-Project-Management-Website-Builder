"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DonutChart, BarChart } from "@tremor/react";
import {
  Eye,
  MousePointerClick,
  Layout,
  FileText,
  LinkIcon,
  Globe,
} from "lucide-react";
import React, { useMemo } from "react";

type Props = { data: any };

const SubaccountFunnelChart = ({ data }: Props) => {
  // Step 1: Calculate Basic Metrics using useMemo for performance
  /*
  Why useMemo?
  - Prevents recalculating metrics on every render
  - Only recalculates when 'data' changes
  - Improves performance for complex calculations
  */
  const metrics = useMemo(() => {
    // Step 1.1: Calculate total visits using reduce
    const totalVisits = data.reduce(
      (sum: number, funnel: any) => sum + funnel.totalFunnelVisits,
      0
    );

    /*
 How reduce works here:
 1. reduce takes two parameters:
    - A callback function: (sum, funnel) => sum + funnel.totalFunnelVisits
    - An initial value: 0
 
 2. For each funnel in data array:
    - sum: accumulates the running total
    - funnel: current funnel being processed
 
 Example iteration:
 data = [
   { totalFunnelVisits: 100 },
   { totalFunnelVisits: 150 },
   { totalFunnelVisits: 200 }
 ]
 Iteration 1: sum = 0, funnel.totalFunnelVisits = 100 → sum = 100
 Iteration 2: sum = 100, funnel.totalFunnelVisits = 150 → sum = 250
 Iteration 3: sum = 250, funnel.totalFunnelVisits = 200 → sum = 450
 */

    // Process each funnel to calculate detailed metrics
    // Step 1.2: Process each funnel using map
    const funnelMetrics = data.map((funnel: any) => {
      /*
   Why map?
   - Creates a new array with transformed data
   - Keeps original data immutable
   - Perfect for applying same transformation to each item
   */
      // Step 1.2.1: Sort pages using spread and sort
      const sortedPages = [...funnel.FunnelPages].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      /* 
          How sorting works:
          1. [...funnel.FunnelPages]: Creates a copy of array (immutability)
          2. sort((a, b) => (a.order || 0) - (b.order || 0)):
             - Compares two pages (a and b)
             - || 0: Provides default value if order is undefined
             - Negative result: a comes before b
             - Positive result: b comes before a
             - Zero: order stays the same
          
          Example:
          [
            { order: 2, name: 'about' },
            { order: 1, name: 'home' },
            { order: 3, name: 'contact' }
          ]
          
          Comparisons:
          1. (2 - 1): Positive, swap needed
          2. (3 - 2): Positive, keep order
          Result: [home, about, contact]
          */


      // Step 1.2.2: Calculate page metrics using map
      const pageMetrics = sortedPages.map((page: any) => ({
        name: page.name,
        visits: page.visits,
        // Calculate percentage of total funnel visits for this page
        visitShare: ((page.visits / funnel.totalFunnelVisits) * 100).toFixed(1),
        path: page.pathName || "/", // Page URL path
      }));
      /*
    How this map works:
    1. For each page, creates new object with:
       - Original properties (name, visits)
       - Calculated visitShare (percentage of total visits)
       - Path with default value
    2. toFixed(1): Formats percentage to 1 decimal place
    */

      // Step 1.2.3: Find most visited page using reduce
      const mostVisitedPage = pageMetrics.reduce(
        (max, page) => (page.visits > max.visits ? page : max),
        pageMetrics[0]
      );
      /*
   How this reduce works:
   1. Initial value: First page in array (pageMetrics[0])
   2. For each page:
      - Compare visits with current max
      - Return whichever has more visits
   
   Example iteration:
   pageMetrics = [
     { visits: 50, name: 'home' },
     { visits: 80, name: 'about' },
     { visits: 30, name: 'contact' }
   ]
   
   Iteration 1: max = {visits: 50}, page = {visits: 80} → max becomes {visits: 80}
   Iteration 2: max = {visits: 80}, page = {visits: 30} → max stays {visits: 80}
   */

      // Step 1.2.4: Similar logic for least visited page
      const leastVisitedPage = pageMetrics.reduce(
        (min, page) => (page.visits < min.visits ? page : min),
        pageMetrics[0]
      );

      return {
        name: funnel.name,
        metrics: pageMetrics,
        totalVisits: funnel.totalFunnelVisits,
        pageCount: pageMetrics.length,
        mostVisitedPage,
        leastVisitedPage,
        averageVisitsPerPage: Math.round(
          funnel.totalFunnelVisits / pageMetrics.length
        ),
      };
    });

    return { totalVisits, funnelMetrics };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Main Funnel Visualization Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Funnel Performance</CardTitle>
              <CardDescription>Traffic flow analysis</CardDescription>
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-8 items-center">
              <DonutChart
                className="h-60 w-60"
                data={data}
                category="totalFunnelVisits"
                index="name"
                colors={[
                  "blue-400",
                  "primary",
                  "blue-600",
                  "blue-700",
                  "blue-800",
                ]}
                showAnimation={true}
                customTooltip={customTooltip}
                variant="pie"
              />
              <div className="flex-1">
                <BarChart
                  className="h-60"
                  data={metrics.funnelMetrics}
                  index="name"
                  categories={["totalVisits"]}
                  colors={["blue"]}
                  valueFormatter={(value) => value.toLocaleString()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overview Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Total Visits Metric */}
              <div className="flex items-center gap-4 p-4 bg-muted/60 rounded-lg">
                <Eye className="h-8 w-8 text-blue-500 p-1.5 bg-blue-500/10 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="text-2xl font-bold">
                    {metrics.totalVisits.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Active Funnels */}
              <div className="flex items-center gap-4 p-4 bg-muted/60 rounded-lg">
                <MousePointerClick className="h-8 w-8 text-green-500 p-1.5 bg-green-500/10 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Funnels
                  </p>
                  <p className="text-2xl font-bold">{data.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Funnel Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.funnelMetrics.map((funnel: any, index: number) => (
                <div key={index} className="p-4 bg-muted/60 rounded-lg">
                  {/* Funnel Name and Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layout className="h-5 w-5 text-blue-500" />
                      <p className="font-medium">{funnel.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{funnel.pageCount} pages</span>
                    </div>
                  </div>

                  {/* Page Stats */}
                  <div className="space-y-3">
                    {funnel.metrics.map((page: any, pageIndex: number) => (
                      <div
                        key={pageIndex}
                        className="grid grid-cols-3 gap-2 text-sm"
                      >
                        {/* Page Name */}
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full bg-blue-${
                              (pageIndex + 4) * 100
                            }`}
                          />
                          <span className="text-muted-foreground truncate">
                            {page.name}
                          </span>
                        </div>
                        {/* Visit Count */}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-blue-500" />
                          <span>{page.visits.toLocaleString()} visits</span>
                        </div>
                        {/* Visit Share */}
                        <div className="flex items-center gap-1 justify-end">
                          <LinkIcon className="h-3 w-3 text-muted-foreground" />
                          <span>{page.visitShare}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Funnel Summary */}
                  <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Most Visited:</p>
                        <p className="font-medium truncate">
                          {funnel.mostVisitedPage.name} (
                          {funnel.mostVisitedPage.visits})
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Avg. Visits/Page:
                        </p>
                        <p className="font-medium">
                          {funnel.averageVisitsPerPage.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Custom tooltip implementation remains the same
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
    <div className="absolute left-full ml-2 top-6 dark:text-white text-black w-fit dark:bg-muted/60 backdrop-blur-md bg-background/60 !rounded-lg p-2 shadow-2xl">
      <div className="flex items-center flex-1 space-x-2.5">
        <div
          className={`w-5 h-5 rounded-full bg-${categoryPayload?.color} rounded`}
        />
        <div className="w-full">
          <div className="flex items-center justify-between space-x-8">
            <p className="text-right whitespace-nowrap font-medium">
              {categoryPayload.name}
            </p>
            <p className="font-medium text-right whitespace-nowrap">
              {categoryPayload.value.toLocaleString()} visits
            </p>
          </div>
        </div>
      </div>
      {categoryPayload.payload.FunnelPages?.map((page: any) => (
        <div
          key={page.id}
          className="dark:text-white/70 text-black flex justify-between items-center mt-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <small>{page.name}</small>
          </div>
          <small className="ml-4">{page.visits.toLocaleString()} visits</small>
        </div>
      ))}
    </div>
  );
};

export default SubaccountFunnelChart;
