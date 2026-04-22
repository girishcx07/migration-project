"use client";

import React, { useState } from "react";
import { GroupedApplicant } from "../context/payment-summary-context";
import { DEFAULT_RELATION, RELATION_OPTIONS } from "@workspace/common-ui/constants";
import { AppImage as Image } from "../../../platform/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Applicant } from "@workspace/types/review";

interface ApplicantRowProps {
  applicant: Applicant; // Replace with actual type if available
  grouping: GroupedApplicant[];
  hofOptions: { label: string; value: string }[];
  onRelationChange: (id: string, relation: string) => void;
  onHOFChange: (id: string, HOF_id: string) => void;
  groupingError: string[];
}

// const relationOptions = RELATION_OPTIONS.map((label) => ({
//   label,
//   value: label,
// }));

export const ApplicantRow: React.FC<ApplicantRowProps> = ({
  applicant,
  grouping,
  hofOptions,
  onRelationChange,
  onHOFChange,
  groupingError,
}) => {
  const [imgError, setImgError] = useState(false);

  const applicantData = grouping.find(
    (res) => res.applicant_id === applicant._id,
  );
  const isMainPerson =
    applicantData?.relationValue === DEFAULT_RELATION.value;

  const mainPersons = grouping?.filter(
    (i) => i?.relationValue === DEFAULT_RELATION.value,
  );

  const checkAtLeastOneMain = mainPersons.length === 1 && isMainPerson;

  console.log("applicant", applicant);

  const isErrorForHOF = groupingError.includes(applicant._id);

  const applicantName = `${applicant.applicant_first_name ?? ""} ${applicant.applicant_last_name ?? ""
    }`.trim();

  const initials = `${applicant.applicant_first_name?.[0] ?? ""}${applicant.applicant_last_name?.[0] ?? ""
    }`.toUpperCase();

  return (
    <div className="grid items-center gap-4 rounded-sm border px-2 py-2 grid-cols-[auto_1fr]">
      <div className="flex items-center justify-center">
        {!imgError && applicant.applicant_profile_url ? (
          <Image
            src={applicant.applicant_profile_url}
            alt={applicantName || "Applicant"}
            width={80}
            height={80}
            // className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
            className="h-12 w-12! rounded-full border object-contain shadow-sm"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-300 text-xl font-semibold text-gray-700 shadow-md">
            {initials || "?"}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <div className="text-sm font-semibold">
            {applicantName || "Unknown Applicant"}
          </div>
          <div className="flex gap-1">
            <span className="text-muted-foreground text-sm">Passport:</span>
            <span className="text-muted-foreground text-sm font-medium">
              {applicant?.passport_number}
            </span>
          </div>
        </div>
        <div className="grid w-full gap-2 md:grid-cols-2">
          <Select
            value={applicantData?.relationValue || ""}
            onValueChange={(value) => onRelationChange(applicant._id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your Relation" />
            </SelectTrigger>
            <SelectContent>
              {RELATION_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={checkAtLeastOneMain}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isMainPerson && (
            <>
              <Select
                value={applicantData?.HOF_id || ""}
                onValueChange={(value) => onHOFChange(applicant._id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Related Head of the Family">
                    {applicantData?.HOF_id
                      ? grouping.find(
                        (res) => res.applicant_id === applicantData.HOF_id,
                      )?.name || ""
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {hofOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isErrorForHOF && (
                <span className="text-sm text-red-500">
                  {/* Please select Head of Family */}
                  Please select Main Person
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
