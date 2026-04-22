import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APPLICATION_STATES } from "@workspace/common-ui/constants/track-applications";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useCallback, useState } from "react";

// Define TypeScript interfaces
interface ApplicationState {
  value: string;
  title: string;
}

interface UpdateApplicationStateProps {
  application_id: string;
  onCancel: () => void;
}

type UpdateStateResponse = {
  data?: string | null;
  msg?: string;
} | null;

const UpdateApplicationState: React.FC<UpdateApplicationStateProps> =
  React.memo(({ application_id, onCancel }) => {
    const [selectedState, setSelectedState] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Initialize query client for manual cache invalidation
    const queryClient = useQueryClient();

    // Memoize state options
    const stateOptions = React.useMemo(
      () =>
        APPLICATION_STATES.map((state: ApplicationState) => (
          <SelectItem key={state.value} value={state.value}>
            {state.title}
          </SelectItem>
        )),
      [],
    );

    // Handle state change
    const handleStateChange = useCallback((value: string) => {
      setSelectedState(value);
      setErrors(""); // Clear errors on state change
    }, []);

    // Handle password input change
    const handlePasswordChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setErrors(""); // Clear errors on password change
      },
      [],
    );

    // Handle form reset
    const handleReset = useCallback(() => {
      setSelectedState("");
      setPassword("");
      setErrors("");
      setShowPassword(false);
    }, []);

    const { mutateAsync: mutateUpdateState } = useMutation(
      orpc.visa.updateApplicationState.mutationOptions(),
    );

    // Handle confirm action
    const handleConfirm = useCallback(async () => {
      if (!selectedState || !password) return;

      setIsSubmitting(true);
      setErrors("");

      try {
        const response = await mutateUpdateState({
          moving_state: selectedState,
          password,
          application_id,
        });

        if (response?.data?.data === "success") {
          // Invalidate query to ensure fresh data on refetch
          queryClient.invalidateQueries({
            queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
          });
          handleReset();
          onCancel();
        } else {
          setErrors(
            response?.data?.msg || "Failed to update application state.",
          );
        }
      } catch (error) {
        setErrors(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [selectedState, password, application_id, handleReset, onCancel]);

    return (
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="application-state"
            className="text-sm font-medium text-gray-700"
          >
            Application State
          </label>
          <Select
            value={selectedState}
            onValueChange={handleStateChange}
            aria-label="Select application state"
          >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="w-full">{stateOptions}</SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-3">
          <label
            htmlFor="authorization-password"
            className="text-sm font-medium text-gray-700"
          >
            Enter Authorization Password
          </label>
          <div className="relative">
            <Input
              id="authorization-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Authorization Password"
              className="mt-1 w-full rounded-md border-gray-300"
              aria-required="true"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {errors && <p className="mt-1 text-sm text-red-500">{errors}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="mt-2"
            aria-label="Cancel state change"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedState || !password || isSubmitting}
            className="mt-2"
            aria-label="Confirm state change"
          >
            {isSubmitting ? "Submitting..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  });

export default UpdateApplicationState;
