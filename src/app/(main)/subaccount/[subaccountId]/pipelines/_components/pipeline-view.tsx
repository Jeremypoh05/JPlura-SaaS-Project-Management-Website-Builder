"use client";
import LaneForm from "@/components/forms/lane-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
} from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { Lane, Ticket } from "@prisma/client";
import { Filter, Flag, PlusCircle, PlusCircleIcon, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import PipelineLane from "./pipeline-lane";
import dynamic from "next/dynamic";
import AutomationForm from "@/components/forms/automation-form";

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

  //when it loads, set all the lanes
  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY); // Track scroll position
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  console.log("All tickets", allTickets);

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
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          <div className="flex items-center gap-2">
            <Button className="flex gap-2 items-center" onClick={handleAddLane}>
              <PlusCircleIcon size={15} />
              Create Lane
            </Button>
            <Button
              className="flex gap-2 items-center bg-slate-800 hover:bg-slate-900"
              onClick={handleAutomation}
            >
              <Workflow size={15} />
              Automation
            </Button>
            <Button className="flex gap-2 items-center bg-zinc-600 hover:bg-zinc-700" onClick={() => {}}>
              <Filter size={15} />
              Filter
            </Button>
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
              className="flex item-center gap-x-2 overflow-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex mt-4">
                {allLanes.map((lane, index) => (
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
