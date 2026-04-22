"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { Info, LucideIcon } from "lucide-react";

interface NoDataCardProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export const NoDataCard = ({
  icon: Icon,
  title = "No Data Available",
  message = "Please try again later or contact support.",
  className,
  children,
}: NoDataCardProps) => {
  return (
    <div className="mb-3 flex h-full items-center justify-center px-4">
      <Card
        className={cn(
          "mx-auto w-full max-w-md gap-1 shadow-none md:border-none",
          className,
        )}
      >
        <CardHeader className="space-y-1 text-center">
          {Icon ? (
            <Icon className="text-muted-foreground mx-auto size-12" />
          ) : (
            <Info className="text-muted-foreground mx-auto size-12" />
          )}
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          {message}
          {children && <div>{children}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
NoDataCard.displayName = "NoDataCard";
