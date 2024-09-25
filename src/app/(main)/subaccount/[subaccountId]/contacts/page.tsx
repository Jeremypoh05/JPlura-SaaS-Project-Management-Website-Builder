import { db } from "@/lib/db"; // Adjust the import based on your project structure  
import { Contact, SubAccount, Ticket } from "@prisma/client";
import ContactPage from "./contact"; // Import the client component  

type Props = {
  params: { subaccountId: string };
};

const ContactsServer = async ({ params }: Props) => {
  console.log("Params:", params);

  if (!params.subaccountId) {
    console.error("subaccountId is missing");
    return <div>Error: subaccountId is missing</div>;
  }

  type SubAccountWithContacts = SubAccount & {
    Contact: (Contact & { Ticket: Ticket[] })[];
  };

  try {
    const contacts = await db.subAccount.findUnique({
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
    }) as SubAccountWithContacts;

    console.log("Fetched Contacts:", contacts);

    const allContacts = contacts?.Contact || [];

    return <ContactPage contacts={allContacts} subaccountId={params.subaccountId} />;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return <div>Error fetching contacts</div>;
  }
};

export default ContactsServer;