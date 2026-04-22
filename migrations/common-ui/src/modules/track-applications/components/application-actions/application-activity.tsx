import { useQuery } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Timeline,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@workspace/ui/components/timeline";

import React from "react";

interface ActivityProps {
  _id: string;
  host: string;
}

const ActivitiesOfApplication: React.FC<ActivityProps> = ({ _id, host }) => {
  const { data, isLoading, isError } = useQuery(
    orpc.visa.getApplicationActivities.queryOptions({
      input: {
        application_id: _id,
      },
      enabled: Boolean(_id && host),
      select: (data) => data.data,
    }),
  );

  const activities = data || [];
  console.log("activities ->", { data });
  if (isLoading) return <ApplicationActivitySkeleton />;
  if (isError)
    return <p className="text-destructive">Failed to load activities.</p>;

  return (
    <>
      {activities?.length ? (
        <Timeline value={2}>
          {activities?.map((activity, idx) => (
            <TimelineItem
              key={activity._id}
              step={idx + 1}
              className="mb-5 group-data-[orientation=vertical]/timeline:sm:ms-32"
            >
              <TimelineHeader>
                <TimelineSeparator className="bg-primary h-full w-1 -translate-x-3.5" />
                <TimelineDate className="group-data-[orientation=vertical]/timeline:sm:absolute group-data-[orientation=vertical]/timeline:sm:-left-32 group-data-[orientation=vertical]/timeline:sm:w-20 group-data-[orientation=vertical]/timeline:sm:text-right">
                  {new Date(activity.activity_on).toLocaleString()}
                </TimelineDate>
                <TimelineTitle className="text-primary sm:-mt-0.5">
                  {activity.activity}
                </TimelineTitle>
                <TimelineIndicator className="bg-primary h-2 w-2 -translate-x-4 translate-y-1.5 rounded-full ring-2" />
              </TimelineHeader>
              {/* <TimelineContent>{activity.activity}</TimelineContent> */}
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center">
          Data are not found.
        </div>
      )}
    </>
  );
};

export default ActivitiesOfApplication;

const ApplicationActivitySkeleton: React.FC = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div className="mb-3" key={idx}>
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </>
  );
};
