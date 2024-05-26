import { stripe } from "@/lib/stripe";
import { StripeCustomerType } from "@/lib/types";
import { NextResponse } from "next/server";

//POST request handler that creates a new customer in the Stripe payment platform.
//This function is an API endpoint that handles POST requests.
export async function POST(req: Request) {
  //extracts the JSON payload from the request body and assigns its properties to the address, email, name, and shipping variables.
  //The type annotation : StripeCustomerType ensures that the extracted data matches the StripeCustomerType type.
  const { address, email, name, shipping }: StripeCustomerType =
    await req.json();

  //checks if any of the required fields (email, address, name, or shipping) are missing from the request body.
  //If any of these fields are missing, it returns a NextResponse object with a status code of 400
  if (!email || !address || !name || !shipping)
    return new NextResponse("Missing data", {
      status: 400,
    });
  // main body of the POST function. Attempts to create a new customer in Stripe using the stripe.customers.create method
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      address,
      shipping,
    });
    //If successful, it returns a Response.json object with the customer's ID. So we can save it in the database, and this customerId will be used in agencyDetails  
    return Response.json({ customerId: customer.id });
  } catch (error) {
    console.log("🔴 Error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
