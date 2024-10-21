import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CommandItem } from "@/components/ui/command";
import {
    Command,
    CommandInput,
    CommandList,
    CommandGroup,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LaneDetail, PipelineDetailsWithLanesCardsTagsTickets } from "@/lib/types";
import { getPipelineDetails } from "@/lib/queries";

interface PipelineFilterProps {
    pipelineId: string;
    lanesDetails: LaneDetail[];
    pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
}

const FilterPopover: React.FC<PipelineFilterProps> = ({
    pipelineId,
    lanesDetails,
}) => {

    //   const [allLanes, setAllLanes] = useState<LaneDetail[]>([]); //basically have the LaneDetail array
    //   console.log("Lane Details from filter", allLanes);
    // const pipelineDetails = getPipelineDetails(pipelineId);
    // console.log("Pipeline Details from filter", pipelineDetails)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="flex gap-2 items-center bg-zinc-600 hover:bg-zinc-700">
                    <Filter size={15} />
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 mr-10"
                sideOffset={20}
            >
                <Command className="rounded-lg border shadow-md">
                    <div className="flex items-center border-b px-3">
                        <h3 className="flex-1 text-sm font-semibold">Filter</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="p-3">
                        <h4 className="text-sm font-medium mb-2">Keyword</h4>
                        <CommandInput placeholder="Enter a keyword..." className="h-9" />
                        <p className="text-xs text-muted-foreground mt-2 mb-4">
                            Search cards, members, labels, and more.
                        </p>
                        <CommandList>
                            <CommandGroup heading="Members">
                                <CustomCommandItem>
                                    <Checkbox id="no-members" />
                                    <label
                                        htmlFor="no-members"
                                        className="flex items-center gap-2 ml-2"
                                    >
                                        <span className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                                            👤
                                        </span>
                                        No members
                                    </label>
                                </CustomCommandItem>
                                <CustomCommandItem>
                                    <Checkbox id="assigned-to-me" />
                                    <label
                                        htmlFor="assigned-to-me"
                                        className="flex items-center gap-2 ml-2"
                                    >
                                        <span className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                            ME
                                        </span>
                                        Cards assigned to me
                                    </label>
                                </CustomCommandItem>
                            </CommandGroup>
                            <CommandGroup heading="Due date">
                                <CustomCommandItem>
                                    <Checkbox id="no-dates" />
                                    <label
                                        htmlFor="no-dates"
                                        className="flex items-center gap-2 ml-2"
                                    >
                                        <span className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                                            📅
                                        </span>
                                        No dates
                                    </label>
                                </CustomCommandItem>
                                <CustomCommandItem>
                                    <Checkbox id="overdue" />
                                    <label
                                        htmlFor="overdue"
                                        className="flex items-center gap-2 ml-2"
                                    >
                                        <span className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                                            ⏰
                                        </span>
                                        Overdue
                                    </label>
                                </CustomCommandItem>
                                <CustomCommandItem>
                                    <Checkbox id="due-next-day" />
                                    <label
                                        htmlFor="due-next-day"
                                        className="flex items-center gap-2 ml-2"
                                    >
                                        <span className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                            ⏰
                                        </span>
                                        Due in the next day
                                    </label>
                                </CustomCommandItem>
                            </CommandGroup>
                        </CommandList>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const CustomCommandItem = ({
    children,
    className,
    ...props
}: React.ComponentProps<typeof CommandItem>) => (
    <CommandItem
        className={cn(
            "flex items-center px-2 py-1 cursor-pointer",
            "aria-selected:bg-transparent",
            "data-[highlighted]:bg-transparent",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            className
        )}
        {...props}
    >
        {children}
    </CommandItem>
);

export default FilterPopover;
