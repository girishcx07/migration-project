"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import { UserRound } from "lucide-react";

import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { CreatorUser } from "@workspace/types/review";
import { maskEmail, maskMobileNumber } from "@workspace/common-ui/lib/utils";
export default function UserProfile({
  user,
  label,
  isHoverable = true
}: {
  user: CreatorUser;
  label: string;
  isHoverable?: boolean
}) {
  // console.log("creator user", user);

  const name = `${user?.first_name || ""} ${user?.last_name || ""}`;

  return (

    <HoverCard>
      <div className="group relative inline-block hover:bg-gray-50">
        {/* White background that shows on hover */}

        {isHoverable ? <HoverCardTrigger className="relative z-10 ">
          <div className="flex w-full items-start gap-2 overflow-hidden p-2">
            <UserRound />
            <div className="flex-wrap">
              {label && <div className="">{label}:</div>}
              <h5 className="text-muted-foreground w-full flex-wrap">{name}</h5>
              <div className="text-muted-foreground text-sm">
                {/* {maskEmail(user?.email || "")} */}
              </div>
            </div>
          </div>
        </HoverCardTrigger>:
        <div className="relative z-10 ">
          <div className="flex w-full items-start gap-2 overflow-hidden p-2">
            <UserRound />
            <div className="flex-wrap">
              {label && <div className="">{label}:</div>}
              <h5 className="text-muted-foreground w-full flex-wrap">{name}</h5>
              <div className="text-muted-foreground text-sm">
                {/* {maskEmail(user?.email || "")} */}
              </div>
            </div>
          </div>
        </div>}
      </div>

      <HoverCardContent onClick={(e) => e.stopPropagation()}>
        <>
          {" "}
          <div className="flex items-start gap-3 overflow-hidden">
            <Avatar>
              {user?.profile_url ? (
                <AvatarImage
                  src={user?.profile_url || ""}
                  // "https://github.com/shadcn.png"}
                  alt={user?.first_name || "User Avatar"}
                />
              ) : (
                <UserRound />
              )}
            </Avatar>
            <div className="w-full flex-wrap">
              <h3 className="flex-wrap text-lg font-semibold">{name}</h3>
              <div className="text-muted-foreground text-sm">
                <div className="flex flex-wrap">
                  {maskEmail(user?.email || "")}
                </div>
                <div>{maskMobileNumber(user?.mobile_no || "")}</div>
                <div className="text-muted-foreground mt-3 text-xs">
                  <Badge
                    color="gryay"
                    className="bg-gray-200 text-gray-800 capitalize"
                  >
                    {user?.user_type?.split("_").join(" ")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </>
      </HoverCardContent>
    </HoverCard>

  );
}
