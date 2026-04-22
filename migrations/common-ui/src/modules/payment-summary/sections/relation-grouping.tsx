"use client";

import { queryClient } from "@workspace/common-ui/lib/react-query";
import { calculateNoOfApplicants, createGroupedApplicant } from "@workspace/common-ui/lib/utils";
import { Applicant } from "@workspace/types/review";
import { useEffect, useMemo, useState } from "react";
import { ApplicantRow } from "../components/relation-grouping-row";
import {
  GroupedApplicant,
  GroupingAvailable,
  usePaymentSummary,
} from "../context/payment-summary-context";
import { DEFAULT_RELATION, RELATION_OPTIONS } from "@workspace/common-ui/constants";
import { orpc } from "@workspace/orpc/lib/orpc";

interface RelationGroupingProps {
  applicants: Applicant[];
}

const RelationGrouping = ({ applicants }: RelationGroupingProps) => {
  const { groupingData, setGroupingData, isGrouping, setIsGrouping } =
    usePaymentSummary();

  const [travelingWithGroup, setTravelingWithGroup] =
    useState<GroupingAvailable>(
      // isGrouping,
      "yes",
    );
  const [groupingError, setGroupingError] = useState<string[]>([]);

  const hofOptions = useMemo(
    () =>
      groupingData
        .filter((res) => res.relationValue === DEFAULT_RELATION.value)
        .map((res) => ({ label: res.name, value: res.applicant_id })),
    [groupingData],
  );

  // Initialize grouping when new applicants are fetched
  useEffect(() => {
    if (!applicants.length) return;

    const newGrouping: GroupedApplicant[] = applicants
      .filter(
        (applicant) =>
          !groupingData.some((g) => g.applicant_id === applicant._id),
      )
      .map((applicant) => {
        return createGroupedApplicant(applicant);
      });

    const updatedGrouping = calculateNoOfApplicants([
      ...groupingData,
      ...newGrouping,
    ]);
    setGroupingData(updatedGrouping);
  }, [applicants, travelingWithGroup]);

  // Handle Traveling With Group Change
  const handleTravelingWithGroupChange = (value: GroupingAvailable): void => {
    setTravelingWithGroup(value);
    setIsGrouping(value);

    if (value === "no") {
      const updatedGrouping = calculateNoOfApplicants(
        groupingData.map((res) => ({
          ...res,
          relationValue: DEFAULT_RELATION.value,
          relation: DEFAULT_RELATION.label,
          head_of_family: res.name,
          HOF_id: res.applicant_id,
        })),
      );
      setGroupingData(updatedGrouping);
    }
  };

  // Handle Relation Change
  const handleRelationChange = (
    applicant_id: string,
    value: string,
  ): void => {

    const selected = RELATION_OPTIONS.find((opt) => opt.value === value);

    queryClient.invalidateQueries({
      queryKey: orpc.visa.getWalletBalance.key(),
    })

    setGroupingData((prev) => {
      let newGrouping = prev.map((res) => {
        if (res.applicant_id === applicant_id) {
          return {
            ...res,
            relation: selected?.label || DEFAULT_RELATION.label,
            relationValue: selected?.value || DEFAULT_RELATION.value,
            head_of_family:
              value === DEFAULT_RELATION.value ? res.name : "",
            HOF_id:
              value === DEFAULT_RELATION.value
                ? res.applicant_id
                : "",
          };
        }
        return res;
      });


      // remove them as HOF from other applicants
      const changedApplicant = newGrouping.find(
        (res) => res.applicant_id === applicant_id,
      );

      const isStillMain =
        changedApplicant?.relationValue === DEFAULT_RELATION.value;


      if (!isStillMain) {
        newGrouping = newGrouping.map((res) => {
          if (res.HOF_id === applicant_id) {
            return {
              ...res,
              HOF_id: "",
              head_of_family: "",
            };
          }
          return res;
        });
      }

      const mainPersons = newGrouping.filter(
        (res) => res.relationValue === DEFAULT_RELATION.value,
      );



      if (mainPersons.length === 1) {
        const mainPerson = mainPersons[0];
        newGrouping = newGrouping.map((res) => {
          if (
            res.applicant_id !== mainPerson?.applicant_id &&
            res.relationValue !== DEFAULT_RELATION.value
          ) {
            return {
              ...res,
              HOF_id: mainPerson?.applicant_id || "",
              head_of_family: mainPerson?.name || "",
            };
          }
          return res;
        });
      } else if (mainPersons.length === 0) {
        newGrouping = newGrouping.map((res) => ({
          ...res,
          HOF_id: "",
          head_of_family: "",
        }));
      }

      const finalGrouping = calculateNoOfApplicants(newGrouping);

      console.log("isStillMain", { isStillMain, changedApplicant })
      return finalGrouping;
    });

    setGroupingError([]);
  };

  console.log("groupingData ===>", { isGrouping, groupingData });
  // Handle HOF Change


  const handleHOFChange = (applicant_id: string, HOF_id: string): void => {
    setGroupingData((prev) =>
      calculateNoOfApplicants(
        prev.map((res) =>
          res.applicant_id === applicant_id
            ? {
              ...res,
              HOF_id,
              head_of_family:
                prev.find((g) => g.applicant_id === HOF_id)?.name || "",
            }
            : res,
        ),
      ),
    );
  };

  // Validate form before submission
  const validateGrouping = (): boolean => {
    const errors: string[] = [];
    groupingData.forEach((applicant) => {
      if (
        applicant.relationValue !== DEFAULT_RELATION.value &&
        !applicant.HOF_id
      ) {
        errors.push(applicant.applicant_id);
      }
    });

    setGroupingError(errors);
    return errors.length === 0;
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h5 className="text-lg font-bold pb-4">Applicant Overview</h5>

      {/* Traveling With Group Toggle */}
      {/* <div className="mb-4 flex flex-col items-start gap-4 px-4 sm:flex-row sm:items-center">
        <span className="text-base font-medium">
          Traveling with Group (Family)?
        </span>
        <RadioGroup
          value={travelingWithGroup}
          onValueChange={handleTravelingWithGroupChange}
          className="flex flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <label htmlFor="no" className="text-sm">
              No
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <label htmlFor="yes" className="text-sm">
              Yes
            </label>
          </div>
        </RadioGroup>
      </div> */}

      {/* Conditional Rendering based on selection */}
      {travelingWithGroup === "yes" && (
        <div className="grid gap-4">
          {applicants.length ? (
            applicants?.map((applicant) => (
              <ApplicantRow
                key={applicant._id}
                applicant={applicant}
                grouping={groupingData}
                hofOptions={hofOptions}
                onRelationChange={handleRelationChange}
                onHOFChange={handleHOFChange}
                groupingError={groupingError}
              />
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">
              No applicants found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelationGrouping;


export const RelationGroupingSkeleton = () => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm animate-pulse">
      {/* Title */}
      <div className="h-5 w-48 rounded bg-gray-200 mb-4" />

      {/* Applicant rows skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-100 p-4 shadow-sm"
          >
            {/* Name */}
            <div className="h-4 w-40 rounded bg-gray-200 mb-3" />

            {/* Dropdown fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Relation dropdown */}
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-10 w-full rounded bg-gray-300" />
              </div>

              {/* HOF dropdown */}
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-10 w-full rounded bg-gray-300" />
              </div>

              {/* Count field */}
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-10 w-full rounded bg-gray-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

