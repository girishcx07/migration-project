import { useMutation } from "@tanstack/react-query";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import { orpc } from "@workspace/orpc/lib/orpc";
import { useState } from "react";
import { toast } from "sonner";
import { usePaymentSummary } from "../context/payment-summary-context";
import { useAppRouter } from "../../../platform/navigation";
import { useRouteContext } from "@workspace/common-ui/context/route-context";
import { useEcommPayWidget } from "@workspace/common-ui/hooks/use-ecompay-widget";

export function useHandleSubmit() {
  const { goToPaymentSuccess } = useAppNavigation();
  const router = useAppRouter();
  const { buildPath, workflow } = useRouteContext();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpenErrorModal, setIsOpenErrorModal] = useState(false);

  const {
    contactFormRef,
    gstDetailsFormRef,
    groupingData,
    metaData,
    selectedPaymentMethod,
    acceptedTnc
  } = usePaymentSummary();

  const { runWidget } = useEcommPayWidget();




  const { user_id = "", application_id = "", host } = metaData;

  const { mutateAsync: updateGroupMembership } = useMutation({
    ...orpc.visa.updateGroupMembershipForApplication.mutationOptions({
      onSuccess: (data) => {
        console.log("update successfully", data);
      },
      onError: (error) => {
        console.log("update error", error);
      },
    }),
  });

  const { mutate: updateContactDetails } = useMutation(
    orpc.visa.updateUserDetails.mutationOptions({
      onSuccess: (data) => {
        console.log("Update success:", data);
      },
      onError: (error) => {
        console.error("Update failed:", error);
      },
    }),
  );

  const { mutateAsync: submitApplication } = useMutation({
    ...orpc.visa.postSubmitApplication.mutationOptions({
      onSuccess: (response) => {
        console.log("api call success data", {
          response,
        });
        const data = response?.data;
        if (!data || data === null) {
          setIsOpenErrorModal(true);
          setError(
            "Unexpected error occurred. Please contact support if the issue persists.",
          );
        }
        if (data?.data === "error") {
          setIsOpenErrorModal(true);
          setError(data.msg || "An error occurred during submission.");
        }
        if (data?.data === "success") {
          goToPaymentSuccess();
        }

        setIsSubmitting(false);
        setOpenConfirm(false);
      },
      onError: (error) => {
        console.log("api call error data", {
          error,
          application_id,
          payment_config_id: selectedPaymentMethod?.payment_config_id,
        });
        setIsSubmitting(false);
      },
    }),
  });

  const handleConfirm = async () => {
    // const moduleType = getCookie("module_type");
    // setIsConfirming(true);
    console.log("selectedPaymentMethod====>", selectedPaymentMethod);
    try {
      const contactFormValues = contactFormRef.current?.getValues() as any;
      const isContactFormValid = await contactFormRef.current?.validate?.();
      if (contactFormRef?.current && !isContactFormValid) return;
      const isGstFormValid = await gstDetailsFormRef.current?.validate?.();
      if (gstDetailsFormRef?.current && !isGstFormValid) return;
      
      if (!selectedPaymentMethod?.display_name) {
        toast.error("Please select payment mode.");
        return;
      }

      const isValidGrouping = groupingData.every(
        (member) => Boolean(member.HOF_id) || Boolean(member.head_of_family),
      );
      if (!isValidGrouping) {
        toast.error("Please fill relation grouping.");
        return;
      }

      if (host === "arcube" && !acceptedTnc) {
        // toast.error("Please accept terms and conditions.");
        toast.error("Please accept the Terms of Use and Privacy Policy to Proceed.");
        return;
      }



      if (contactFormRef.current) {
        updateContactDetails({
          contactDetails: {
            first_name: contactFormValues?.firstName || "",
            last_name: contactFormValues?.lastName || "",
            mobile_no: contactFormValues?.mobile_no || "",
            email: contactFormValues?.email || "",
            country_code: contactFormValues?.country_code || "+91",
          },
          applicationId: metaData.application_id,
        });
      }

      if (selectedPaymentMethod?.provider === "ecommpay") {
        // We still open the confirm dialog for Ecommpay
        // because we want the "Submit" click to be the trigger
      }

      setOpenConfirm(true);
    } catch (error) {
      toast.error("An unexpected error occurred during validation.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const contactFormData = contactFormRef.current?.getValues?.();
      const gstDetailsData = gstDetailsFormRef.current?.getValues?.();



      await updateGroupMembership({
        application_id,
        group_membership: groupingData,
        workflow: workflow,
      });

      console.log("Submitting complete payload", {
        contactFormData,
        gstDetailsData,
        groupingData,
        selectedPaymentMethod,
      });

      if (selectedPaymentMethod?.type === "online") {
        if (selectedPaymentMethod?.provider === "ecommpay") {
          setOpenConfirm(false);
          await runWidget();
          return;
        }

        router.push(
          buildPath(
            `/payment-checkout?payment_config_id=${selectedPaymentMethod?.payment_config_id}&application_id=${application_id}&type=visa&user_id=${user_id}`,
          ),
        );
        setOpenConfirm(false);
      } else {
        await submitApplication({
          application_id: application_id,
          payment_config_id: selectedPaymentMethod?.payment_config_id!,
          type: "visa",
        });
      }
    } catch (error) {
      toast.error("Something went wrong during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    handleConfirm,
    isConfirming,
    isSubmitting,
    openConfirm,
    setOpenConfirm,
    error,
    isOpenErrorModal,
    setIsOpenErrorModal,
  };
}
