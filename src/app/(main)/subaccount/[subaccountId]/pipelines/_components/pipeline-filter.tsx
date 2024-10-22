import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandList, CommandGroup } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input"; // For the keyword input field
import { UserWithAgency } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FilterPopoverProps {
  onFilterChange: (filter: string) => void;
  currentUser: UserWithAgency | null;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  onFilterChange,
  currentUser,
}) => {
  // Track currently selected filter
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>(""); // State for the keyword input

  useEffect(() => {
    console.log("FilterPopover currentUser:", currentUser);
  }, [currentUser]);

  const handleFilterChange = (value: string) => {
    console.log("Filter changed to:", value);
    console.log("Current user when filtering:", currentUser)

    // Check if user is trying to use assigned_to_me filter while not logged in
    if (value === "assigned_to_me" && !currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to filter tickets assigned to you.",
        variant: "destructive",
      });
      return;
    }
    // Update local state and notify parent component
    setSelectedFilter(value);
    onFilterChange(value);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "flex gap-2 items-center",
            selectedFilter !== "all"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-zinc-600 hover:bg-zinc-700"
          )}
        >
          <Filter size={15} />
          Filter {selectedFilter !== "all" && "(Active)"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-10" sideOffset={20}>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <h3 className="flex-1 text-sm font-semibold">Filter</h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3">
            <CommandList>
              {/* Keyword Filter */}
              <CommandGroup heading="Keyword">
                <Input
                  placeholder="Enter keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="mb-2"
                />
              </CommandGroup>

              {/* All Tickets Filter */}
              <CommandGroup heading="All tickets">
                <RadioGroup
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>🎟️</span> {/* Emoji icon for All tickets */}
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex-1">
                      All tickets
                    </Label>
                  </div>
                </RadioGroup>
              </CommandGroup>

              {/* Members Filter */}
              <CommandGroup heading="Members">
                <RadioGroup
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>🙅‍♂️</span> {/* Emoji for No members */}
                    <RadioGroupItem value="no_members" id="no_members" />
                    <Label htmlFor="no_members" className="flex-1">
                      No members
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer ">
                    <span>👤</span> {/* Emoji for Assigned to me */}
                    <RadioGroupItem
                      value="assigned_to_me"
                      id="assigned_to_me"
                    />
                    <Label
                      htmlFor="assigned_to_me"
                      className={cn(
                        "flex-1",
                        !currentUser && "text-muted-foreground"
                      )}
                    >
                      Tickets assigned to me
                      {!currentUser && " (Login required)"}
                    </Label>
                  </div>
                </RadioGroup>
              </CommandGroup>

              {/* Due Date Filter */}
              <CommandGroup heading="Dates">
                <RadioGroup
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>📅</span> {/* Emoji for No dates */}
                    <RadioGroupItem value="no_dates" id="no_dates" />
                    <Label htmlFor="no_dates" className="flex-1">
                      No due date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>
                      ⏳
                    </span>
                    {/* Emoji for Overdue */}
                    <RadioGroupItem value="overdue" id="overdue" />
                    <Label htmlFor="overdue" className="flex-1">
                      Overdue
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>
                      ⏰
                    </span>
                    {/* Emoji for Due next day */}
                    <RadioGroupItem value="due_next_day" id="due_next_day" />
                    <Label htmlFor="due_next_day" className="flex-1">
                      Due in the next day
                    </Label>
                  </div>
                </RadioGroup>
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
