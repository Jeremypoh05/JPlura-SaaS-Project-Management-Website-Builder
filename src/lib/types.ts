import {
  Contact,
  Icon,
  Invitation,
  Lane,
  Notification,
  Permissions,
  Prisma,
  Role,
  SubAccount,
  Subscription,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import {
  _getTicketsWithAllRelations,
  getAuthUserDetails,
  getFunnels,
  getMedia,
  getPipelineDetails,
  getTicketsWithTags,
  getUserPermissions,
} from "./queries";
import { db } from "./db";
import z from "zod";
import Stripe from "stripe";
import { CSSProperties } from "react";
import { IconName } from "@fortawesome/free-solid-svg-icons";

export type AgencySidebarOption = {
  id: string;
  name: string;
  link: string;
  icon: Icon;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SubAccountSidebarOption = {
  id: string;
  name: string;
  link: string;
  icon: Icon;
  createdAt: Date;
  updatedAt: Date;
  subAccountId: string | null;
};

type SubAccountWithSidebarOption = SubAccount & {
  SidebarOption: SubAccountSidebarOption[];
};

// Define the UserWithAgency type
export type UserWithAgency = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  role: Role;
  agencyId: string | null;
  Agency: {
    id: string;
    connectAccountId: string | null;
    customerId: string;
    name: string;
    agencyLogo: string;
    companyEmail: string;
    companyPhone: string;
    whiteLabel: boolean;
    address: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    goal: number;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
    SubAccount: SubAccountWithSidebarOption[];
    SidebarOption: AgencySidebarOption[];
    Notification: Notification[];
    Subscription: Subscription | null;
  } | null;
  Permissions: Permissions[];
};

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
      isRead: boolean;
      ticketId: string | null;
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

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof getPipelineDetails
>;

export const LaneFormSchema = z.object({
  name: z.string().min(1, "Lane name is required"),
});

export type TicketWithTags = Prisma.PromiseReturnType<
  typeof getTicketsWithTags
>;

// regular expression that matches strings representing valid currency values. It allows decimal numbers with up to two decimal places.
//e.g., 100.50
const currencyNumberRegex = /^\d+(\.\d{1,2})?$/;

export const TicketFormSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  description: z.string().optional(),
  //The value field is validated using the currencyNumberRegex to ensure that it represents a valid currency value. If the value field does not match the regular expression,
  //the message property of the refine function is used to provide a descriptive error message.
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: "Value must be a valid price.",
  }),
  startDate: z.date().optional(), // Optional start date
  dueDate: z.date().optional(), // Optional due date
});

export type TicketDetails = Prisma.PromiseReturnType<
  typeof _getTicketsWithAllRelations
>;

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
});

//stripe payments thing
export type Address = {
  city: string;
  country: string;
  line1: string;
  postal_code: string;
  state: string;
};

export type ShippingInfo = {
  address: Address;
  name: string;
};

export type StripeCustomerType = {
  email: string;
  name: string;
  shipping: ShippingInfo;
  address: Address;
};

export type PricesList = Stripe.ApiList<Stripe.Price>;

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
  published: z.boolean().default(false),
});

//This type will include both the properties of the funnel model and the related FunnelPages model.
export type FunnelsForSubAccount = Prisma.PromiseReturnType<
  typeof getFunnels
>[0];

export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput;

export const FunnelPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
});

export interface CustomStyles extends CSSProperties {
  icon?: IconName;
  iconColor?: string;
  iconFontSize?: number;
  hoverIconColor?: string;
  transitionDuration?: string;
  enableHover?: boolean;
  fontImport?: string;
}
