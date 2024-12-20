"use server";

import { clerkClient, currentUser } from "@clerk/nextjs";
import { db } from "./db";
import { redirect } from "next/navigation";
import {
  Agency,
  Lane,
  Plan,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import { v4 } from "uuid";
import {
  CreateFunnelFormSchema,
  CreateMediaType,
  UpsertFunnelPage,
  UserWithAgency,
} from "./types";
import z from "zod";
import { revalidatePath } from "next/cache";

export const getAuthUserDetails = async (): Promise<UserWithAgency | null> => {
  const user = await currentUser();
  if (!user) {
    return null; // Return null explicitly
  }

 const userData = await db.user.findUnique({
   where: {
     email: user.emailAddresses[0].emailAddress,
   },
   include: {
     Agency: {
       include: {
         SidebarOption: true, 
         SubAccount: {
           include: {
             SidebarOption: true,
           },
         },
         Subscription: true,
       },
     },
     Permissions: true, 
   },
 });

  return userData as UserWithAgency; // Cast to UserWithAgency
};  

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
  isRead = false,
  ticketId,
  assignedUserId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
  isRead?: boolean;
  ticketId?: string;
  assignedUserId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    });
    if (response) {
      userData = response;
      console.log("User found by subaccountId:", userData);
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
    console.log("User found by authUser email:", userData);
  }

  if (!userData) {
    console.log("Could not find a user");
    return;
  }

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error(
        "You need to provide at least an agency Id or subaccount Id"
      );
    }

    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });

    if (response) foundAgencyId = response.agencyId;
    console.log("Found agencyId from subaccountId:", foundAgencyId);
  }

  try {
    if (subaccountId) {
      // Create notification data with proper Prisma type
      const notificationData: Prisma.NotificationCreateInput = {
        notification: `${userData.name} | ${description}`,
        isRead,
        // If ticketId exists, create a relation to the Ticket model
        ...(ticketId && { ticket: { connect: { id: ticketId } } }), // Connect to ticket using proper Prisma relation
        // Connect to User model - either assignedUser or current user
        User: {
          connect: {
            id: assignedUserId || userData.id,
          },
        },
        // Connect to Agency model
        Agency: {
          connect: {
            id: foundAgencyId!,
          },
        },
        // Connect to SubAccount model
        SubAccount: {
          connect: { id: subaccountId },
        },
      };

      console.log("Creating notification with data:", notificationData);
      const createdNotification = await db.notification.create({
        data: notificationData,
      });
      console.log("Created notification:", createdNotification);
    } else {
      const notificationData: Prisma.NotificationCreateInput = {
        notification: `${userData.name} | ${description}`,
        isRead,
        ...(ticketId && { ticket: { connect: { id: ticketId } } }),
        User: {
          connect: {
            id: assignedUserId || userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId!,
          },
        },
      };

      const createdNotification = await db.notification.create({
        data: notificationData,
      });
      console.log("Created notification:", createdNotification);
    }
  } catch (error) {
    console.error("Error saving notification:", error);
  }
}

export const updateNotificationsAsRead = async (userId: string) => {
  try {
    const response = await db.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,  // Only update unread notifications
      },
      data: {
        isRead: true
      }
    });
    return response;
  } catch (error) {
    console.error('Error updating notifications:', error);
    throw error;
  }
};

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") {
    return null; //means that they have already have access
  }

  const response = await db.user.create({
    data: { ...user },
  });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  //if they are invited
  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });
      //to delete the invitation, so we no longer end up creating accounts
      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else return null;
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};

//especially for agency goals
export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

//delete Agency
export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: { id: agencyId },
  });
  return response;
};

