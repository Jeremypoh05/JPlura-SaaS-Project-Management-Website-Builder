"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { pricingCards } from "@/lib/constants";
import { useModal } from "@/providers/modal-provider";
import { Plan } from "@prisma/client";
import { StripeElementsOptions } from "@stripe/stripe-js";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import Loading from "@/components/global/loading";
import SubscriptionForm from ".";

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();
  const router = useRouter();
  //selectedPriceId: State to store the currently selected price ID.
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | "">(
    data?.plans?.defaultPriceId || ""
  );
  //State to store the subscription details including subscriptionId and clientSecret.
  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ subscriptionId: "", clientSecret: "" });

  //this is used for the @stripe/react-stripe-js that memorize the below objects,
  //since we will use this component to get the clientSecret and it will render the stripe form.
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret, //without this, the stripe form will not be rendered
      //https://docs.stripe.com/elements/appearance-api
      appearance: {
        theme: "flat",
        variables: {
          fontFamily: "Sohne, system-ui, sans-serif",
          fontWeightNormal: "500",
          borderRadius: "8px",
          colorBackground: "#0A2540",
          colorPrimary: "#EFC078",
          accessibleColorOnColorPrimary: "#1A1B25",
          colorText: "white",
          colorTextSecondary: "white",
          colorTextPlaceholder: "#ABB2BF",
          tabIconColor: "white",
          logoColor: "dark",
        },
        rules: {
          ".Input": {
            backgroundColor: "#212D63",
            border: "1px solid var(--colorPrimary)",
          },
        },
      },
    }),
    [subscription]
  );

  //create a new subscription which gives us a client secret, and then we will store that and render out the form.
  useEffect(() => {
      //If statement: Checks if a selectedPriceId exists. If not, it returns early.
    if (!selectedPriceId) return;
    //The createSecret function sends a POST request to the /api/stripe/create-subscription endpoint with the customerId and priceId as JSON payload.
    const createSecret = async () => {
        //Sends a POST request to create a subscription with the customerId and selectedPriceId.
      const subscriptionResponse = await fetch(
        "/api/stripe/create-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            priceId: selectedPriceId,
          }),
        }
      );
      const subscriptionResponseData = await subscriptionResponse.json(); //get clientSecret.
      console.log("sub Response", subscriptionResponseData)

      //Upon receiving a successful response, it updates the subscription state with the clientSecret and subscriptionId from the response.
      setSubscription({
        clientSecret: subscriptionResponseData.clientSecret,
        subscriptionId: subscriptionResponseData.subscriptionId,
      });
      if (planExists) {
        toast({
          title: "Success",
          description: "Your plan has been changed according to your needs!",
        });
        setClose();
        setTimeout(() => {
          window.location.reload();
        }, 2000);  
      }
    };
    console.log("created secret", createSecret);
    createSecret();
  }, [data, selectedPriceId, customerId]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as Plan)}
            key={price.id}
            //whichever user selecting on, we just changing the border color.
            className={clsx("relative cursor-pointer transition-all", {
              "border-primary": selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                RM {price.unit_amount ? price.unit_amount / 100 : "0"}
                <p className="text-lg text-amber-400 uppercase pt-1">
                  {price.nickname}
                </p>
                <p className="text-base text-muted-foreground">
                  {
                    pricingCards.find((p) => p.priceId === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {pricingCards
                  .find((p) => p.priceId === price.id)
                  ?.features.map((feature, index) => (
                    <li key={index} className="list-disc text-muted-foreground ml-4">
                      {feature}
                    </li>
                  ))}
              </ul>
            </CardContent>
            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.clientSecret && !planExists && (
          <>
          {/* show the stripe form */}
            <h1 className="text-xl">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormWrapper;
