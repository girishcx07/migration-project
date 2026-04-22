import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateFileNumberProps {
  applicant_id: string;
  onClose: () => void;
}

const UpdateFileNumber = ({ applicant_id, onClose }: UpdateFileNumberProps) => {
  const [fileNumber, setFileNumber] = useState("");

  const queryClient = useQueryClient();

  const { mutate: mutateUpdateFileNumber, isPending } = useMutation({
    ...orpc.visa.updateApplicantFileNumber.mutationOptions(),
    onSuccess: async (response) => {
      console.log("fileNumber update success", response);
      queryClient.invalidateQueries({
        queryKey: orpc.visa.getTrackVisaApplicationsData.key(),
      });
      onClose();
      toast.success(
        (response?.data as string) || "File number updated successfully.",
      );
    },
    onError: (error) => {
      console.log("fileNumber update failed", error);
      toast.error(error?.message || "Failed to update file number.");
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="" className="text-muted-foreground text-sm">
          Please Update the File Number for Applicant
        </label>
        <Input
          type="text"
          placeholder="Enter file number"
          value={fileNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, ""); // Allow only A-Z, a-z, 0-9
            setFileNumber(value);
          }}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancle</Button>
        <Button
          disabled={isPending || fileNumber === "" || fileNumber?.length < 3}
          onClick={() =>
            mutateUpdateFileNumber({
              applicant_file_number: fileNumber,
              applicant_id,
            })
          }
        >
          {isPending ? "Updating..." : "Update"}
        </Button>
      </div>
    </div>
  );
};

export default UpdateFileNumber;
