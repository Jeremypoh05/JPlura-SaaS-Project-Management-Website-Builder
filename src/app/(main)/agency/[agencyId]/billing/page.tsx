import { Separator } from "@/components/ui/separator";
import { addOnProducts, pricingCards } from "@/lib/constants";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import React from "react";
import PricingCard from "./_components/pricing-card";

type Props = {
  params: { agencyId: string };
};

const Billing = async ({ params }: Props) => {
  //Fetches a list of add-on products from Stripe, expanding the default price information for each product.
  const addOns = await stripe.products.list({
    //addOnProducts comes from the constant file.
    ids: addOnProducts.map((product) => product.id), //map the addOnProducts from the constant file to get its product.id, extracts the IDs from the addOnProducts constant.
    expand: ["data.default_price"],
  });

  //Fetches subscription details and customerId for the specific agency from the database using the agencyId.
  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  });

  //Fetches a list of active prices for a specific product from Stripe, identified by the NEXT_PLURA_PRODUCT_ID environment variable.
  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  });

  console.log("Prices:", prices);
  console.log("agencySubscription", agencySubscription);

  //check whether the pricingCards.id from the constant file match with the subscription.priceId.
  //Finds the current plan details by matching the priceId from pricingCards with the subscription's priceId.
  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  );

  //fetches the charges for a specific customer (identified by the agencySubscription?.customerId)
  //from the Stripe API using the stripe.charges.list method.
  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  });

  //The fetched charges are then mapped and transformed into an array of objects, where each object represents a charge with properties
  //Fetches a list of the last 50 charges for the customer identified by agencySubscription?.customerId.
  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000
      ).toLocaleDateString()}`,
      status: "Paid",
      amount: `RM${charge.amount / 100}`,
    })),
  ];

  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
      {/*Shows all the pricing cards */}
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}  //planExists: Checks if the subscription is active. */}
          prices={prices.data}      //planExists: Passes the list of prices fetched from Stripe.
          customerId={agencySubscription?.customerId || ""} // Passes the customerId from the agencySubscription, it is because when we created a new agency, we will automatically stored the customerId. Now we just fetch it.
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || "RM0"
              : "RM0"
          } //Displays the amount, either from the current plan or default to "RM0".
          buttonCta={
            agencySubscription?.Subscription?.active === true
              ? "Change Plan"
              : "Get Started"
          } //The text for the button, either "Change Plan" if the plan is active, or "Get Started".
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@JPlura-app.com" //A description about modifying the plan.
          highlightTitle="Plan Options" //Title for the plan options section.
          description={ //Description of the current plan or a default message to get started.
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || "Lets get started"
              : "Lets get started! Pick a plan that works best for you."
          }
          duration="/ month"
          features={ //: Features of the current plan or a default set of features.
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features || //if Subscription is not active, we also will fetch the constant pricingCards, where the pricing.title is "Starter". If it is, return the features.
              pricingCards.find((pricing) => pricing.title === "Starter")
                ?.features ||
              []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || "Starter"
              : "Starter"
          }
        />
        {/*another card */}
        {addOns.data.map((addOn) => (
          <PricingCard
            planExists={agencySubscription?.Subscription?.active === true}
            prices={prices.data}
            customerId={agencySubscription?.customerId || ""}
            key={addOn.id}
            amt={ //the amt from the stripe product
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                `RM${addOn.default_price.unit_amount / 100}`
                : "RM0"
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={"24/7 priority support"}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long lines with the click of a button."
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>

    </>
  );
};

export default Billing;
