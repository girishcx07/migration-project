"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { toast } from "sonner";

import { XCircle, CheckCircle } from "lucide-react";

// Schema definition
const discountCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters.")
    .max(20, "Coupon code cannot exceed 20 characters.")
    .regex(/^[A-Z0-9]+$/, "Only uppercase letters and numbers are allowed."),
});

type DiscountCodeForm = z.infer<typeof discountCodeSchema>;

const DiscountCode = () => {
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm<DiscountCodeForm>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: { code: "" },
  });

  const {
    handleSubmit,
    resetField,
    setValue,
    control,
    formState: { isSubmitting },
  } = form;

  const code = useWatch({
    control,
    name: "code",
  });

  const onSubmit = async (data: DiscountCodeForm) => {
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setIsVerified(true);
      toast.success("Coupon verified successfully!");
    } catch (err) {
      toast.error("Failed to verify coupon.");
    }
  };

  const handleClear = () => {
    resetField("code");
  };

  const handleRemove = () => {
    setIsVerified(false);
    setValue("code", "");
    toast.info("Coupon removed.");
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter coupon code"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    disabled={isVerified}
                    endIcon={
                      code && !isVerified ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <XCircle
                              size={18}
                              className="text-muted-foreground cursor-pointer"
                              onClick={handleClear}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            className="bg-white text-muted-foreground"
                            side="top"
                          >
                            <span>Clear</span>
                          </TooltipContent>
                        </Tooltip>
                      ) : isVerified ? (
                        <CheckCircle size={18} className=" text-green-500" />
                      ) : null
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isVerified ? (
          <Button type="button" variant="outline" onClick={handleRemove}>
            Remove
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default DiscountCode;
