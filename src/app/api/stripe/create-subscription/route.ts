import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

//The function POST is exported and is expected to handle HTTP POST requests.
export async function POST(req: Request) {
  // receives a request object (req) and extracts the customerId and priceId from the JSON body of the request.
  const { customerId, priceId } = await req.json();
  //checks if both customerId and priceId are provided. If not, it returns a NextResponse with a status code of 400
  if (!customerId || !priceId)
    return new NextResponse("Customer Id or price id is missing", {
      status: 400,
    });

  //check if a subscription already exists for the given customerId. It includes the related Subscription entity.
  const subscriptionExists = await db.agency.findFirst({
    where: { customerId },
    include: { Subscription: true },
  });

  //If a subscription exists and is active, the function updates the subscription instead of creating a new one.
  try {
    if (
      subscriptionExists?.Subscription?.subscritiptionId &&
      subscriptionExists.Subscription.active
    ) {
      //update the subscription instead of creating one.
      if (!subscriptionExists.Subscription.subscritiptionId) {
        throw new Error(
          "Could not find the subscription Id to update the subscription."
        );
      }
      console.log("Updating the subscription");
      //retrieves the current subscription details using the Stripe API and updates the items to include the new priceId.
      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.Subscription.subscritiptionId
      );

      //If the subscription does not exist or is not active, the function creates a new subscription using the Stripe API with the provided customerId and priceId.
      const subscription = await stripe.subscriptions.update(
        subscriptionExists.Subscription.subscritiptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ["latest_invoice.payment_intent"],
        }
      );
      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } else {
        //creating a new subscription if does not exist.
      console.log("Creating a sub");
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId, //this priceId come frol the Url (above we have get the json response).
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
         expand: ["latest_invoice.payment_intent"],
       });

      //In both cases, the function returns a NextResponse with the subscription ID and the client secret from the latest invoice's payment intent.
      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (error) {
    //If any error occurs during the process, the function logs the error and returns a NextResponse with a status code of 500
    console.log("🔴 Error", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
