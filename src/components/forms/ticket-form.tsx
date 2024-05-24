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
import { CheckIcon, ChevronsUpDownIcon, User2 } from "lucide-react";
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

type Props = {
  laneId: string;
  subaccountId: string;
  //the TicketForm component expects to receive a getNewTicket function that takes one argument, ticket, which is of type TicketWithTags[0], and returns a value of type void.
  getNewTicket: (ticket: TicketWithTags[0]) => void;
};

const TicketForm = ({ laneId, subaccountId, getNewTicket }: Props) => {
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
        console.log(response);
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
    try {
      const response = await upsertTicket(
        {
          ...values,
          laneId,
          id: defaultData.ticket?.id,
          assignedUserId: assignedTo,
          ...(contact ? { customerId: contact } : {}),
        },
        tags
      );

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a ticket | ${response?.name}`,
        subaccountId,
      });

      toast({
        title: "Success",
        description: "Saved  details",
      });
      if (response) getNewTicket(response);
      router.refresh();
    } catch (error) {
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
                  <FormLabel className="text-black dark:text-white ">Ticket Name</FormLabel>
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
