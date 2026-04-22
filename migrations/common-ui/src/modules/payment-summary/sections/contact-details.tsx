"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useApplicationDetails } from "@workspace/common-ui/hooks/global-queries";
import { useTimer } from "@workspace/common-ui/hooks/use-timer";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { DIGIT_ONLY_REGEX } from "@workspace/common/constants";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Edit } from "lucide-react";
import { useImperativeHandle, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { usePaymentSummary } from "../context/payment-summary-context";
import { cn } from "@workspace/ui/lib/utils";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "Must be at least 2 characters")
    .max(50)
    .refine((val) => !/\s{2,}/.test(val)),
  lastName: z
    .string()
    .min(2, "Must be at least 2 characters")
    .max(50)
    .refine((val) => !/\s{2,}/.test(val)),
  // mobile_no: z.string().min(10).max(15).regex(/^\d+$/, "Only digits allowed"),
  mobile_no: z
    .string()
    .regex(/^\d{10,15}$/, "Must be 10 to 15 digits")
    .refine((val) => !/\s{2,}/.test(val)),
  // email: z.string().min(5).max(100).email("Invalid email"),
  email: z
    .string()
    .min(5, "Must be at least 5 characters")
    .max(100, "Cannot exceed 100 characters")
    .email("Must be a valid email address"),
  otp: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: "Must be exactly 4 digits",
    }),
  user_id: z.string(),
  // application_id: z.string(),
});

type ContactFormValues = z.infer<typeof formSchema>;

const hasConsecutiveSpaces = (value: string) => {
  return /\s{2,}/.test(value);
};

