import { db } from "@/lib/db";
import { Contact, SubAccount, Ticket } from "@prisma/client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import BlurPage from "@/components/global/blur-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import format from 'date-fns/format'
import CreateContactButton from "./_components/create-contact-button";

type Props = {
  params: { subaccountId: string };
};

const ContactPage = async ({ params }: Props) => {
  type SubAccountWithContacts = SubAccount & {
    Contact: (Contact & { Ticket: Ticket[] })[]; //because a contact can have multiple tickets assigned to them.
  };

  const contacts = (await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },

    include: {
      Contact: {
        include: {
          Ticket: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })) as SubAccountWithContacts;

  const allContacts = contacts.Contact;

  //estimate of ticket values
  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return "MYR0.00";
    // Intl.NumberFormat, JavaScript can construct an object that will have the ability to style (or to be technically correct, format) numbers based on human languages. In other words, numbers can be styled in a more human-understandable format.
    //Instead of numbers being presented as bland as 1234 or 4561254, numbers can be better presented as 1, 234 or $4, 561.254.
    const amt = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "MYR",
    });

    //it will only be executed when the tickets array changes.
    const laneAmt = tickets.reduce(
      // If the value property is not present or is not a number, it defaults to 0. The result is then returned and used to display the total value of the tickets in the lane.
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    );

    return amt.format(laneAmt);
  };

  return (
    <BlurPage>
      <h1 className="text-4xl py-4 px-2">Contacts</h1>
      <CreateContactButton subaccountId={params.subaccountId} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead className="w-[200px]">Active</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === "MYR0.00" ? (
                  <Badge variant={"destructive"}>Inactive</Badge>
                ) : (
                  <Badge className="bg-emerald-700">Active</Badge>
                )}
              </TableCell>
              <TableCell>{format(contact.createdAt, "MM/dd/yyyy")}</TableCell>
              <TableCell className="text-right">
                {formatTotal(contact.Ticket)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BlurPage>
  );
};

export default ContactPage;
