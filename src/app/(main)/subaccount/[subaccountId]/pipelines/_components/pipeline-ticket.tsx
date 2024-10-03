import React, { Dispatch, SetStateAction, useState } from "react";
import { TicketWithTags } from "@/lib/types";
import { Draggable } from "@hello-pangea/dnd";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Contact2,
  Edit,
  LinkIcon,
  MoreHorizontalIcon,
  Trash,
  User2,
} from "lucide-react";
import TagComponent from "@/components/global/tag";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CustomModal from "@/components/global/custom-modal";
import TicketForm from "@/components/forms/ticket-form";
import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";
import { deleteTicket, saveActivityLogsNotification } from "@/lib/queries";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Ensure you import the Badge component  

type Props = {
  setAllTickets: Dispatch<SetStateAction<TicketWithTags>>;
  ticket: TicketWithTags[0];
  subaccountId: string;
  allTickets: TicketWithTags;
  index: number;
};

// Utility function to generate different colors based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  const index = name.charCodeAt(0) % colors.length; // Calculate the index using the first character of the name
  return colors[index];
};

const PipelineTicket = ({
  setAllTickets,
  ticket,
  subaccountId,
  allTickets,
  index,
}: Props) => {
  const router = useRouter();
  const { setOpen, data } = useModal();
  const [isHovered, setIsHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Update a specific ticket in the allTickets array.
  const editNewTicket = (ticket: TicketWithTags[0]) => {
    setAllTickets((tickets) =>
      allTickets.map((t) => {
        // If the id of the current ticket matches the id of the ticket passed to the function, replaces that ticket with the new ticket object
        if (t.id === ticket.id) {
          return ticket; // Returns the updated allTickets array.
        }
        return t;
      })
    );
  };

  const handleClickEdit = async () => {
    setOpen(
      <CustomModal title="Update Ticket Details" subHeading="">
        <TicketForm
          getNewTicket={editNewTicket}
          laneId={ticket.laneId}
          subaccountId={subaccountId}
        />
      </CustomModal>,
      async () => {
        return { ticket: ticket };
      }
    );
  };

  // Utility function to safely format the date and include time  
  const formatDate = (date: Date | null) => { //accepts a parameter date, which can be a Date object or null.
    if (!date) return 'N/A'; // Handle null case here  
    return new Intl.DateTimeFormat('en-US', { //Intl.DateTimeFormat, which is a built-in JavaScript object that allows for language-sensitive date and time formatting. (ECMAScript Internationalization API.)
      //English as used in the United States, which affects aspects like date order (MM/DD/YYYY), time format (12-hour clock), and names of months/days.
      dateStyle: 'medium',
      timeStyle: 'short', // Include the time in a short format  
    }).format(date);
  };

  /* 
  Date Styles:
  full: The date, including the day of the week (e.g., "Monday, September 25, 2024").
  long: The date, without the day of the week (e.g., "September 25, 2024").
  medium: A shorter form of the date (e.g., "Sep 25, 2024").
  short: The shortest form of the date, usually numeric (e.g., "9/25/24").
  Time Styles:

  full: The time with a time zone (e.g., "2:30:00 PM GMT+5").
  long: The time with a time zone but without seconds (e.g., "2:30 PM GMT+5").
  medium: A medium-length time format (e.g., "2:30:00 PM").
  short: A shorter time format (e.g., "2:30 PM").
  */

  // This creates a new Date object representing the current date and time.
  // Condition: The comparison checks if the due date of the ticket is earlier than the current date and time.
  //If it is, isOverdue will be true, indicating that the ticket is overdue.
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date();

  // Delete a specific ticket from the allTickets array.
  const handleDeleteTicket = async () => {
    try {
      // If the id of the current ticket does not match the id of the ticket passed to the function (ticket.id),
      // this means that t.id is the tickets array from setAllTickets, if the id of this array does not match with the ticket.id which from the query(database), it shows,
      // If the id of the current ticket matches the id of the ticket passed to the function, it removes that ticket from the new array.
      setAllTickets((tickets) => tickets.filter((t) => t.id !== ticket.id)); // Show the ticket that does not match the id, because the match one will be deleted.
      const response = await deleteTicket(ticket.id); // Ticket object passed to the function is the one that the user wants to delete.
      toast({
        title: "Deleted",
        description: "Deleted ticket from lane.",
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a ticket | ${response?.name}`,
        subaccountId: subaccountId,
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could not delete the ticket.",
      });
      console.log(error);
    }
  };

  console.log("all tickets information", ticket)

  return (
    <Draggable draggableId={ticket.id.toString()} index={index}>
      {(provided, snapshot) => {
        if (snapshot.isDragging) {
          const offset = { x: 300, y: -90 };
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
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <AlertDialog>
              <DropdownMenu>
                <Card className="my-4 dark:bg-slate-900 bg-white shadow-none transition-all">
                  <CardHeader className="p-[12px]">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg w-full">{ticket.name}</span>
                      <DropdownMenuTrigger>
                        <MoreHorizontalIcon className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                    </CardTitle>
                    <span className="text-muted-foreground text-xs">
                      {`${formatDate(ticket.startDate)} - ${formatDate(ticket.dueDate)}`}
                    </span>
                    {isOverdue && (
                      <Badge color="destructive" className="mt-1">
                        Overdue
                      </Badge>
                    )}

                    <div className="flex items-center flex-wrap gap-2">
                      {ticket.Tags.map((tag) => (
                        <TagComponent
                          key={tag.id}
                          title={tag.name}
                          colorName={tag.color}
                        />
                      ))}
                    </div>
                    <CardDescription className="w-full ">
                      {ticket.description}
                    </CardDescription>
                    {/* From ShadCN UI */}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="p-2 text-muted-foreground flex gap-2 hover:bg-muted transition-all rounded-lg cursor-pointer items-center">
                          <LinkIcon />
                          <span className="text-xs font-bold">CONTACT</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent side="right" className="w-fit">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage />
                            <AvatarFallback
                              className={getAvatarColor(
                                ticket.Customer?.name || "Unknown"
                              )}
                            >
                              {/* Used to display the first two letters of the customer's name in uppercase.  
                              (?.) that ensures the ticket.Customer?.name is not null before accessing the slice() and toUpperCase() methods.   
                              The slice(0, 2) method extracts the first two characters from the customer's name. */}
                              {ticket.Customer?.name
                                .slice(0, 2)
                                .toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              {ticket.Customer?.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {ticket.Customer?.email}
                            </p>
                            <div className="flex items-center pt-2">
                              <Contact2 className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                Joined{" "}
                                {ticket.Customer?.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </CardHeader>
                  <CardFooter className="m-0 p-2 border-t-[1px] border-muted-foreground/20 flex items-center justify-between">
                    <div className="flex item-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          alt="contact"
                          src={ticket.Assigned?.avatarUrl}
                        />
                        <AvatarFallback
                          className={
                            ticket.assignedUserId
                              ? getAvatarColor(
                                ticket.Assigned?.name || "Assigned User"
                              )
                              : "bg-primary"
                          }
                        >
                          {ticket.assignedUserId ? (
                            ticket.Assigned?.name?.slice(0, 2).toUpperCase() ||
                            "AU"
                          ) : (
                            <User2 size={14} />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col justify-center">
                        <span className="text-sm text-muted-foreground">
                          {ticket.assignedUserId
                            ? "Assigned to"
                            : "Not Assigned"}
                        </span>
                        {ticket.assignedUserId && (
                          <span className="text-xs w-28 overflow-ellipsis overflow-hidden whitespace-nowrap text-muted-foreground">
                            {ticket.Assigned?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      {!!ticket.value &&
                        new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: "MYR",
                        }).format(+ticket.value)}
                    </span>
                  </CardFooter>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size={15} />
                        Delete Ticket
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleClickEdit}
                    >
                      <Edit size={15} />
                      Edit Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </Card>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the ticket and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        style={{
                          backgroundColor: isHovered ? "#b22222" : "#800000", // Lighter red on hover
                          color: "white",
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={handleDeleteTicket}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
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

export default PipelineTicket;
