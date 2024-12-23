"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, DonutChart, AreaChart } from "@tremor/react";
import {
  Building2,
  TrendingUp,
  Target,
  Users,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Agency, Prisma, SubAccount } from "@prisma/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useMemo } from "react";

// Define types for our metrics
interface PipelineMetric {
  name: string;
  totalValue: number;
  closedValue: number;
}

// Define props type with nested data structure
interface DashboardProps {
  agencyDetails: Agency & {
    SubAccount: (SubAccount & {
      Pipeline: {
        Lane: {
          Tickets: {
            value: Prisma.Decimal | null;  // Changed from number to Prisma.Decimal
          }[];
        }[];
      }[];
      Funnels: {
        FunnelPages: {
          visits: number;
        }[];
      }[];
    })[];
  };
}


const AgencyDashboard = ({ agencyDetails }: DashboardProps) => {
  // Use useMemo to calculate all metrics to prevent unnecessary recalculations
  const { subaccountMetrics, pipelineMetrics, growthData, growthRate, clientAnalysis } =
    useMemo(() => {
      // Step 1: Sort subaccounts chronologically for growth tracking
      const sortedSubaccounts = [...agencyDetails.SubAccount].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Create daily growth tracking
      const dailyGrowth = new Map<string, {
        count: number,
        total: number,
        dateObj: Date
      }>();

      sortedSubaccounts.forEach((subaccount) => {
        const date = new Date(subaccount.createdAt);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        const existing = dailyGrowth.get(dateKey) || {
          count: 0,
          total: 0,
          dateObj: date
        };

        existing.count += 1;
        dailyGrowth.set(dateKey, existing);
      });

      // Step 3: Convert monthly data to cumulative growth array
      // Convert to cumulative growth array with both daily and monthly data
      let cumulative = 0;
      const growthData = Array.from(dailyGrowth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, data]) => {
          cumulative += data.count;
          data.total = cumulative;
          return {
            date: dateKey,
            month: data.dateObj.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
            day: data.dateObj.getDate(),
            clients: cumulative,
            newClients: data.count
          };
        });

      // Step 4: Calculate pipeline metrics for each subaccount
      const pipelineMetrics = agencyDetails.SubAccount.map((subaccount) => {
        let totalValue = 0;
        let closedValue = 0;

        // Calculate total and closed values from all pipelines
        subaccount.Pipeline.forEach((pipeline) => {
          pipeline.Lane.forEach((lane, laneIndex, lanes) => {
            // Sum all ticket values in this lane
            const laneValue = lane.Tickets.reduce(
              (sum, ticket) => sum + (Number(ticket.value) || 0),
              0
            );

            totalValue += laneValue;
            // Last lane represents closed deals
            if (laneIndex === lanes.length - 1) {
              closedValue += laneValue;
            }
          });
        });

        return {
          name: subaccount.name,
          totalValue,
          closedValue,
        };
      });

      // Step 5: Create combined metrics for each subaccount
      const subaccountMetrics = pipelineMetrics.map((metric) => {
        const subaccount = agencyDetails.SubAccount.find(
          (sa) => sa.name === metric.name
        )!;

        // Calculate total funnel visits for this subaccount
        const funnelVisits = subaccount.Funnels.reduce((total, funnel) => {
          return (
            total +
            funnel.FunnelPages.reduce((pageTotal, page) => {
              return pageTotal + page.visits;
            }, 0)
          );
        }, 0);

        return {
          name: metric.name,
          pipelineValue: metric.totalValue,
          closedValue: metric.closedValue,
          funnelVisits,
        };
      });

      // Step 6: Calculate overall growth rate
      const growthRate = (agencyDetails.SubAccount.length / agencyDetails.goal) * 100;


      // Calculate client analysis metrics
      // Calculate enhanced client analysis metrics
      const clientAnalysis = agencyDetails.SubAccount.map(subaccount => {
        // Calculate pipeline metrics
        const pipelineMetrics = subaccount.Pipeline.reduce((acc, pipeline) => {
          let pipelineTotal = 0;
          let pipelineClosed = 0;

          pipeline.Lane.forEach((lane, laneIndex, lanes) => {
            const laneValue = lane.Tickets.reduce((sum, ticket) =>
              sum + (Number(ticket.value) || 0), 0);

            // Add to total
            pipelineTotal += laneValue;
            // If last lane, add to closed value
            if (laneIndex === lanes.length - 1) {
              pipelineClosed += laneValue;
            }
          });

          return {
            totalValue: acc.totalValue + pipelineTotal,
            closedValue: acc.closedValue + pipelineClosed,
            activeTickets: acc.activeTickets + pipeline.Lane.reduce((sum, lane) =>
              sum + lane.Tickets.length, 0),
            activePipelines: acc.activePipelines + 1
          };
        }, {
          totalValue: 0,
          closedValue: 0,
          activeTickets: 0,
          activePipelines: 0
        });

        // Calculate funnel engagement
        const funnelEngagement = subaccount.Funnels.reduce((acc, funnel) => {
          const totalVisits = funnel.FunnelPages.reduce((sum, page) => sum + page.visits, 0);
          return {
            totalFunnels: acc.totalFunnels + 1,
            totalVisits: acc.totalVisits + totalVisits,
          };
        }, {
          totalFunnels: 0,
          totalVisits: 0
        });

        return {
          name: subaccount.name,
          ...pipelineMetrics,
          ...funnelEngagement,
          createdAt: subaccount.createdAt,
          closeRate: pipelineMetrics.totalValue > 0
            ? (pipelineMetrics.closedValue / pipelineMetrics.totalValue) * 100
            : 0
        };
      })
        .sort((a, b) => b.totalValue - a.totalValue); // Sort by total value

      return {
        subaccountMetrics, pipelineMetrics, growthData, growthRate, clientAnalysis
      };
    }, [agencyDetails]);

  return (
    <div className="relative h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Agency Overview</h1>
        <div className="flex items-center gap-2 bg-muted/60 p-2 rounded-lg">
          <Users className="h-5 w-5" />
          <span className="font-medium">
            {agencyDetails.SubAccount.length} Active Clients/Branches
          </span>
          <span className="text-muted-foreground">
            of {agencyDetails.goal} Goal
          </span>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Growth Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clients/Branches Growth Progress</CardTitle>
            <CardDescription>Historical clients/branches acquisition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <AreaChart
                className="h-64"
                data={growthData}
                index="date"
                categories={["clients"]}
                colors={["blue"]}
                showAnimation={true}
                showLegend={false}
                yAxisWidth={60}
                customTooltip={({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
                      <p className="font-medium mb-1">
                        {new Date(data.date).toLocaleDateString('default', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          Total Clients/Branches: <span className="font-medium">{data.clients}</span>
                        </p>
                        {data.newClients > 0 && (
                          <p className="text-sm text-green-500">
                            +{data.newClients} new {data.newClients === 1 ? 'client/branch' : 'clients/branches'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
                valueFormatter={(value: number) => `${value}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Client acquisition target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <DonutChart
                data={[
                  { name: "Current", value: agencyDetails.SubAccount.length },
                  {
                    name: "Remaining",
                    value: Math.max(
                      0,
                      agencyDetails.goal - agencyDetails.SubAccount.length
                    ),
                  },
                ]}
                index="name"
                category="value"
                colors={["blue", "gray"]}
                className="h-40"
                showAnimation={true}
              />
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold">{Math.round(growthRate)}%</p>
                <p className="text-sm text-muted-foreground">
                  of target reached
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Pipeline Value Chart - 8 columns */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Pipeline Value by Subaccount</CardTitle>
            <CardDescription>
              Total and closed values per client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-[400px]"
              data={pipelineMetrics}
              index="name"
              categories={["totalValue", "closedValue"]}
              colors={["blue", "green"]}
              stack={false}
              showAnimation={true}
              valueFormatter={(value: number) => `$${value.toLocaleString()}`}
              layout="vertical"
              showLegend={false}
              yAxisWidth={100}
            />
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Total Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Closed Value</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Activity - 4 columns */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Funnel Activity</CardTitle>
            <CardDescription>Total visits across all funnels</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-[400px]"
              data={subaccountMetrics}
              index="name"
              category="funnelVisits"
              colors={["blue", "cyan", "indigo"]}
              valueFormatter={(value: number) =>
                `${value.toLocaleString()} visits`
              }
              showAnimation={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Performing Clients Card */}
        <Card>
          <CardHeader>
            <CardTitle>Top 3 Clients/Branches</CardTitle>
            <CardDescription>Leading performers by pipeline value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {clientAnalysis.slice(0, 3).map((client, index) => {
                // Define ranking styles with proper typing
                const getRankingStyle = (position: number): string => {
                  switch (position) {
                    case 0:
                      return "bg-yellow-500/10 text-yellow-500"; // Gold
                    case 1:
                      return "bg-gray-300/10 text-gray-400";    // Silver
                    case 2:
                      return "bg-amber-600/10 text-amber-600";  // Bronze
                    default:
                      return "bg-gray-500/10 text-gray-500";    // Fallback
                  }
                };

                // Get border style for top performer
                const getBorderStyle = (position: number): string => {
                  switch (position) {
                    case 0:
                      return 'border-2 border-yellow-500/20'; // Gold
                    case 1:
                      return 'border-2 border-gray-400/20';   // Silver
                    case 2:
                      return 'border-2 border-amber-600/20';  // Bronze
                    default:
                      return '';
                  }
                };

                return (
                  <div
                    key={client.name}
                    className={`relative p-6 bg-muted/60 rounded-lg space-y-4 ${getBorderStyle(index)}`}
                  >
                    {/* Header with Rank */}
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getRankingStyle(index)} 
                flex items-center justify-center font-bold text-lg`}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.activePipelines} {client.activePipelines === 1 ? 'pipeline' : 'pipelines'} •
                          {client.totalFunnels} {client.totalFunnels === 1 ? 'funnel' : 'funnels'}
                        </p>
                      </div>
                    </div>

                    {/* Value Metrics */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Pipeline</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-bold">
                            ${client.totalValue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Closed Value</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl font-bold text-green-500">
                            ${client.closedValue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-muted-foreground/20">
                      <div>
                        <p className="text-xs text-muted-foreground">Close Rate</p>
                        <p className="text-sm font-medium">{client.closeRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Active Tickets</p>
                        <p className="text-sm font-medium">{client.activeTickets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Visits</p>
                        <p className="text-sm font-medium">{client.totalVisits.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Rank Badge - Only for #1 */}
                    {index === 0 && (
                      <div className="absolute -top-3 right-1 px-3 py-1 bg-yellow-500/10 
                rounded-full text-xs font-medium text-yellow-500 border border-yellow-500/20">
                        Top Performer
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Client Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Clients/Branches Engagement Overview</CardTitle>
            <CardDescription>Activity and performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* High-Level Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/60 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">Avg. Close Rate</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {(clientAnalysis.reduce((sum, client) =>
                      sum + client.closeRate, 0) / clientAnalysis.length).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-muted/60 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Total Activities</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {clientAnalysis.reduce((sum, client) =>
                      sum + client.activeTickets + client.totalVisits, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Client Age Distribution */}
              <div className="p-4 bg-muted/60 rounded-lg">
                <p className="text-sm font-medium mb-3">Client Age Distribution</p>
                <div className="space-y-3">
                  {[
                    {
                      label: '< 30 days', filter: (date: Date) =>
                        Date.now() - new Date(date).getTime() < 30 * 24 * 60 * 60 * 1000
                    },
                    {
                      label: '1-3 months', filter: (date: Date) => {
                        const age = Date.now() - new Date(date).getTime();
                        return age >= 30 * 24 * 60 * 60 * 1000 && age < 90 * 24 * 60 * 60 * 1000;
                      }
                    },
                    {
                      label: '3+ months', filter: (date: Date) =>
                        Date.now() - new Date(date).getTime() >= 90 * 24 * 60 * 60 * 1000
                    },
                  ].map(({ label, filter }) => {
                    const clientsInRange = clientAnalysis.filter(c => filter(c.createdAt));
                    const count = clientsInRange.length;
                    const percentage = (count / clientAnalysis.length) * 100;
                    const rangeValue = clientsInRange.reduce((sum, c) => sum + c.totalValue, 0);

                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{label}</span>
                          <span className="font-medium">{count} clients</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ${rangeValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="p-4 bg-muted/60 rounded-lg">
                <p className="text-sm font-medium mb-3">Activity Summary</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Pipelines</span>
                    <span className="font-medium">
                      {clientAnalysis.reduce((sum, c) => sum + c.activePipelines, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Funnels</span>
                    <span className="font-medium">
                      {clientAnalysis.reduce((sum, c) => sum + c.totalFunnels, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Tickets</span>
                    <span className="font-medium">
                      {clientAnalysis.reduce((sum, c) => sum + c.activeTickets, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Cards Carousel */}
      <div className="relative px-12 py-6">
        <h2 className="text-2xl font-semibold mb-4">Clients/Branches Overview</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-10">
            {subaccountMetrics.map((metric, index) => (
              <CarouselItem
                key={index}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <Card className="p-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">
                        {metric.name}
                      </CardTitle>
                      <CheckCircle2
                        className={`h-5 w-5 ${metric.closedValue > 0
                          ? "text-green-500"
                          : "text-gray-300"
                          }`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">
                            Pipeline
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          <p className="text-end">${metric.pipelineValue.toLocaleString()}</p>
                          {metric.closedValue > 0 && (
                            <span className="text-green-500 text-xs ml-1">
                              (${metric.closedValue.toLocaleString()} closed)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">
                            Visits
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {metric.funnelVisits.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 hover:dark:bg-slate-600">
            <CarouselPrevious className="h-12 w-12" />
          </div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <CarouselNext className="h-12 w-12" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default AgencyDashboard;
