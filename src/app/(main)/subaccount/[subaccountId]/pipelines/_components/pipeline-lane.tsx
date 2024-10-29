"use client";
import CreateLaneForm from "@/components/forms/lane-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteLane, saveActivityLogsNotification } from "@/lib/queries";
import { LaneDetail, TicketWithTags } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/modal-provider";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Edit, MoreVertical, PlusCircleIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import CustomModal from "@/components/global/custom-modal";
import TicketForm from "@/components/forms/ticket-form";
import PipelineTicket from "./pipeline-ticket";
import { Button } from "@/components/ui/button";

interface PipelaneLaneProps {
  setAllTickets: Dispatch<SetStateAction<TicketWithTags>>;
  allTickets: TicketWithTags;
  tickets: TicketWithTags;
  pipelineId: string;
  laneDetails: LaneDetail;
  subaccountId: string;
  index: number;
  triggerConfetti: () => void;
  warningThreshold?: number | null;
}

const PipelineLane: React.FC<PipelaneLaneProps> = ({
  setAllTickets,
  tickets,
  pipelineId,
  laneDetails,
  subaccountId,
  allTickets,
  index,
  triggerConfetti,
  warningThreshold,
}) => {
  const { setOpen } = useModal();
  const router = useRouter();

  const amt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "MYR",
  });

  //Everytime the ticket change, only then we create a lane amount to get and recalculate our lane amount.
  //The useMemo hook is used to memorize the laneAmt function, which means it will only be executed when the tickets array changes.
  const laneAmt = useMemo(() => {
    console.log(tickets);
    return tickets.reduce(
      // If the value property is not present or is not a number, it defaults to 0. The result is then returned and used to display the total value of the tickets in the lane.
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    );
  }, [tickets]);

  const randomColor = `#${Math.random().toString(16).slice(2, 8)}`;

  const addNewTicket = (ticket: TicketWithTags[0]) => {
    setAllTickets([...allTickets, ticket]);
  };

  const handleCreateTicket = () => {
    setOpen(
      <CustomModal
        title="Create A Ticket"
        subHeading="Tickets are a great way to keep track of tasks"
      >
        <TicketForm
          getNewTicket={addNewTicket}
          laneId={laneDetails.id}
          subaccountId={subaccountId}
          triggerConfetti={triggerConfetti}
        />
      </CustomModal>
    );
  };

  const handleEditLane = () => {
    setOpen(
      <CustomModal title="Edit Lane Details" subHeading="">
        <CreateLaneForm pipelineId={pipelineId} defaultData={laneDetails} />
      </CustomModal>
    );
  };

  const handleDeleteLane = async () => {
    try {
      const response = await deleteLane(laneDetails.id);
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a lane | ${response?.name}`,
        subaccountId,
      });
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    //{/*from react-beautiful-dnd */}
    <Draggable
      draggableId={laneDetails.id.toString()}
      index={index}
      key={laneDetails.id}
    >
      {(provided, snapshot) => {
        //React dnd, since we have an absolute container (sidebar using fixed default), then, if we drag the element, it snaps to some other location/
        //so, manually push it around to make it work.
        if (snapshot.isDragging) {
          //@ts-ignore
          const offset = { x: 250, y: -5 };
          //@ts-ignore
          const x = provided.draggableProps.style?.left - offset.x;
          //@ts-ignore
          const y = provided.draggableProps.style?.top - offset.y;
          //@ts-ignore
          provided.draggableProps.style = {
            ...provided.draggableProps.style,
            top: y,
            left: x,
          };
        }
        return (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="h-full"
          >
            <AlertDialog>
              <DropdownMenu>
                <div
                  className={cn(
                    "lane-container h-full w-[330px] relative flex flex-col rounded-xl flex-shrink-0 mr-8",
                    // Light mode gradient
                    "bg-gradient-to-br from-white/95 via-slate-50/95 to-slate-100/95",
                    // Dark mode gradient
                    "dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95",
                    // Border
                    "!border !border-slate-200/60 !dark:border-slate-700/50",
                    // Shadow
                    "!shadow-md !shadow-slate-200/50 ",
                    // Transition
                    "transition-all duration-300"
                  )}
                >
                  <div
                    {...provided.dragHandleProps}
                    className="lane-header !border-b-slate-200 rounded-t-xl sticky top-0 z-1000 "
                  >
                    <div className="h-14 flex items-center p-4 justify-between cursor-grab border-b-[1px]">
                      {/* {laneDetails.order} */}
                      <div className="flex items-center w-full gap-2">
                        <div
                          className={cn("w-4 h-4 rounded-full")}
                          style={{ background: randomColor }}
                        />
                        <span className="font-bold text-sm">
                          {laneDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center flex-row">
                        <Badge className="bg-white text-black">
                          {amt.format(laneAmt)}
                        </Badge>
                        <DropdownMenuTrigger>
                          <MoreVertical className="text-muted-foreground cursor-pointer" />
                        </DropdownMenuTrigger>
                      </div>
                    </div>
                  </div>
                  {/*drag and drop for tickets(tasks) */}
                  <Droppable
                    droppableId={laneDetails.id.toString()}
                    key={laneDetails.id}
                    type="ticket"
                  >
                    {(provided) => (
                      <div className="flex-1 overflow-y-auto overflow-x-hidden lane-scroll">
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mt-2 flex flex-col justify-center items-center"
                        >
                          {tickets.map((ticket, index) => (
                            <PipelineTicket
                              allTickets={allTickets}
                              setAllTickets={setAllTickets}
                              subaccountId={subaccountId}
                              ticket={ticket}
                              key={ticket.id.toString()}
                              index={index}
                              triggerConfetti={triggerConfetti}
                              warningThreshold={warningThreshold}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                  {/* Add card button */}
                  <div
                    className={cn(
                      "px-4 py-2 !border-t !rounded-b-xl",
                      // Light mode gradient
                      "bg-gradient-to-r from-slate-100/80 via-white/80 to-slate-50/80",
                      // Dark mode gradient
                      "dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90",
                      "!border !border-slate-200/60 !dark:border-slate-700/50",
                      // Transition
                      "transition-all duration-300"
                    )}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground text-sm hover:text-muted-foreground/80"
                      onClick={handleCreateTicket}
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Add a ticket
                    </Button>
                  </div>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size={15} />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleEditLane}
                    >
                      <Edit size={15} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleCreateTicket}
                    >
                      <PlusCircleIcon size={15} />
                      Create Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your entire lane and remove all the data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-red-600"
                      onClick={handleDeleteLane}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </DropdownMenu>
            </AlertDialog>
          </div>
        );
      }}
    </Draggable>
  );
};

export default PipelineLane;
