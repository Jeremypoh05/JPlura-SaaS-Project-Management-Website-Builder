"use client";
import {
  getSubAccountTeamMembers,
  saveActivityLogsNotification,
  searchContacts,
  upsertTicket,
} from "@/lib/queries";
import { TicketFormSchema, TicketWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, Tag, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "../ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  User2,
  Calendar as CalendarIcon,
  PinIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";
import Loading from "../global/loading";
import TagCreator from "../global/tag-creator";
import { currentUser } from "@clerk/nextjs";

type Props = {
  laneId: string;
  subaccountId: string;
  //the TicketForm component expects to receive a getNewTicket function that takes one argument, ticket, which is of type TicketWithTags[0], and returns a value of type void.
  getNewTicket: (ticket: TicketWithTags[0]) => void;
  triggerConfetti: () => void;
};

const TicketForm = ({ laneId, subaccountId, getNewTicket, triggerConfetti }: Props) => {
  const { data: defaultData, setClose } = useModal();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  //ticket can be assigned to one contact
  const [contact, setContact] = useState("");
  //search for tags
  const [search, setSearch] = useState("");
  const [contactList, setContactList] = useState<Contact[]>([]);
  //debounce the user's input, as your searching, we want to debounce the user's input and send it to the database to fetch information
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);

  const [assignedTo, setAssignedTo] = useState(
    defaultData.ticket?.Assigned?.id || ""
  );

  //for date-time and status
  const [showStartDate, setShowStartDate] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [completed, setCompleted] = useState(
    defaultData.ticket?.completed || false
  );
  // State to track if ticket is pinned, initialized from existing ticket data or false
  const [isPinned, setIsPinned] = useState(defaultData.ticket?.isPinned || false);

  const handleStartDateChange = (date: Date | undefined) => {
    // Update the start date state with the new date
    setStartDate(date);
    //date: This is the new start date that is being set, dueDate:  This is the current due date before the start date change.
    //dueDate < date  This checks if the current due date is earlier than the new start date.
    if (date && dueDate && dueDate < date) {
      //If a new start date is provided (date), and there is already a due date (dueDate), we check if the due date is earlier than the new start date.
      // If the due date is earlier than the new start date, it means that logically, the due date should not be before the start date.Therefore, we adjust the due date to match the new start date.
      setDueDate(date); //setDueDate to current start date.
      toast({
        title: "Date Adjusted",
        description: "Due date has been adjusted to match the start date.",
        variant: "default",
      });
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    //date: This is the new due date that is being set.
    //startDate: This is the current start date.
    //date < startDate: This checks if the new due date is earlier than the current start date.
    if (date && startDate && date < startDate) {
      toast({
        title: "Invalid Date",
        description: "Due date cannot be earlier than the start date.",
        variant: "destructive",
      });
      // Exit the function without updating the due date state
      // This effectively rejects the invalid date selection
      return;
    }
    // If we've reached this point, the new date is either valid or undefined
    // Update the due date state with the new date
    setDueDate(date);
  };

  const form = useForm<z.infer<typeof TicketFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(TicketFormSchema),
    defaultValues: {
      name: defaultData.ticket?.name || "",
      description: defaultData.ticket?.description || "",
      value: String(defaultData.ticket?.value || 0),
    },
  });

  const isLoading = form.formState.isLoading;

  //when the components load, we are basically get the subaccount team members(users)
  //so when user is creating a ticket and want to assign to one a sub account to one of the team members, they can access that
  useEffect(() => {
    if (subaccountId) {
      const fetchData = async () => {
        const response = await getSubAccountTeamMembers(subaccountId);
        if (response) setAllTeamMembers(response);
      };
      fetchData();
    }
  }, [subaccountId]);

  useEffect(() => {
    if (defaultData.ticket) {
      // resets the form values using the form.reset method. The reset values are set based on the ticket's existing data.
      form.reset({
        name: defaultData.ticket.name || "",
        description: defaultData.ticket?.description || "",
        value: String(defaultData.ticket?.value || 0),
      });
      // Set start and due dates if they exist
      setStartDate(
        defaultData.ticket.startDate
          ? new Date(defaultData.ticket.startDate)
          : undefined
      );
      setDueDate(
        defaultData.ticket.dueDate
          ? new Date(defaultData.ticket.dueDate)
          : undefined
      );

      // Set the checkboxes based on whether the dates are set
      setShowStartDate(!!defaultData.ticket.startDate);
      setShowDueDate(!!defaultData.ticket.dueDate);

      //stripe thing
      //If the ticket has a customerId, sets the contact state with the customerId.
      if (defaultData.ticket.customerId)
        setContact(defaultData.ticket.customerId);

      //  fetches the contact list using the searchContacts function.
      //The function takes the defaultData.ticket?.Customer?.name as an argument,
      const fetchData = async () => {
        const response = await searchContacts(
          //where the Customer name here match with wit the database contact.name (searchTerms)
          //@ts-ignore
          defaultData.ticket?.Customer?.name
        );
        setContactList(response);
      };
      fetchData();
    }
  }, [defaultData]);

  //submit the form when clicking
  const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
    if (!laneId) return;

    // Automatically set the startDate to the current date/time if it is undefined
    // if (showStartDate && !startDate) {
    //   setStartDate(new Date()); // Set to current date and time
    // }

    //If defaultData.ticket is defined (i.e., it exists), ticketExists will be true.
    //If it’s not defined, ticketExists will be false.
    const ticketExists = defaultData.ticket !== undefined;

    // Automatically set the startDate to the current date/time if it is undefined
    const currentDate = new Date(); // Get the current date and time

    // Set final dates based on checkbox state and existing values
    const finalStartDate = showStartDate
      ? startDate
      : ticketExists && defaultData.ticket?.startDate
        ? new Date(defaultData.ticket?.startDate)
        : currentDate; // Use current date if no start date is selected
    /*
     Condition 1: showStartDate
      If showStartDate is true, it means the user has checked the checkbox to indicate they want to set a start date. In this case, finalStartDate is set to the current value of startDate.
      Condition 2: ticketExists && defaultData.ticket?.startDate
      If showStartDate is false, it checks if the ticket exists (ticketExists is true) and if defaultData.ticket.startDate is defined (not undefined).
      If both conditions are true, it creates a new Date object from defaultData.ticket.startDate, ensuring that the stored start date is used.
      Condition 3: If neither of the above conditions is satisfied, it defaults to currentDate.
      This means if the user has not checked the start date checkbox and there is no existing start date, it will use the current date and time.
     */

    const finalDueDate = showDueDate
      ? dueDate
      : ticketExists && defaultData.ticket?.dueDate
        ? new Date(defaultData.ticket?.dueDate)
        : null; // Use existing date or null if it doesn't exist

    try {
      const response = await upsertTicket(
        {
          ...values,
          laneId,
          id: defaultData.ticket?.id,
          assignedUserId: assignedTo,
          startDate: finalStartDate ? finalStartDate.toISOString() : null,
          dueDate: finalDueDate ? finalDueDate.toISOString() : null,
          completed: completed,
          isPinned: isPinned, // Current pin state
          pinnedAt: isPinned ? (defaultData.ticket?.pinnedAt || new Date().toISOString()) : null, // If pinned, use existing pinnedAt or set new timestamp, // If unpinned, set to null
          ...(contact ? { customerId: contact } : {}),
        },
        tags
      );

      if (!response) {
        throw new Error('Failed to create/update ticket');
      }

      // Create the general activity log
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated ticket | ${response.name}`,
        subaccountId,
      });

      // Only create assignment notification if:
      // 1. There's a new assignee (assignedTo exists)
      // 2. AND either:
      //    - It's a new ticket (no defaultData.ticket)
      //    - OR the assignee has changed from the previous one
      if (assignedTo &&
        (!defaultData.ticket || defaultData.ticket.assignedUserId !== assignedTo)) {
        const assigneeName = allTeamMembers.find(member => member.id === assignedTo)?.name || "team member";

        // Create notification for ticket assignment
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `has assigned ticket: ${response.name} to |${assigneeName}|`,
          subaccountId,
          assignedUserId: assignedTo, //ensures the notification goes to assigned user
          isRead: false,
          ticketId: response.id //Link notification to the ticket
        });
      }

      // Call triggerConfetti if the ticket is marked as completed  
      if (completed) {
        triggerConfetti();
      }

      toast({
        title: "Success",
        description: "Saved  details",
      });
      if (response) getNewTicket(response);
      router.refresh();
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could not save pipeline details",
      });
    }
    setClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel className="text-black dark:text-white ">
                      Ticket Name
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pinned"
                        className="border-[1px] border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        checked={isPinned} // Controlled component, shows current pin state
                        onCheckedChange={(checked) => {
                          if (typeof checked === "boolean") {
                            setIsPinned(checked); // Update pin state when checkbox changes
                          }
                        }}
                      />
                      <FormLabel
                        htmlFor="pinned"
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <PinIcon
                          size={14}
                          className={cn(
                            "rotate-45 transition-colors",
                            isPinned ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        Pin Ticket
                      </FormLabel>
                    </div>
                  </div>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3>Date & Time</h3>
            <div className="!bg-secondary flex flex-col gap-4 rounded-md border border-input px-5 pb-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <div
                className={`flex items-center justify-end gap-2 mt-4 border-2 rounded-md ml-auto w-[170px] p-2 ${completed ? "border-green-500" : "border-rose-500"
                  }`}
              >
                <Checkbox
                  id="completed"
                  className={`${completed ? "border-green-500" : "border-rose-500"
                    }`}
                  checked={completed}
                  onCheckedChange={(checked) => {
                    if (typeof checked === "boolean") {
                      setCompleted(checked);
                    }
                  }}
                />
                <FormLabel
                  className={`mt-[2px] ${completed ? "text-white" : "text-muted-foreground"
                    }`}
                  htmlFor="completed"
                >
                  Mark as Completed
                </FormLabel>
              </div>
              {/* Checkbox for Start Date */}
              <div className="flex items-center gap-2">
                <Checkbox
                  className="border-[1px] border-[#0c89e3]"
                  checked={showStartDate}
                  onCheckedChange={(checked) => {
                    // Ensure that checked is a boolean
                    if (typeof checked === "boolean") {
                      setShowStartDate(checked);
                    }
                  }}
                />
                <FormLabel>Start Date</FormLabel>
              </div>
              {showStartDate && (
                <DateTimePicker
                  className="hover:bg-[#002147]"
                  hourCycle={24} // or 12,
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              )}

              {/* Checkbox for Due Date */}
              <div className="flex items-center gap-2">
                <Checkbox
                  className="border-[1px] border-[#0c89e3]"
                  checked={showDueDate}
                  onCheckedChange={(checked) => {
                    // Ensure that checked is a boolean
                    if (typeof checked === "boolean") {
                      setShowDueDate(checked);
                    }
                  }}
                />
                <FormLabel>Due Date</FormLabel>
              </div>
              {showDueDate && (
                <DateTimePicker
                  className="hover:bg-[#002147]"
                  hourCycle={24} // or 12
                  value={dueDate}
                  onChange={handleDueDateChange}
                />
              )}
            </div>

            <h3>Add tags</h3>
            <TagCreator
              subAccountId={subaccountId}
              getSelectedTags={setTags}
              defaultTags={defaultData.ticket?.Tags || []}
            />
            <FormLabel>Assigned To Team Member</FormLabel>
            <Select onValueChange={setAssignedTo} defaultValue={assignedTo}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      {/*by default not assign to anyone */}
                      <span className="text-sm text-muted-foreground">
                        Not Assigned
                      </span>
                    </div>
                  }
                />
              </SelectTrigger>
              {/*when click the select, shows all team members */}
              <SelectContent>
                {allTeamMembers.map((teamMember) => (
                  <SelectItem key={teamMember.id} value={teamMember.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" src={teamMember.avatarUrl} />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        {teamMember.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormLabel>Customer</FormLabel>
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between"
                >
                  {/* display the selected contact's name in a dropdown menu. The contactList is an array of contact objects fetched from the server.
                  checks if the contact variable is truthy,If it does, it finds the contact object in the contactList array whose id matches the contact variable's value.
                  If such a contact is found, it extracts the name property of the contact object and uses it to render the selected contact's name in the dropdown menu.
                  If the contact variable is not truthy, it renders the string "Select Customer..." in the dropdown menu.
                  */}
                  {contact
                    ? contactList.find((c) => c.id === contact)?.name
                    : "Select Customer..."}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    className="h-9"
                    value={search}
                    onChangeCapture={async (value) => {
                      {
                        /*onChangeCapture= function updates the search state variable with the user's input.
                        If the saveTimerRef variable is truthy, it clears the timeout that was previously set. Then, 
                        it sets a new timeout that calls the searchContacts function after 1 second.
                        This ensures that the search is performed after a short delay, which can help to debounce the user's input and prevent unnecessary API calls.
                        */
                      }
                      //@ts-ignore
                      setSearch(value.target.value);
                      if (saveTimerRef.current)
                        clearTimeout(saveTimerRef.current);
                      saveTimerRef.current = setTimeout(async () => {
                        const response = await searchContacts(
                          //@ts-ignore
                          value.target.value
                        );
                        setContactList(response);
                        setSearch("");
                      }, 1000);
                    }}
                  />
                  <CommandEmpty>No Customer found.</CommandEmpty>
                  <CommandGroup>
                    {contactList.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.id}
                        onSelect={(currentValue) => {
                          setContact(
                            currentValue === contact ? "" : currentValue
                          );
                        }}
                      >
                        {c.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            contact === c.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;
