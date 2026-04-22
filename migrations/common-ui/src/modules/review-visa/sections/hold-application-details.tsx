import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent
} from "@workspace/ui/components/card";
import { memo } from "react";
import { useApplicationState } from "../context/review-visa-context";

const HoldApplicationDetails = () => {
  const { applicationDetails } = useApplicationState();
  const { hold_type, hold_message } = applicationDetails?.application ?? {};

  if (!hold_type && !hold_message) return null;

  const type =
    hold_type === "documents_invalid"
      ? "Document Required"
      : "Information Required";

  return (
    <Card
      className="w-full gap-3 border bg-red-50 p-2"
      style={{ borderColor: "#f87171" }}
    >
      <CardContent className="space-y-4 p-2">
        <div className="flex gap-2 text-sm">
          <span className="font-medium capitalize">Status:</span>
          <Badge className="rounded-sm capitalize" variant="destructive">
            {" "}
            {type || "—"}
          </Badge>
        </div>
        <div className="text-sm">
          <span className="font-medium capitalize">Comments:</span>{" "}
          {hold_message ? hold_message : "No additional comments provided."}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(HoldApplicationDetails);
