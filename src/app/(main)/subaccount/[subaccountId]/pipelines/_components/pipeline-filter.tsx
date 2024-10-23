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
import { Input } from "@/components/ui/input";
import { UserWithAgency } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Tag } from "@prisma/client";
import clsx from "clsx";

interface TagWithCount extends Tag {
  _count: {
    Ticket: number;
  };
}

interface FilterPopoverProps {
  onFilterChange: (filter: string, selectedTags?: string[], keyword?: string) => void;
  currentUser: UserWithAgency | null;
  availableTags: TagWithCount[]; // Tags with their usage counts
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  onFilterChange,
  currentUser,
  availableTags,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState<string>("");

  useEffect(() => {
    console.log("FilterPopover currentUser:", currentUser);
  }, [currentUser]);

  const handleFilterChange = (value: string) => {
    console.log("Filter changed to:", value);
    console.log("Current user when filtering:", currentUser);

    if (value === "assigned_to_me" && !currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to filter tickets assigned to you.",
        variant: "destructive",
      });
      return;
    }

    // Clear selected tags when changing to a different filter
    if (value !== "tags") {
      setSelectedTags([]);
    }

    setSelectedFilter(value);
    onFilterChange(value, value === "tags" ? selectedTags : undefined, keyword);
  };

  // Handle tag selection/deselection
  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      // Toggle tag selection
      const newSelection = prev.includes(tagId)
        ? prev.filter(id => id !== tagId) // Remove if already selected
        : [...prev, tagId]; // Add if not selected

      // Important: Set filter to 'tags' and trigger filter change immediately
      setSelectedFilter('tags');
      onFilterChange('tags', newSelection);

      return newSelection;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "flex gap-2 items-center",
            (selectedFilter !== "all" || selectedTags.length > 0)
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-zinc-600 hover:bg-zinc-700"
          )}
        >
          <Filter size={15} />
          Filter {(selectedFilter !== "all" || selectedTags.length > 0) && "(Active)"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-10" sideOffset={20}>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <h3 className="flex-1 text-sm text-center font-extrabold">Filter</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setSelectedFilter("all");
                setSelectedTags([]);
                onFilterChange("all", []);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3">
            <CommandList>
              <CommandGroup heading="Keyword">
                <Input
                  placeholder="Enter keyword"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    onFilterChange(selectedFilter, selectedTags, e.target.value);
                  }}
                  className="mb-2"
                />
              </CommandGroup>

              <CommandGroup heading="All tickets">
                <RadioGroup
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>🎟️</span>
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex-1">
                      All tickets
                    </Label>
                  </div>
                </RadioGroup>
              </CommandGroup>

              <CommandGroup heading="Members">
                <RadioGroup
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>🙅‍♂️</span>
                    <RadioGroupItem value="no_members" id="no_members" />
                    <Label htmlFor="no_members" className="flex-1">
                      No members
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>🙋🏻‍♂️</span>
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

              <CommandGroup heading="Progress">
                <RadioGroup
                  value={selectedFilter}
                  onValueChange={handleFilterChange}
                >
                  {/* Date filter options */}
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>❌</span>
                    <RadioGroupItem value="no_dates" id="no_dates" />
                    <Label htmlFor="no_dates" className="flex-1">
                      No due date
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>⏰</span>
                    <RadioGroupItem value="overdue" id="overdue" />
                    <Label htmlFor="overdue" className="flex-1">
                      Overdue
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>📆</span>
                    <RadioGroupItem value="due_next_day" id="due_next_day" />
                    <Label htmlFor="due_next_day" className="flex-1">
                      Due in the next day
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>🗓️</span>
                    <RadioGroupItem value="due_within_week" id="due_within_week" />
                    <Label htmlFor="due_within_week" className="flex-1">
                      Due within one week
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 hover:bg-gray-100 hover:dark:bg-gray-500 rounded-md cursor-pointer">
                    <span>✅</span>
                    <RadioGroupItem value="completed_tasks" id="completed_tasks" />
                    <Label htmlFor="completed_tasks" className="flex-1">
                      Completed tasks
                    </Label>
                  </div>
                </RadioGroup>
              </CommandGroup>

              {/* Tags section with the new TagButton component */}
              <CommandGroup heading="Tags">
                <div className="p-2 flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <div
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={clsx(
                        "p-2 rounded-sm flex items-center gap-2 cursor-pointer transition-all duration-200",
                        {
                          // Unselected state - lighter background with colored text
                          "bg-[#57acea]/10 text-[#57acea]": tag.color === "BLUE",
                          "bg-[#ffac7e]/10 text-[#ffac7e]": tag.color === "ORANGE",
                          "bg-rose-500/10 text-rose-500": tag.color === "ROSE",
                          "bg-emerald-400/10 text-emerald-400": tag.color === "GREEN",
                          "bg-purple-400/10 text-purple-400": tag.color === "PURPLE",

                          // Selected state - full color background with white text
                          "bg-[#2854a6] text-white": selectedTags.includes(tag.id) && tag.color === "BLUE",
                          "bg-[#d66629] text-white": selectedTags.includes(tag.id) && tag.color === "ORANGE",
                          "bg-[#d62929] text-white": selectedTags.includes(tag.id) && tag.color === "ROSE",
                          "bg-[#29d6b9] text-white": selectedTags.includes(tag.id) && tag.color === "GREEN",
                          "bg-[#9637e3] text-white": selectedTags.includes(tag.id) && tag.color === "PURPLE",
                        }
                      )}
                    >
                      {/* Tag name */}
                      <span className="text-xs">{tag.name}</span>

                      {/* Tag count badge */}
                      {tag._count?.Ticket > 0 && (
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-full",
                          selectedTags.includes(tag.id)
                            ? "bg-white/20" // Semi-transparent white for selected tags
                            : "bg-gray-100 dark:bg-gray-800" // Gray background for unselected tags
                        )}>
                          {tag._count.Ticket}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Show selected tags count */}
                {selectedTags.length > 0 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;