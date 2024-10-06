import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  getPipelineDetails,
  saveActivityLogsNotification,
  upsertAutomationConfig,
} from "@/lib/queries";
import { toast } from "../ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";
import Loading from "../global/loading";

export const AutomationFormSchema = z.object({
  warningThreshold: z
    .number()
    .min(0, "Warning threshold must be a non-negative number")
    .nullable(),
});

interface AutomationFormProps {
  pipelineId: string;
  warningThreshold?: number | null;
}

const AutomationForm: React.FC<AutomationFormProps> = ({
  pipelineId,
  warningThreshold,
}) => {
  const { setClose } = useModal();
  const router = useRouter();

  const form = useForm<z.infer<typeof AutomationFormSchema>>({
    resolver: zodResolver(AutomationFormSchema),
    defaultValues: {
      warningThreshold: warningThreshold ?? null,
    },
    mode: "onSubmit",
  });

  const isLoading = form.formState.isLoading;

  const onSubmit = async (values: z.infer<typeof AutomationFormSchema>) => {
    try {
      const thresholdValue = values.warningThreshold ?? 0;

      const response = await upsertAutomationConfig({
        warningThreshold: thresholdValue,
        pipelineId,
      });

      if (response) {
        const pipelineDetails = await getPipelineDetails(pipelineId);
        if (pipelineDetails) {
          await saveActivityLogsNotification({
            agencyId: undefined,
            description: `Updated automation settings for pipeline | ${pipelineDetails.name}`,
            subaccountId: pipelineDetails.subAccountId,
          });

          toast({
            title: "Success",
            description: `Updated automation for pipeline with ${thresholdValue} days threshold`,
          });

          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update automation settings",
      });
    } finally {
      setClose();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="warningThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warning Threshold (in days)</FormLabel>
              <FormControl>
                <Controller
                  name="warningThreshold"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(null);
                        } else {
                          field.onChange(parseInt(value, 10));
                        }
                      }}
                      value={field.value === null ? "" : field.value}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-20 mt-4" disabled={isLoading} type="submit">
          {form.formState.isSubmitting ? <Loading /> : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default AutomationForm;