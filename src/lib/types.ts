import {
  Contact,
  Lane,
  Notification,
  Prisma,
  Role,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import {
  getAuthUserDetails,
  getMedia,
  getPipelineDetails,
  getUserPermissions,
} from "./queries";
import { db } from "./db";
import z from "zod";

export type NotificationWithUser =
  | ({
      User: {
        id: string;
        name: string;
        avatarUrl: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        agencyId: string | null;
      };
    } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

//a type alias that describes the expected structure and types of data returned by the getAuthUserDetails function.
export type AuthUserWithAgencySidebarOptionsSubAccounts =
  //PromiseReturnType is a utility type that extracts the return type of a promise.
  //By using PromiseReturnType<typeof getAuthUserDetails>, you're essentially
  //saying that AuthUserWithAgencySidebarOptionsSubAccounts will have the same structure as the resolved value of the promise returned by getAuthUserDetails.
  Prisma.PromiseReturnType<typeof getAuthUserDetails>;

/* from the getAuthUserDetails, it returns data
user: {
  name: "John",
  email: "john@example.com",
}
so, AuthUserWithAgencySidebarOptionsSubAccounts describe this structure,
 user: {
  name: string;
  email: string;
 }
*/
const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
  agencyId: string
) => {
  return await db.user.findFirst({
    where: { Agency: { id: agencyId } },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });
};

export type UsersWithAgencySubAccountPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
  >;

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>;

//type alias that describes the structure of the input data required to create a new media item in the database.
export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput;

export type TicketAndTags = Ticket & {
  Tags: Tag[];
  Assigned: User | null;
  Customer: Contact | null;
};

export type LaneDetail = Lane & {
  Tickets: TicketAndTags[];
};

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
});

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
});

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof getPipelineDetails
>;

export const LaneFormSchema = z.object({
  name: z.string().min(1),
});
