"use client";
import { PricesList } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-modal";
import SubscriptionFormWrapper from "@/components/forms/subscription-form/subscription-form-wrapper";

type Props = {
  features: string[];
  buttonCta: string;
  title: string;
  description: string;
  amt: string;
  duration: string;
  highlightTitle: string;
  highlightDescription: string;
  customerId: string;
  prices: PricesList["data"];
  planExists: boolean;
};

const PricingCard = ({
  features,
  buttonCta,
  title,
  description,
  amt,
  duration,
  highlightTitle,
  highlightDescription,
  customerId,
  prices,
  planExists,
}: Props) => {
  const { setOpen } = useModal();
  const searchParams = useSearchParams();
  //use this searchParams to get the word "plan" from the url. Because sometimes by default, we want to get access to what user is
  //trying to access, so that, that time we can use this to show. A kind like caching the value
  const plan = searchParams.get("plan");

  const handleManagePlan = async () => {

    setOpen(
      <CustomModal
        title={"Manage Your Plan"}
        subHeading="You can change your plan at any time from the billings settings"
      >
        <SubscriptionFormWrapper
          customerId={customerId}
          planExists={planExists}
        />
      </CustomModal>,
      async () => ({
        plans: {
          defaultPriceId: plan ? plan : "",
          plans: prices,
        },
      })
    );
  };

  return (
    <Card className="flex flex-col justify-between lg:w-1/2">
      <div>
        <CardHeader className="flex flex-col md:!flex-row justify-between">
          <div className="w-[240px]">
            <CardTitle className="pb-3">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <p className="text-4xl font-bold">
            {amt}
            <span className="text-xs font-light text-muted-foreground">
              {duration}
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <ul>
            {features.map((feature) => (
              <li
                key={feature}
                className="list-disc ml-4 text-muted-foreground"
              >
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      <CardFooter>
        <Card className="w-full">
          <div className="flex flex-col md:!flex-row items-center justify-between rounded-lg border gap-4 p-4">
            <div>
              <p>{highlightTitle}</p>
              <p className="text-sm text-muted-foreground">
                {highlightDescription}
              </p>
            </div>

            <Button className="md:w-fit w-full" onClick={handleManagePlan}>
              {buttonCta}
            </Button>
          </div>
        </Card>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
