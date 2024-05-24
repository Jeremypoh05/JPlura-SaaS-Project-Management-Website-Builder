"use client";

import {
  AuthUserWithAgencySidebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { SubAccount, User } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from "@/lib/queries";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { Input } from "../ui/input";
import FileUpload from "../global/file-upload";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import { v4 } from "uuid";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

type Props = {
  id: string | null;
  type: "agency" | "subaccount";
  userData?: Partial<User>; //get the initial data
  subAccounts?: SubAccount[];
};

const UserDetails = ({ id, type, userData, subAccounts }: Props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts | null>(null);

  const { data, setClose } = useModal();
  const [roleState, setRoleState] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  //Get authUserDetails
  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails();
        if (response) setAuthUserData(response);
      };
      fetchDetails();
    }
  }, [data]);

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum([
      "AGENCY_OWNER",
      "AGENCY_ADMIN",
      "SUBACCOUNT_USER",
      "SUBACCOUNT_GUEST",
    ]),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    // ensures that the form data structure matches the schema defined by userDataSchema.
    resolver: zodResolver(userDataSchema), //use Zod's resolver to validate the form data against the userDataSchema.
    mode: "onChange", // which means validation will be triggered on every change to the form fields.
    defaultValues: {
      //If userData exists and has a corresponding property, use its value.
      //If userData doesn't have the corresponding property or is null/undefined, check if data?.user exists and has the property. If it does, use its value.
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  });

  useEffect(() => {
    if (!data.user) return; // If there's no user data, return early and do nothing.
    const getPermissions = async () => {
      if (!data.user) return;
      const permission = await getUserPermissions(data.user.id); // data.user.id is the ID of the user for whom permissions are being retrieved. This ID is passed as an argument to the getUserPermissions function.
      setSubAccountPermissions(permission); // Set the state variable subAccountPermissions to the received permissions and updates the component's state with the received permissions.
    };
    getPermissions(); //Invoke the getPermissions function when the effect runs,
  }, [data, form]); // Run this effect whenever the data or form dependencies change, the permissions will be refetched and updated accordingly.

  //check initial form values:
  useEffect(() => {
    console.log("userData:", userData);
    console.log("data?.user:", data?.user);

    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails();
        if (response) setAuthUserData(response);
      };
      fetchDetails();
    }
  }, [data]);

  useEffect(() => {
    if (data.user) {
      form.reset(data.user);
    }
    if (userData) {
      form.reset(userData);
    }
  }, [userData, data]);

  const onChangePermission = async (
    subAccountId: string, //The ID of the sub-account for which the permissions are being updated.
    val: boolean, //The new value of the permission (true for granting permission, false for revoking permission).
    permissionsId: string | undefined //The ID of the existing permission entry in the database. This is used when updating an existing permission entry rather than creating a new one.
  ) => {
    if (!data.user?.email) return; //ensure that there is a valid email associated with the user for whom permissions are being updated.
    setLoadingPermissions(true);
    const response = await changeUserPermissions(
      permissionsId ? permissionsId : v4(),
      data.user.email, //The email of the user for whom permissions are being updated.
      subAccountId, //The new value of the permission.
      val //The new value of the permission.
    );
    //for activity logs after change permissions.
    if (type === 'agency') {
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Gave ${data?.user?.name} access to | ${subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId
        )?.SubAccount.name
          } `,
        subaccountId: subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId
        )?.SubAccount.id,
      })
    }
    if (response) {
      toast({
        title: "Success",
        description: "The request was successful",
      });
      if (subAccountPermissions) {
        subAccountPermissions.Permissions.find((perm) => {
          if (perm.subAccountId === subAccountId) {
            return { ...perm, access: !perm.access };
          }
          return perm;
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not update permissions",
      });
    }
    router.refresh();
    setLoadingPermissions(false); //after changes, set loading permissions to false.
  };

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return;
    if (userData || data?.user) {
      //if userData exits, we will upsert or update it.
      const updatedUser = await updateUser(values);
      authUserData?.Agency?.SubAccount.filter(
        (subacc) =>
          authUserData.Permissions.find(
            (p) => p.subAccountId === subacc.id && p.access
          )
        //for each of them, we create an acitity log
      ).forEach(async (subaccount) => {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updated ${data?.user?.name} information`,
          subaccountId: subaccount.id,
        });
      });

      //if successfully updated, use toast message
      if (updatedUser) {
        toast({
          title: "Success",
          description: "Update User Information",
        });
        setClose();
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Oppse!",
          description: "Could not update user information",
        });
      }
    } else {
      console.log("Error could not submit");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === "AGENCY_OWNER" ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel> User Role</FormLabel>
                  <Select
                    disabled={field.value === 'AGENCY_OWNER'} // disabled={form.formState.isSubmitting}  disabled={field.value === 'AGENCY_OWNER'}
                    onValueChange={(value) => {
                      if (
                        value === "SUBACCOUNT_USER" ||
                        value === "SUBACCOUNT_GUEST"
                      ) {
                        setRoleState(
                          "You need to have subaccounts to assign Subaccount access to team members."
                        );
                      } else {
                        setRoleState("");
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value} //original role
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {type === "agency" && (
                        <>
                          <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                          {(data?.user?.role === "AGENCY_OWNER" ||
                            userData?.role === "AGENCY_OWNER") && (
                              <SelectItem value="AGENCY_OWNER">Agency Owner</SelectItem>
                            )}
                          <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                          <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
                        </>
                      )}
                      {type === "subaccount" && (
                        <>
                          {(data?.user?.role === "AGENCY_OWNER" ||
                            userData?.role === "AGENCY_OWNER") && (
                              <SelectItem value="AGENCY_OWNER">Agency Owner</SelectItem>
                            )}

                          {(data?.user?.role === "AGENCY_ADMIN" ||
                            userData?.role === "AGENCY_ADMIN") && (
                            <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                          )}
                          <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                          <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save User Details"}
            </Button>

            {authUserData?.role === "AGENCY_OWNER" && (
              <div>
                <Separator className="my-4" />
                <FormLabel> User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team member by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.Permissions.find(
                        (p) => p.subAccountId === subAccount.id
                      );
                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access} 
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subAccount.id,
                              permission,
                              subAccountPermissionsDetails?.id
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
