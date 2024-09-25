"use client"; // Enable client-side rendering

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BlurPage from "@/components/global/blur-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import format from "date-fns/format";
import CreateContactButton from "./_components/create-contact-button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Contact2, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"; // Import ChevronsUpDown
import { Contact, Ticket } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteContactButton from "./_components/delete-contact-button";

type Props = {
  contacts: (Contact & { Ticket: Ticket[] })[];
  subaccountId: string;
};

// Utility function to generate different colors for avatars based on initials
const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-lime-500",
    "bg-cyan-500",
  ];

  const index = name.charCodeAt(0) % colors.length; // Get color index based on initials
  return colors[index]; // Returns a color based on the initials
};

const ContactPage = ({ contacts, subaccountId }: Props) => {
  // Ensure contacts is an array
  const validContacts = Array.isArray(contacts) ? contacts : [];

  // State for sorting with default sorting by createdAt
  //sortConfig is an object that keeps track of how the contacts should be sorted. It has two properties:
  //key: This is the column by which the contacts are currently sorted(e.g., 'name', 'email', 'createdAt').
  //direction: This indicates whether the sorting is in ascending('asc') or descending('desc') order.
  //The initial state is set to sort by the createdAt column in ascending order.
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "asc" });

  // Function to format total value
  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return "MYR0.00";
    const amt = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "MYR",
    });
    const laneAmt = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    );
    return amt.format(laneAmt);
  };

  // Sorting function
  const sortedContacts = [...validContacts].sort((a, b) => {
    // Extract total values for comparison
    //he replace(/[^0-9.-]+/g, "") part is used to clean up the formatted total value string (e.g., "MYR100.00") by removing any non-numeric characters (like "MYR").
    //This allows us to convert the cleaned string into a number for comparison.
    const aTotal = Number(formatTotal(a.Ticket).replace(/[^0-9.-]+/g, ""));
    const bTotal = Number(formatTotal(b.Ticket).replace(/[^0-9.-]+/g, ""));

    //This code checks if the total value for each contact's tickets is "MYR0.00". If it is, the contact is considered inactive (represented by 0),
    //otherwise, they are active (represented by 1).
    const aActive = formatTotal(a.Ticket) === "MYR0.00" ? 0 : 1;
    const bActive = formatTotal(b.Ticket) === "MYR0.00" ? 0 : 1;

    // The multiplication(*) combines the results of the two parts:
    // If the comparison returns 1(meaning a is greater), and the direction is ascending(1), the result is 1(meaning a comes after b).
    // If the comparison returns 1 and the direction is descending(-1), the result is - 1(meaning a comes before b).
    // If the comparison returns - 1(meaning a is less), and the direction is ascending(1), the result is - 1(meaning a comes before b).
    // If the comparison returns - 1 and the direction is descending(-1), the result is 1(meaning a comes after b).

    // Sort by Active status first
    if (sortConfig.key === "active") {
      // If sorting by active status, return:
      // - Positive value (1) if bActive is greater than aActive (b is more active than a)
      // - Negative value (-1) if aActive is greater than bActive (a is more active than b)
      // - Zero (0) if they are equal (both active or both inactive)
      //b is greater than a (e.g., in ascending order).
      return (bActive - aActive) * (sortConfig.direction === "asc" ? 1 : -1);
    }

    // Sort by Total Value if the key is 'totalValue'
    // bTotal - aTotal
    // This calculates the difference between the total values of b and a.
    // If bTotal is greater than aTotal, the result will be positive(indicating b should come before a).
    // If bTotal is less than aTotal, the result will be negative(indicating a should come before b).
    // If they are equal, the result will be 0(indicating they are equal in terms of sorting).
    if (sortConfig.key === "totalValue") {
      return (bTotal - aTotal) * (sortConfig.direction === "asc" ? 1 : -1);
    }

    // Sort by Name if the key is 'name'
    if (sortConfig.key === "name") {
      //If a's email is greater, it returns 1, indicating that a should come after b.
      //If a's email is not greater, it returns -1, indicating that a should come before b
      //If the direction is ascending ("asc"), it returns 1, If the direction is descending ("desc"), it returns -1.
      return (
        (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }

    // Sort by Email if the key is 'email'
    if (sortConfig.key === "email") {
      return (
        (a.email.toLowerCase() > b.email.toLowerCase() ? 1 : -1) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }

    // Default sorting by createdAt if no specific key is matched
    return (
      (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) *
      (sortConfig.direction === "asc" ? 1 : -1)
    );
  });

  // Function to handle sorting request and toggle chevron state
  //It checks if the clicked column is already the active sort column. If it is, it toggles the direction (from ascending to descending).
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"; // Default direction is ascending
    // Toggle direction if the same column is clicked
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"; // Change to descending
    }
    // Update the sort configuration state
    setSortConfig({ key, direction });
  };

  // Function to render the appropriate chevron icon based on the sort state
  const renderChevron = (key: string) => {
    const iconSize = "h-5 w-5"; // Increase size for a bolder appearance
    //If the current column is not the active sort column, it shows a neutral chevron icon.
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className={`${iconSize} text-gray-500`} />;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className={`${iconSize} text-blue-500`} />;
    }
    return <ChevronDown className={`${iconSize} text-blue-500`} />;
  };

  return (
    <BlurPage>
      <div className="flex items-center justify-between mr-6 mb-8">
        <h1 className="text-4xl py-4 px-2">Contacts</h1>
        <CreateContactButton subaccountId={subaccountId} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[130px]"
              onClick={() => requestSort("name")}
            >
              <div className="flex items-center gap-2 font-bold text-base">
                Name
                {renderChevron("name")}
              </div>
            </TableHead>
            <TableHead
              className="w-[400px]"
              onClick={() => requestSort("email")}
            >
              <div className="flex items-center gap-2 font-bold text-base">
                Email
                {renderChevron("email")}
              </div>
            </TableHead>
            <TableHead
              className="w-[340px]"
              onClick={() => requestSort("createdAt")}
            >
              <div className="flex items-center gap-2 font-bold text-base">
                Created Date
                {renderChevron("createdAt")}
              </div>
            </TableHead>
            <TableHead
              className="w-[200px]"
              onClick={() => requestSort("active")}
            >
              <div className="flex items-center gap-2 font-bold text-base">
                Status
                {renderChevron("active")}
              </div>
            </TableHead>

            <TableHead
              className="w-[300px]"
              onClick={() => requestSort("totalValue")}
            >
              <div className="flex items-center gap-2 font-bold text-base">
                Total Value
                {renderChevron("totalValue")}
              </div>
            </TableHead>
            <TableHead
              className="w-[200px]"
              onClick={() => requestSort("active")}
            >
              <div className="flex items-center gap-2 font-bold text-base">
                Action
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {sortedContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Avatar>
                      <AvatarImage alt={contact.name} />
                      <AvatarFallback className={getAvatarColor(contact.name)}>
                        {contact.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" sideOffset={5}>
                    <div className="flex items-center space-x-2">
                      <Contact2 className="h-6 w-6 text-muted-foreground" />
                      <div className="flex flex-col">
                        <h4 className="text-sm font-semibold">
                          {contact.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {contact.email}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Joined{" "}
                          {format(new Date(contact.createdAt), "MM/dd/yyyy")}
                        </span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{format(contact.createdAt, "MM/dd/yyyy")}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === "MYR0.00" ? (
                  <Badge variant={"destructive"}>Inactive</Badge>
                ) : (
                  <Badge className="bg-emerald-700">Active</Badge>
                )}
              </TableCell>
              <TableCell className="">{formatTotal(contact.Ticket)}</TableCell>
              <TableCell>
                <DeleteContactButton
                  contactId={contact.id}
                  subaccountId={subaccountId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BlurPage>
  );
};

export default ContactPage;
