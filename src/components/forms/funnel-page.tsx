"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";

import { Button } from "../ui/button";
import Loading from "../global/loading";
import { useToast } from "../ui/use-toast";
import { FunnelPage } from "@prisma/client";
import { FunnelPageSchema } from "@/lib/types";

import {
  deleteFunnelPage,
  getFunnels,
  saveActivityLogsNotification,
  upsertFunnelPage,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";
import { CopyPlusIcon, Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";

interface CreateFunnelPageProps {
  defaultData?: FunnelPage; //Optional, the existing data of the funnel page to be edited.
  funnelId: string;
  order: number;
  subaccountId: string;
}

/*
component is responsible for creating or updating a funnel page. 
It uses a form to capture the details of the funnel page and handles form submission to save the data.
*/
const CreateFunnelPage: React.FC<CreateFunnelPageProps> = ({
  defaultData,
  funnelId,
  order,
  subaccountId,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const form = useForm<z.infer<typeof FunnelPageSchema>>({
    resolver: zodResolver(FunnelPageSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      pathName: "",
    },
  });

  //If defaultData is provided, the form is reset with the existing data when the component mounts or when defaultData changes.
  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName });
    }
  }, [defaultData]);

  const onSubmit = async (values: z.infer<typeof FunnelPageSchema>) => {
    if (order !== 0 && !values.pathName)
      return form.setError("pathName", {
        message:
          "Pages other than the first page in the funnel require a path name example 'secondstep'.",
      });
    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...values,
          id: defaultData?.id || v4(),
          order: defaultData?.order || order,
          pathName: values.pathName || "",
        },
        funnelId
      );

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a funnel page | ${response?.name}`,
        subaccountId: subaccountId,
      });

      toast({
        title: "Success",
        description: "Saves Funnel Page Details",
      });
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could Save Funnel Page Details",
      });
    }
  };

  const handleDeleteFunnel = async () => {
    if (!defaultData) return; // Ensure defaultData is defined

    setDeleting(true);
    try {
      const response = await deleteFunnelPage(defaultData.id);
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a funnel page | ${response?.name}`,
        subaccountId: subaccountId,
      });
      toast({
        title: "Success",
        description: "Deleted Funnel Page",
      });
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could Not Delete Funnel Page",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Page</CardTitle>
        <CardDescription>
          Funnel pages are flow in the order they are created by default. You
          can move them around to change their order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting || order === 0}
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Path Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Path for the page"
                      {...field}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : "Save Page"}
              </Button>

              {defaultData?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-22 self-end border-destructive text-destructive hover:bg-destructive"
                      disabled={form.formState.isSubmitting}
                      type="button"
                    >
                      {form.formState.isSubmitting ? <Loading /> : <Trash />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete this funnel page?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the funnel page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-red-600"
                        onClick={handleDeleteFunnel}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* duplicate functionality 
              If defaultData is provided, buttons for deleting and duplicating the page are rendered.
              */}
              {defaultData?.id && (
                <Button
                  variant={"outline"}
                  size={"icon"}
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    //  fetches all the funnels for the given subaccountId using getFunnels. This is necessary to determine the order of the new duplicated page.
                    const response = await getFunnels(subaccountId);
                    const lastFunnelPage = response.find(
                      (funnel) => funnel.id === funnelId
                    )?.FunnelPages.length; //finds the funnel with the funnelId and retrieves the length of its FunnelPages array. This length represents the number of pages currently in the funnel.
                    //The new duplicated page will be added at the end of the funnel, so its order is set to the length of the FunnelPages array.

                    //Then, The function calls upsertFunnelPage to create a new page with the same properties as the original page but with a new id.
                    await upsertFunnelPage(
                      subaccountId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastFunnelPage ? lastFunnelPage : 0, //The order is set to the position at the end of the funnel.
                        visits: 0,
                        name: `${defaultData.name} Copy`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      funnelId
                    );
                    toast({
                      title: "Success",
                      description: "Saves Funnel Page Details",
                    });
                    router.refresh();
                    window.location.reload();
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateFunnelPage;
