"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePaymentSummary } from "../context/payment-summary-context";
import { toast } from "sonner";

const gstFormSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(100),
  gstNumber: z
    .string()
    .regex(
      /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})$/,
      "Invalid GST number"
    ),
  address: z.string().min(5, "Address is too short").max(200),
  pincode: z
    .string()
    .length(6, "Pincode must be 6 digits")
    .regex(/^\d{6}$/, "Only digits allowed"),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
});

type GstFormValues = z.infer<typeof gstFormSchema>;

export default function GstBillingDetails() {
  const { gstDetailsFormRef } = usePaymentSummary();

  const form = useForm<GstFormValues>({
    resolver: zodResolver(gstFormSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      gstNumber: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
    },
  });

  const { formState, trigger, getValues, reset } = form;

  useImperativeHandle(
    gstDetailsFormRef,
    () => ({
      validate: async () => {
        const isValid = await trigger(undefined, { shouldFocus: true });
        if (!isValid) {
          toast.error(
            `Please fill all required fields correctly in the GST Billing Details form.`
          );
        }
        return isValid;
      },
      getValues,
      reset,
      getFormState: () => formState,
    }),
    [formState, trigger, getValues, reset]
  );

  return (
    <>
      <h6 className="text-lg p-2 font-bold">GST Billing Details</h6>
      <Form {...form}>
        <form className="grid md:grid-cols-2 gap-3 px-3">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter GST number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input placeholder="Enter 6-digit pincode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}