export const ContactDetails = () => {
  const host = getCookie("host");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Use persistence hook for state management
  // const {
  //   persistedState,
  //   isHydrated,
  //   setOtpVerified,
  //   setOtpSent,
  //   updateFormData,
  //   clearPersistence,
  // } = useContactPersistence();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const [otpValue, setOtpValue] = useState("");
  const [hasError, setHasError] = useState(false);

  const timer = useTimer({
    duration: 60,
    // persistenceKey: "otp_resend_timer",
  });

  // Destructure persisted state
  // const { otpVerified, otpSent, formData: persistedFormData } = persistedState;

  const { data: globalData } = useApplicationDetails();
  const applicationDetails = globalData?.data?.application;

  const { contactFormRef } = usePaymentSummary();

  const { mutate: verifyOtp, isPending: isVerfyingOtp } = useMutation({
    ...orpc.visa.verifyOtpForAnonymousUser.mutationOptions({
      onSuccess: (response) => {
        toast.success(response.msg || "Email Verified Successfully.");
        console.log("verify otp success", response);

        if (response?.status === "success") {
          setOtpVerified(true);
          // setOtpSent(false);
          setOtpDialogOpen(false);
        } else {
          setHasError(true);
        }
      },
      onError: (error) => {
        console.log("verify otp error", error);
        setHasError(true);
        toast.error(error.message || "OTP verification failed.");
      },
    }),
  });
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    ...orpc.visa.generateOtpForAnonymousUser.mutationOptions({
      onSuccess: (response) => {
        toast.success(
          // response?.msg ||
          "OTP sent successfully.",
        );
        console.log("send otp success", response);
        if (response?.status === "success") {
          timer.start();
          setOtpDialogOpen(true);
          // setOtpSent(true);
        }
      },
      onError: (error) => {
        console.log("send otp error", error);
        toast.error(error?.message || "Failed to send OTP.");
      },
    }),
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile_no: "",
      email: "",
      otp: "",
      user_id: "",
      // application_id: "",
    },
  });

  const { watch, formState, setValue, trigger, getValues, reset } = form;
  const emailValue = watch("email");

  // // Restore form data from persistence when hydrated
  // useEffect(() => {
  //   if (isHydrated && persistedFormData) {
  //     if (persistedFormData.firstName)
  //       setValue("firstName", persistedFormData.firstName);
  //     if (persistedFormData.lastName)
  //       setValue("lastName", persistedFormData.lastName);
  //     if (persistedFormData.mobile_no)
  //       setValue("mobile_no", persistedFormData.mobile_no);
  //     if (persistedFormData.email) setValue("email", persistedFormData.email);
  //   }
  // }, [isHydrated, persistedFormData, setValue]);

  // Sync form changes to persistence (debounced via onChange)
  // const handleFormChange = (
  //   field: keyof typeof persistedFormData,
  //   value: string,
  // ) => {
  //   updateFormData({ [field]: value });
  // };

  const isSendOTPDisabled = useMemo(() => {
    return !z
      .string()
      .min(5)
      .max(100)
      .email()
      .safeParse(emailValue?.trim() || "").success;
  }, [emailValue]);

  const handleSendOTP = () => {
    setOtpVerified(false);
    setIsEditingEmail(false);
    setValue("otp", "");
    setOtpValue("");
    setOtpSent(true);
    setHasError(false);
    sendOtp({ email: emailValue, host: host! });
  };

  const handleVerifyOTP = () => {
    if (otpValue.length === 4) {
      setHasError(false);
      verifyOtp({
        email: emailValue,
        application_id: applicationDetails?._id || "",
        otp: otpValue,
      });
    } else {
      setHasError(true);
      toast.error("Please enter a valid 4-digit OTP");
    }
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setOtpSent(false);
    setOtpVerified(false);
    setValue("otp", "");
    setOtpValue("");
  };

  useImperativeHandle(
    contactFormRef,
    () => ({
      validate: async () => {
        const isValid = await trigger(undefined, { shouldFocus: true });

        if (!isValid) {
          toast.error(
            `Please fill all required fields correctly in the Contact Details form.`,
          );
          return false;
        }

        if (!otpVerified) {
          toast.error("Please verify your email.");
          return false;
        }

        return true;
      },
      getValues,
      reset,
      getFormState: () => formState,
    }),
    [formState, trigger, getValues, reset],
  );

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h6 className="text-lg font-bold">Contact Details</h6>

      <Form {...form}>
        <form className="grid gap-5 pt-2 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormItem>
                <FormLabel className={invalid ? "text-red-500" : ""}>
                  <div>
                    <span className="text-red-400">*</span>First Name
                    {error?.message ? ` (${error.message})` : ""}
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter First Name"
                    {...field}
                    className={cn(invalid ? "bg-red-500/20" : "")}

                  // onBlur={(e) => {
                  //   field.onBlur();
                  //   handleFormChange("firstName", e.target.value);
                  // }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormItem>
                <FormLabel className={invalid ? "text-red-500" : ""}>
                  <div>
                    <span className="text-red-400">*</span>Last Name
                    {error?.message ? ` (${error.message})` : ""}
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Last Name"
                    {...field}
                    className={cn(invalid ? "bg-red-500/20" : "")}
                  // onBlur={(e) => {
                  //   field.onBlur();
                  //   handleFormChange("lastName", e.target.value);
                  // }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile_no"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormItem>
                <FormLabel className={invalid ? "text-red-500" : ""}>
                  <div>
                    <span className="text-red-400">*</span>Mobile Number
                    {error?.message ? ` (${error.message})` : ""}
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Mobile Number"
                    {...field}
                    className={cn(invalid ? "bg-red-500/20" : "")}

                  // onBlur={(e) => {
                  //   field.onBlur();
                  //   handleFormChange("mobile_no", e.target.value);
                  // }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            rules={{
              onChange: () => {
                timer.reset();
              },
            }}
            name="email"
            render={({ field, fieldState: { invalid, error } }) => (
              <FormItem>
                <FormLabel className={invalid ? "text-red-500" : ""}>
                  <div>
                    <span className="text-red-400">*</span>Email
                    {error?.message ? ` (${error.message})` : ""}
                  </div>
                </FormLabel>
                <div className="flex items-center gap-1">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email"
                      disabled={!isEditingEmail && (otpSent || otpVerified)}
                      className={cn(invalid ? "bg-red-500/20" : "")}
                      // onBlur={(e) => {
                      //   field.onBlur();
                      //   handleFormChange("email", e.target.value);
                      // }}
                      endIcon={
                        (otpSent || otpVerified) && (
                          <Edit
                            className="size-4 text-gray-500 hover:cursor-pointer"
                            onClick={handleEditEmail}
                          />
                        )
                      }
                    />
                  </FormControl>

                  <Button
                    type="button"
                    disabled={
                      isSendOTPDisabled || otpVerified || timer.time > 0
                    }
                    onClick={handleSendOTP}
                  >
                    {otpVerified
                      ? "Verified"
                      : timer.time > 0
                        ? `Resend in ${timer.formattedTime}`
                        : "Send OTP"}
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-[360px]" onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={4}
              value={otpValue}
              onChange={(val) => {
                setOtpValue(val);
                setValue("otp", val);
                if (hasError) setHasError(false);
              }}
              aria-invalid={hasError}
              pattern={DIGIT_ONLY_REGEX}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>

            <DialogFooter>
              <Button
                variant={"link"}
                disabled={timer.time > 0}
                onClick={handleSendOTP}
              >
                {timer.time > 0
                  ? `Resend in ${timer.formattedTime}`
                  : "Resend OTP"}
              </Button>
              <Button
                disabled={otpValue.length !== 4}
                isLoading={isVerfyingOtp}
                onClick={handleVerifyOTP}
              >
                Verify OTP
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
