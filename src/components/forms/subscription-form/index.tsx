"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plan } from "@prisma/client";
import {
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";

type Props = {
    selectedPriceId: string | Plan;
};

const SubscriptionForm = ({ selectedPriceId }: Props) => {
    const { toast } = useToast();
    const elements = useElements(); //A hook from Stripe that provides the Stripe Elements instance, which manages payment elements.
    const stripeHook = useStripe(); //A hook from Stripe that provides the main Stripe instance, which is used to interact with the Stripe API.
    const [priceError, setPriceError] = useState("");
    const router = useRouter();
    const { setClose } = useModal();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        //Checks if a plan is selected. If not, sets an error message
        if (!selectedPriceId) {
            setPriceError("You need to select a plan to subscribe.");
            return;
        }
        setPriceError("");
        event.preventDefault();
        if (!stripeHook || !elements) return;

        try {
            // This function confirms the payment using the Stripe API. It takes in the elements instance and confirmParams,
            // which includes a return_url where the user is redirected after the payment.
            const { paymentIntent, error } = await stripeHook.confirmPayment({
                elements, //This instance is required as it holds the user's payment details securely.
                confirmParams: {
                    //Contains configuration like return_url, which is the URL to redirect the user after payment.
                    return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
                },
                redirect: "if_required",
            });

            if (error) {
                throw new Error();
            }

            //check if the paymentIntent status is succeeded. 
            if (paymentIntent && paymentIntent.status === "succeeded") {
                toast({
                    title: "Payment successful",
                    description: "Your payment has been successfully processed.",
                });
                setClose();
                setTimeout(() => {
                    router.replace(`${process.env.NEXT_PUBLIC_URL}/agency`);
                }, 2000);
            }
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Payment failed",
                description:
                    "We couldn't process your payment. Please fill all the information or try a different card.",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <small className="text-destructive">{priceError}</small>
            <PaymentElement />{" "}
            {/*A component provided by Stripe for securely collecting payment details. */}
            <Button disabled={!stripeHook} className="mt-4 w-full">
                Submit
            </Button>
        </form>
    );
};
export default SubscriptionForm;
