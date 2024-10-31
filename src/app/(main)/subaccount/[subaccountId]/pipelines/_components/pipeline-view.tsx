"use client";
import LaneForm from "@/components/forms/lane-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
  UserWithAgency,
} from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { Lane, Ticket } from "@prisma/client";
import {
  Filter,
  Flag,
  PlusCircle,
  PlusCircleIcon,
  Workflow,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import PipelineLane from "./pipeline-lane";
import dynamic from "next/dynamic";
import AutomationForm from "@/components/forms/automation-form";
import FilterPopover from "./pipeline-filter";
import { getAuthUserDetails } from "@/lib/queries";

const ParticlesComponent = dynamic(() => import("@/particlesConfig.mjs"), {
  ssr: false,
});

type Props = {
  lanes: LaneDetail[];
  pipelineId: string;
  subaccountId: string;
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
  updateLanesOrder: (lanes: Lane[]) => Promise<void>;
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>;
};

//this is like a kanban board itself
const PipelineView = ({
  lanes,
  pipelineId,
  subaccountId,
  pipelineDetails,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const { setOpen } = useModal();
  const router = useRouter();
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([]); //basically have the LaneDetail array
  const [showParticles, setShowParticles] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<string>("all"); // State to track current active filter
  const [filteredLanes, setFilteredLanes] = useState<LaneDetail[]>(lanes); // State to store filtered lanes based on current filter
  const [currentUser, setCurrentUser] = useState<UserWithAgency | null>(null); //use UserWithAgency type to ensure type safety for user properties
  const [selectedTags, setSelectedTags] = useState<string[]>([]);  // State to store all available tags with their ticket counts
  const [keyword, setKeyword] = useState<string>('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user details when component mounts
  //use useEffect because can't use async operations directly in component body
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthUserDetails(); // Fetch user data from auth system
      setCurrentUser(user); // Store user data in state
      console.log("pipeline view user info", user);
    };
    fetchUser();
  }, []); //Empty dependency array means this runs once on mount

  //when it loads, set all the lanes
  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);


  //sorted lanes 
  useEffect(() => {
    const sortedLanes = lanes.map(lane => ({
      ...lane,
      Tickets: [...lane.Tickets].sort((a, b) => {
        // First priority: Pin status
        if (a.isPinned && !b.isPinned) return -1;  // If A is pinned but B isn't, A goes first
        if (!a.isPinned && b.isPinned) return 1;  // If B is pinned but A isn't, B goes first

        // Second priority: If both tickets are pinned, sort by pinnedAt date
        if (a.isPinned && b.isPinned) {
          // More recently pinned tickets go on top
          return new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime();
        }

        // If neither ticket is pinned, maintain original order
        return a.order - b.order;
      })
    }));
    setAllLanes(sortedLanes); // Update lanes state with sorted tickets
  }, [lanes]); // Re-run when lanes data changes

  // Extract unique tags and count their occurrences across all tickets
  //useMemo used to optimize performance by memoizing values, recalculates a value only when one of its dependencies changes. 
  //Without useMemo, every re-render of the component would cause this tag calculation logic to execute again,
  const availableTags = useMemo(() => {
    // Use Map to store unique tags by their ID
    const tagsMap = new Map();

    // Loop through all lanes and their tickets to count tag usage
    lanes.forEach((lane) => {
      //For each ticket, checks its associated tags and either
      //adds the tag to the Map or increments its ticket count if it's already present.
      lane.Tickets.forEach((ticket) => {
        ticket.Tags.forEach((tag) => {
          if (!tagsMap.has(tag.id)) {
            // If this is the first occurrence of the tag, initialize it
            tagsMap.set(tag.id, {
              ...tag,
              _count: { Ticket: 1 },
            });
          } else {
            // If we've seen this tag before, increment its count
            const existingTag = tagsMap.get(tag.id);
            existingTag._count.Ticket += 1;
            tagsMap.set(tag.id, existingTag);
          }
        });
      });
    });

    // Convert Map back to array for rendering
    return Array.from(tagsMap.values());
  }, [lanes]);// Only recalculate when lanes data changes

  // Main filtering function that handles all filter types
  const applyFilter = (filter: string, tags?: string[], keyword?: string) => {
    const newFilteredLanes = allLanes.map((lane) => ({
      ...lane, // Keep all lane properties
      // Filter tickets within each lane based on selected filter
      Tickets: lane.Tickets.filter((ticket) => {
        // Check tags first if they're selected
        if (tags && tags.length > 0) {
          const ticketTagIds = ticket.Tags.map((tag) => tag.id);
          // Check if ticket has any of the selected tags
          const hasSelectedTags = tags.some((selectedTagId) =>
            ticketTagIds.includes(selectedTagId)
          );
          if (!hasSelectedTags) return false;
        }

        // Check keyword if provided
        if (keyword) {
          const lowercaseKeyword = keyword.toLowerCase();

          // Check ticket name
          const nameMatch = ticket.name.toLowerCase().includes(lowercaseKeyword);

          // Check ticket description
          const descriptionMatch = ticket.description?.toLowerCase().includes(lowercaseKeyword) || false;

          // Check assigned user name (assuming the User relation includes a name field)
          const assignedUserMatch = ticket.Assigned?.name?.toLowerCase().includes(lowercaseKeyword) || false;

          // Return true if ANY of the fields match the keyword
          //Return false for non-matches to show the things that we want*
          if (!nameMatch && !descriptionMatch && !assignedUserMatch) {
            return false;
          }
        }

        //apply filters
        switch (filter) {
          case "no_members":
            // Return tickets that don't have any assigned user
            return !ticket.assignedUserId;

          case "assigned_to_me":
            // Return tickets assigned to current user
            // Only works if currentUser exists and IDs match
            return currentUser && ticket.assignedUserId === currentUser.id;

          case "overdue":
            // Skip if no due date or ticket is already completed
            if (!ticket.dueDate || ticket.completed) return false;
            // Return tickets whose due date is before current date
            return new Date(ticket.dueDate) < new Date();

          case "no_dates":
            // Return tickets that don't have a due date set
            return !ticket.dueDate;

          case "due_next_day":
            // Skip if no due date or ticket is completed
            if (!ticket.dueDate || ticket.completed) return false;
            const dueDate = new Date(ticket.dueDate);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999); // Set to end of next day
            // Return tickets due between now and end of tomorrow
            return dueDate >= new Date() && dueDate <= tomorrow;

          case "due_within_week":
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(23, 59, 59, 999);

            if (!ticket.dueDate || ticket.completed) return false;
            const dueDateWeek = new Date(ticket.dueDate);
            return dueDateWeek >= new Date() && dueDateWeek <= nextWeek;

          case "tags":
            return true; // Tags already filtered above

          case "completed_tasks":
            return ticket.completed === true;

          default: // "all" case
            // Show all tickets when no filter is applied
            return true;
        }
      }),
    }));
    // Update the filtered lanes state
    setFilteredLanes(newFilteredLanes);
  };

  // Apply filter whenever filter selection or lanes data changes
  useEffect(() => {
    applyFilter(currentFilter);
  }, [currentFilter, allLanes, currentUser]);

  // Handler for filter changes from FilterPopover component
  const handleFilterChange = (filter: string, tags?: string[], keyword?: string) => {
    setCurrentFilter(filter);
    setSelectedTags(tags || []);
    setKeyword(keyword || "");
    applyFilter(filter, tags, keyword);
  };

  const ticketsFromAllLanes: TicketAndTags[] = [];
  //populates it with all the tickets from each lane in the lanes array.
  //The forEach loop iterates over each item in the lanes array,
  lanes.forEach((item) => {
    //then iterates over each Ticket in the item.Tickets array,
    item.Tickets.forEach((i) => {
      //pushing each Ticket into the ticketsFromAllLanes array.
      ticketsFromAllLanes.push(i);
    });
  });

  //The ticketsFromAllLanes array is used to display all the tickets across all the lanes, and the allTickets state variable is used to keep track of the current state of the tickets array, so that any updates to the tickets can be reflected in the UI.
  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes);

  // console.log("All tickets", allTickets);
  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title=" Create A Lane"
        subHeading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    );
  };

  const handleAutomation = () => {
    setOpen(
      <CustomModal
        title=" Automation"
        subHeading="Customize Your Configuration"
      >
        <AutomationForm
          pipelineId={pipelineId}
          warningThreshold={pipelineDetails?.warningThreshold ?? undefined} // Example: passing warning threshold if it's part of the pipeline details
        />
      </CustomModal>
    );
  };

  //dropResult is explicitly typed as DropResult
  const onDragEnd = (dropResult: DropResult) => {
    //DropResult is built-in props from dnd
    console.log(dropResult);
    //all these properties are part of the built-in DropResult type provided by the react-beautiful-dnd library
    const { destination, source, type } = dropResult;
    if (
      //destination will be null if the item is dropped outside of any droppable area.
      //This part of the condition checks if the drag-and-drop operation ended without a valid drop target. Then, returns early, indicating no further action is needed.
      !destination ||
      //
      (destination.droppableId === source.droppableId && //checks if the item was dropped into the same droppable container it was dragged from.
        destination.index === source.index) //checks if the item was dropped back to its original position within that container.
    ) {
      return; //If both conditions are true, the function returns early because the item's position hasn't changed, so no update is necessary.
    }

    switch (type) {
      case "lane": {
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, idx) => {
            return {
              ...lane,
              order: idx,
            };
          });

        setAllLanes(newLanes);
        updateLanesOrder(newLanes);
      }
      case "ticket": {
        let newLanes = [...allLanes];
        const originLane = newLanes.find(
          (lane) => lane.id === source.droppableId
        );

        const destinationLane = newLanes.find(
          (lane) => lane.id === destination.droppableId
        );

        //if drag outside the container or screen,
        if (!originLane || !destinationLane) {
          return;
        }

        if (source.droppableId === destination.droppableId) {
          const newOrderedTickets = [...originLane.Tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.Tickets[source.index])
            .map((item, idx) => {
              return { ...item, order: idx };
            });
          originLane.Tickets = newOrderedTickets;
          setAllLanes(newLanes);
          updateTicketsOrder(newOrderedTickets); //update the server as well
          router.refresh();
        } else {
          const [currentTicket] = originLane.Tickets.splice(source.index, 1);

          originLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });

          destinationLane.Tickets.splice(destination.index, 0, {
            ...currentTicket,
            laneId: destination.droppableId,
          });

          destinationLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });

          setAllLanes(newLanes);
          updateTicketsOrder([
            //update the database
            ...destinationLane.Tickets,
            ...originLane.Tickets,
          ]);
          router.refresh();
        }
      }
    }
  };

  const triggerConfetti = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 7000); // Hide after 5 seconds
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {showParticles && (
        <ParticlesComponent id="particles" scrollPosition={scrollPosition} />
      )}
      <div className="h-[calc(100vh-80px)] bg-white/60 dark:bg-background/60 rounded-xl flex flex-col use-automation-zoom-in mt-[-15px]" >
        <div className="flex items-center justify-between py-2 px-4 border-b">
          <h1 className="text-xl">{pipelineDetails?.name}</h1>
          <div className="flex items-center gap-2">
            <Button className="flex gap-2 items-center text-sm" onClick={handleAddLane}>
              <PlusCircleIcon className="mt-1" size={15} />
              Create Lane
            </Button>
            <Button
              className="flex gap-2 items-center bg-slate-800 hover:bg-slate-900 text-sm"
              onClick={handleAutomation}
            >
              <Workflow size={15} />
              Automation
            </Button>
            <FilterPopover
              currentUser={currentUser}
              onFilterChange={handleFilterChange}
              availableTags={availableTags}
            />
          </div>
        </div>

        {/*from react-beautiful-dnd */}
        <Droppable
          droppableId="lanes"
          type="lane"
          direction="horizontal"
          key="lanes"
        >
          {(provided) => (
            <div
              className="flex gap-x-2 h-full overflow-x-auto !overflow-y-hidden p-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex gap-2">
                {filteredLanes.map((lane, index) => (
                  <PipelineLane
                    allTickets={allTickets}
                    setAllTickets={setAllTickets}
                    subaccountId={subaccountId}
                    pipelineId={pipelineId}
                    tickets={lane.Tickets}
                    laneDetails={lane}
                    index={index}
                    key={lane.id}
                    triggerConfetti={triggerConfetti}
                    warningThreshold={pipelineDetails?.warningThreshold}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
        {allLanes.length == 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Flag
                width="100%"
                height="100%"
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default PipelineView;
