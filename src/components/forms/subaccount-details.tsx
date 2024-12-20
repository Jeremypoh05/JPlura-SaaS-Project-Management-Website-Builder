"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import FileUpload from "../global/file-upload";
import { Agency, SubAccount } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";
import { useEffect, useState } from "react";
import Loading from "../global/loading";
import { useModal } from "@/providers/modal-provider";
import { isValidPhoneNumber } from "libphonenumber-js";
import Fuse from "fuse.js";
import { getCode, getNames } from "country-list";

// Define valid country names
const countryList = getNames();
const fuse = new Fuse(countryList, { threshold: 0.3 });

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Agency's name must be at least 2 characters." }),
  companyEmail: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  companyPhone: z.string().refine(isValidPhoneNumber, {
    message: "Invalid phone number.Please use international format(e.g., +601116305211).",
  }),
  address: z.string(),
  city: z.string(),
  subAccountLogo: z.string(),
  zipCode: z.string(),
  state: z.string(),
  country: z.string().refine((val) => countryList.includes(val), {
    message: "Please enter a valid country.",
  }),
});

interface SubAccountDetailsProps {
  //To add the sub account to the agency
  agencyDetails: Agency;
  details?: Partial<SubAccount>;
  userId: string;
  userName: string;
  addSubaccount?: (newSubaccount: SubAccount) => void; // Now optional
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  agencyDetails,
  addSubaccount,
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name,
      companyEmail: details?.companyEmail,
      companyPhone: details?.companyPhone,
      address: details?.address,
      city: details?.city,
      zipCode: details?.zipCode,
      state: details?.state,
      country: details?.country,
      subAccountLogo: details?.subAccountLogo,
    },
  });

  console.log("agency response", agencyDetails);
  console.log("details", details);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
      const response = await upsertSubAccount({
        id: details?.id ? details.id : v4(),
        address: values.address,
        subAccountLogo: values.subAccountLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        agencyId: agencyDetails.id,
        connectAccountId: "",
        goal: 5000,
      });

      console.log("Full response from upsertSubAccount:", response);
      console.log("subaccount id response", response?.id);

      if (!response || !response.id)
        throw new Error("No response from server or missing ID");

      await saveActivityLogsNotification({
        agencyId: response.agencyId,
        description: `updated sub account | ${response.name}`,
        subaccountId: response.id,
      });

      toast({
        title: "Subaccount details saved",
        description: "Successfully saved your subaccount details.",
      });
      setClose();
      router.refresh();
      // Check if addSubaccount exists before calling it
      if (addSubaccount) {
        addSubaccount(response); // Call the addSubaccount function to update the state in the parent component
      }
    } catch (error) {
      console.error("Error saving sub account details:", error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not save sub account details.",
      });
    }
  }

  useEffect(() => {
    if (details) {
      form.reset(details);
    }
  }, [details]);

  const isLoading = form.formState.isSubmitting;
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sub Account Information</CardTitle>
        <CardDescription>Please enter business details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
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
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Your agency name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
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
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +601116305241" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input required placeholder="123 st..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex md:flex-row gap-4">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input required placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input required placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcode</FormLabel>
                    <FormControl>
                      <Input required placeholder="Zipcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="country"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : "Save Account Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubAccountDetails;