//setup initial agency owner
export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return;

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  //update user's private metadata
  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });
  return userData;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency, //It ensures that all existing fields of the agency are preserved when creating or updating the agency.
        SidebarOption: {
          //this SidebarOption have relationship with AgencySidebarOption[], which have declared in schema.prisma
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: {
        User: true,
        ticket: true, // Include ticket data
      },
       orderBy: [
        {
          ticketId: 'desc', // Put ticket notifications first
        },
        {
          createdAt: 'desc',
        },
      ],
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;

  //find the agency owner associated with the provided agencyId. This is necessary to assign appropriate
  //permissions to the agency owner for the newly created or updated subaccount.
  const agencyOwner = await db.user.findFirst({
    where: {
      // specifies that the user must be associated with an agency whose ID matches the agencyId property of the subAccount object.
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER", //specifying that the user must have the role of "AGENCY_OWNER".
    },
  });

  // If no agency owner found, return an error
  if (!agencyOwner) return console.log("🔴Error, could not create subaccount");

  const permissionId = v4(); //If an agency owner is found, a unique permission ID is generated using v4() from the uuid library.

  try {
    let existingSubAccount = await db.subAccount.findUnique({
      where: { id: subAccount.id },
    });

    if (existingSubAccount) {
      await db.subAccount.update({
        where: { id: subAccount.id },
        data: subAccount,
      });

      const updatedSubAccount = await db.subAccount.findUnique({
        where: { id: subAccount.id },
      });

      console.log("Updated subaccount:", updatedSubAccount);
      return updatedSubAccount; //If a subaccount with the provided ID already exists in the database, it updates the existing record with the new data provided in the subAccount object.
    } else {
      // If the subaccount does not exist, create it
      const response = await db.subAccount.create({
        data: {
          // If no subaccount with the provided ID exists, it creates a new subaccount using the data provided in the subAccount object.
          ...subAccount,
          Permissions: {
            create: {
              access: true,
              email: agencyOwner.email,
              id: permissionId,
            },
            connect: {
              subAccountId: subAccount.id,
              id: permissionId,
            },
          },
          //when a new subaccount is created or updated, a new pipeline is also created if it doesn't already exist.
          Pipeline: {
            create: { name: "Lead Cycle" },
          },
          SidebarOption: {
            create: [
              {
                name: "Settings",
                icon: "settings",
                link: `/subaccount/${subAccount.id}/settings`,
              },
              {
                name: "Funnels",
                icon: "pipelines",
                link: `/subaccount/${subAccount.id}/funnels`,
              },
              {
                name: "Media",
                icon: "database",
                link: `/subaccount/${subAccount.id}/media`,
              },
              {
                name: "Pipelines",
                icon: "flag",
                link: `/subaccount/${subAccount.id}/pipelines`,
              },
              {
                name: "Contacts",
                icon: "person",
                link: `/subaccount/${subAccount.id}/contacts`,
              },
              {
                name: "Dashboard",
                icon: "category",
                link: `/subaccount/${subAccount.id}`,
              },
            ],
          },
        },
      });

      console.log("Created subaccount:", response);
      return response;
    }
    // Catch any errors during the operation and log them
  } catch (error) {
    console.error("🔴Error during upsert operation:", error);
    return null;
  }
};

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    //query the database for a single user record based on the provided user ID
    where: { id: userId }, //this userId is the id passed from the user-details page (data.user.id)
    //so all the subaccounts that the user have permissions to access
    select: { Permissions: { include: { SubAccount: true } } }, //means that not only permissions but also the subaccounts that the user has access to will be returned
  });

  return response;
};

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || "SUBACCOUNT_USER",
    },
  });

  return response;
};

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    });
    return response;
  } catch (error) {
    console.log("🔴Could not change permission", error);
  }
};

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  });
  return response;
};

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  });
  return response;
};

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  //we need this to check whether the user has already sign up become agency, if there are, so that we will not send invitation to themselves.
  const response = await db.invitation.create({
    data: { email, agencyId, role },
  });

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return response;
};

export const getMedia = async (subaccountId: string) => {
  const mediafiles = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    include: { Media: true },
  });
  return mediafiles;
};

export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  });
  return response;
};

//the pipelineId is an argument which passed from the piplelineId(page.tsx) the url parameter one. Where the pipeline.id from the database match with this argument.
//after matching, return the result from the database.
export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  });
  return response;
};

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId, //same with pipelineId from the database match with the piplelineId passed as argument (a shorthand)
    },
    orderBy: { order: "asc" },
    include: {
      Tickets: {
        orderBy: {
          order: "asc",
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  });
  return response;
};

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  });

  return response;
};

export const upsertAutomationConfig = async (automation: {
  pipelineId: string;
  warningThreshold: number;
}) => {
  const response = await db.pipeline.update({
    where: { id: automation.pipelineId },
    data: {
      warningThreshold: automation.warningThreshold,  // updating warningThreshold field in Pipeline model
    },
  });

  return response;
};

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  });
  return response;
};

//updating the order of lanes in the database
//takes an array of Lane objects as an argument.
export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    // Each update operation updates the order property of a Lane object in the database. The id property of the Lane object is used as the where condition to find the correct Lane record in the database.
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        //order property represents the position of the lane in the list.
        data: {
          order: lane.order,
        },
      })
    );
    //db.$transaction function to execute all the update operations in a single transaction. This ensures that the database remains consistent and that no other operations can interfere with the update operations.
    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "ERROR UPDATE LANES ORDER");
  }
};

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "🔴 ERROR UPDATE TICKET ORDER");
  }
};

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number;

  //if the order property of the lane object is defined. If it's not, it retrieves the current order of all Lanes associated with the provided pipelineId.
  //If the order property is defined, it uses the value provided in the lane object.
  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane, // The update parameter updates the Lane record if it exists,
    create: { ...lane, order }, //create parameter creates a new Lane record if it doesn't exist. The ...lane spread operator allows the function to pass all the properties of the lane object to the update or create method of the db.lane.upsert method.
  });

  return response;
};

export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete({ where: { id: laneId } });
  return response;
};

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      //where ticket's Lane model's pipelineId(Lane.pipelineId) equal to the pipelineId we passed here.
      Lane: {
        pipelineId,
      },
    },
    //when we creating tickets, we actually can create custom tags and assigned those tags to each ticket
    include: { Tags: true, Assigned: true, Customer: true },
  });
  return response;
};

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  });
  return response;
};

