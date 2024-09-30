"use client";

import { Agency } from "@prisma/client";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumberInput } from "@tremor/react";
import { v4 } from "uuid";

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
} from "../ui/form";

import * as z from "zod";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import {
  deleteAgency,
  initUser,
  saveActivityLogsNotification,
  updateAgencyDetails,
  upsertAgency,
} from "@/lib/queries";
import Loading from "../global/loading";
import { Button } from "../ui/button";
import { isValidPhoneNumber } from "libphonenumber-js";
import Fuse from "fuse.js";
import { getCode, getNames } from "country-list";

type Props = {
  data?: Partial<Agency>;
  //data prop can contain some or all of the properties defined in the Agency type, but it's not required to contain all of them and they can be present or absent in the object passed to the component.
};

// Define valid country names
const countryList = getNames();
const fuse = new Fuse(countryList, { threshold: 0.3 });

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Agency's name must be at least 2 characters." }),
  companyEmail: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  companyPhone: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid phone number.",
  }),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().refine((val) => countryList.includes(val), {
    message: "Please enter a valid country.",
  }),
  agencyLogo: z.string().min(1),
});

const AgencyDetails = ({ data }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const confirmationPhrase = "I AM CONFIRM";
  const [suggestion, setSuggestion] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      agencyLogo: data?.agencyLogo,
    },
  });

  const isLoading = form.formState.isSubmitting;

  //when the data prop changes, reset the form data, ensures that the form fields are updated with the latest data whenever the data prop changes.
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  // Validate country input with Fuse.js for fuzzy matching
  const validateCountry = (value: string) => {
    const result = countryList.includes(value);
    if (!result) {
      const suggestedCountry = fuse.search(value)?.[0]?.item;
      setSuggestion(suggestedCountry ? `Did you mean "${suggestedCountry}"?` : "");
    } else {
      setSuggestion("");
    }
  };

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    validateCountry(values.country);
    
    if (suggestion) {
      toast({
        variant: "destructive",
        title: "Invalid Country",
        description: suggestion,
      });
      return;
    }

    try {
      let newUserData;
      let custId;

      // Check if data.id is not present, indicating a new agency creation
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        };

        //responsible for creating a new Stripe customer when an agency is being created or updated with customerId
        //fetch API to send a POST request to the /api/stripe/create-customer endpoint with the necessary customer data.

        const customerResponse = await fetch("/api/stripe/create-customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        });

        const customerData: { customerId: string } =
          // The response from the server is then parsed into a JSON object
          await customerResponse.json();
        //the customerId is assigned to the custId variable. This custId is then used in the subsequent steps to create or update the agency in the database.
        custId = customerData.customerId;
      }

      //Initialize a new user with the role "AGENCY_OWNER"
      newUserData = await initUser({
        role: "AGENCY_OWNER",
      });

      // If neither customerId from data nor custId is defined, exit the function
      if (!data?.customerId && !custId) return;

      // Prepare the agency data
      const agencyData = {
        id: data?.id ? data.id : v4(),
        customerId: data?.customerId || custId || "", //the custId will store the customerId which fetch from the api.
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: "",
        goal: 5,
      };

      // Check if data.id is not present, indicating a new agency creation
      if (!data?.id) {
        // Create a new agency
        await upsertAgency(agencyData);
        toast({
          title: "Created Agency",
          description: "Your agency has been successfully created.",
        });
        if (data?.id) return router.refresh(); //might unnecessary
      } else {
        // Update existing agency
        await updateAgencyDetails(data.id, agencyData);
        toast({
          title: "Updated Agency",
          description: "Your agency details have been successfully updated.",
        });
      }
      // Refresh the router to fetch the updated data
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Sorry!",
        description: data?.id
          ? "Could not update your agency details. Please try again later."
          : "Could not create your agency. Please try again later.",
      });
    }
  };

  const handleDeleteAgency = async () => {
    if (!data?.id) return;
    setDeletingAgency(true);
    try {
      const response = await deleteAgency(data.id);
      toast({
        title: "Deleted Agency",
        description: "Deleted your agency and all subaccounts",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Sorry!",
        description: "could not delete your agency, Try again later.",
      });
    }
    setDeletingAgency(false);
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for you business. You can edit agency settings
            later from the agency settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="agencyLogo" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your agency name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +601116305241" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>White Label Agency</FormLabel>
                        <FormDescription>
                          Turning on white label mode will show your agency logo
                          to all sub accounts by default.
                        </FormDescription>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="No 49, Jalan Setia ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="state" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="zipCode" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="country" //This prop specifies the name of the form field. It should match the corresponding key in the defaultValues object and the keys defined in the FormSchema.
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Malaysia"
                        onChange={(e) => {
                          field.onChange(e);
                          validateCountry(e.target.value);
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    {suggestion && (
                      <p className="text-red-500 text-sm mt-2">{suggestion}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/*Set up goal for the agency */}
              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Create A Goal</FormLabel>
                  <FormDescription>
                    ✨ Create a goal for your agency. As your business grows
                    your goals grow too so don&rsquo;t forget to set the bar
                    higher!
                  </FormDescription>
                  <NumberInput
                    defaultValue={data.goal}
                    onValueChange={async (val: number) => {
                      if (!data?.id) return;
                      await updateAgencyDetails(data.id, { goal: val });
                      await saveActivityLogsNotification({
                        agencyId: data.id,
                        description: `Updated the agency goal to | ${val} Sub Account`,
                        subaccountId: undefined,
                      });
                      router.refresh();
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Sub Account Goal"
                  />
                </div>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loading /> : "Save Agency Information"}
              </Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-col p-4 mt-4 rounded-lg border border-destructive ">
              <div className=" flex flex-row items-center justify-between text-justify gap-4 ">
                <div className="border-r-2 pr-4 border-gray-600">
                  <div className="text-center">Danger Zone</div>
                </div>
                <div className="text-muted-foreground ">
                  Deleting your agency cannot be undone. This will also delete
                  all sub accounts and all data related to your sub accounts.
                  Sub accounts will no longer have access to funnels, contacts
                  etc.
                </div>
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingAgency}
                className="text-red-600 p-2 font-semibold text-center mt-2 rounded-md hover:bg-red-600 hover:text-white transition-all"
              >
                {deletingAgency ? "Deleting..." : "Delete Agency"}
              </AlertDialogTrigger>
            </div>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone. This will permanently delete the
                <span className="font-bold"> Agency Account</span> and all
                related <span className="font-bold">Sub Accounts.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <div className="flex flex-col w-full">
                <Input
                  placeholder={`To confirm, type "${confirmationPhrase}" in the box here`}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="mb-2 border-red-600 outline-none focus:border-transparent"
                />
                <AlertDialogCancel className="mb-3">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={
                    deletingAgency || confirmationInput !== confirmationPhrase
                  }
                  className="bg-destructive hover:bg-red-600"
                  onClick={handleDeleteAgency}
                >
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