//fetch all the users who have the "SUBACCOUNT_USER" role and have access to a specific subaccount.
//can be used to retrieve a list of all team members for a specific subaccount,
export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      // the users must belong to an agency that has a subaccount with the specified subaccountId
      Agency: {
        SubAccount: {
          some: {
            id: subaccountId,
          },
        },
      },
      //and have the "SUBACCOUNT_USER" role.
      role: "SUBACCOUNT_USER",
      //the users must have access to the specified subaccountId.
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  });
  return subaccountUsersWithAccess;
};

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  });
  return response;
};

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number;
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    });
    order = tickets.length;
  } else {
    order = ticket.order;
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  });

  return response;
};

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  });
  return response;
};

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  });

  return response;
};

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } });
  return response;
};

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  });
  return response;
};

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact, //CREATE a new contact if doesn't exist
  });
  return response;
};

export const deleteContact = async (contactId: string) => {
  try {
    const response = await db.contact.delete({
      where: {
        id: contactId,
      },
    });
    return response;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

//get all the funnels
//including both the funnel model information and the related FunnelPages information.
//The include: { FunnelPages: true } part of the query ensures that the returned data includes the related FunnelPages for each funnel.
export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  });

  return funnels;
};

//specific funnel
export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return funnel;
};

export const upsertFunnel = async (
  subaccountId: string,
  //funnel is an object that contains the data needed to create or update a funnel.
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string
) => {
  //either update or create a funnel record in the database. If a funnel with the provided funnelId already exists in the database,
  //the existing record is updated with the new data provided in the funnel object. If no funnel with the provided funnelId exists,
  //a new funnel record is created using the data provided in the funnel object.
  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: funnel,
    create: {
      //spread operator that allows the function to pass all the properties of the funnel object to the create or update method of the db.funnel.upsert method.
      ...funnel,
      id: funnelId || v4(), // generates a unique ID for the funnel if one is not provided in the funnel object
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const updateFunnelPublishedStatus = async (
  funnelId: string,
  published: boolean
) => {
  const response = await db.funnel.update({
    where: { id: funnelId },
    data: { published },
  });

  return response;
};

//
export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  });
  return data;
};

//either update an existing funnel page or create a new one if it doesn't exist
export const upsertFunnelPage = async (
  subaccountId: string, // The ID of the subaccount to which the funnel page belongs.
  funnelPage: UpsertFunnelPage,
  funnelId: string //The ID of the funnel to which the page belongs.
) => {
  // checks if subaccountId and funnelId are provided. If either is missing, the function returns early without doing anything.
  if (!subaccountId || !funnelId) return;
  // update an existing record or create a new one.
  const response = await db.funnelPage.upsert({
    //where:  If funnelPage.id is provided, it uses that ID; otherwise, it uses an empty string, which means no existing record will be found.
    where: { id: funnelPage.id || "" }, //if where clause match the condition, update part is executed, else run the create part.
    update: { ...funnelPage }, // specifies the fields to update if an existing record is found. It spreads the funnelPage object, updating all its properties.
    create: {
      //specifies the fields to create a new record if no existing record is found. It also spreads the funnelPage object but includes additional logic for the content field:
      ...funnelPage,
      content: funnelPage.content //If funnelPage.content is provided, it uses that value.
        ? funnelPage.content //If funnelPage.content is not provided, it sets a default content value, which is a JSON string representing a basic structure with a Body element.
        : JSON.stringify([
          {
            content: [],
            id: "__body",
            name: "Body",
            styles: { backgroundColor: "white" },
            type: "__body",
          },
        ]),
      funnelId,
    },
  });
  //This line calls a function revalidatePath to revalidate the cache for the specified path. This ensures that any cached data for the funnel page is updated to reflect the latest changes.
  //The second parameter "page" indicates that the revalidation is for a page.
  //This is crucial in scenarios where data changes frequently, and you want to make sure users always see the latest information.
  revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, "page");
  return response; //returns the response from the upsert operation, which contains the details of the upserted funnel page.
};

/* 
Suppose a user updates the content of a funnel page via a form in your web application.
The upsertFunnelPage function is called with the updated content.
The function performs the upsert operation, updating the database with the new content.
The revalidatePath function is then called with the path of the updated funnel page.
This ensures that any cached version of this funnel page is invalidated.
The next time a user accesses this funnel page, the latest content is fetched and displayed.
*/
export const deleteFunnel = async (funnelId: string) => {
  try {
    const response = await db.funnel.delete({
      where: {
        id: funnelId,
      },
    });
    return response;
  } catch (error) {
    console.error("Error deleting funnel:", error);
    throw error;
  }
};

export const deleteFunnelPage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } });

  return response;
};

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  });

  return response;
};

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: { FunnelPages: true },
  });
  return response;
};

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  });
  return response;
};
