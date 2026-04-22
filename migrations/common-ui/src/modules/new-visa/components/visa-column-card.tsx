"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { useVisaColumn } from "../context/visa-columns-context";

type VisaColumnCardProps = {
  title: string;
  number: string | number;
  children: React.ReactNode;
  className?: string;
  cardBodyClassName?: string;
};

const VisaColumnCard: React.FC<VisaColumnCardProps & React.ComponentProps<"div">> = ({
  title,
  number,
  children,
  className,
  cardBodyClassName,
  ...rest
}) => {
  const { columnNumber, setColumnNumber, setVisaApplicationField, setVisaOffer } =
    useVisaColumn();

  const [alertOpen, setAlertOpen] = useState(false);

  const isExpanded = columnNumber === number;

  // Handle toggle for accordion
  const handleToggle = () => {
    if ((number as number) < columnNumber) {
      setAlertOpen(true);
    }
  };

  // console.log("col layout >> ", columnNumber);
  const dynamicWidthClass = `md:w-[${100 / columnNumber}%] w-full`;

  const handleContinue = () => {
    if (number === 1) {
      setVisaApplicationField("travellingTo", null);
      setVisaApplicationField("dateRange", undefined);
    }

    if (number === 2) {
      setVisaOffer(null);
    }
    setColumnNumber(number as number);
    setAlertOpen(false);
  };

  return (
    <>
      <Card
        className={cn(
          `h-[45px] gap-0 overflow-hidden py-0 transition-all duration-300 md:h-full`,
          className,
          dynamicWidthClass,
          {
            "h-full md:h-auto": columnNumber === number && isExpanded,
          },
        )}
        {...rest}
      >
        <CardHeader
          className={cn(
            "cursor-pointer justify-center bg-gray-100 p-2 md:pointer-events-none md:py-3",
            "flex justify-center md:items-center md:justify-between",
          )}
          onClick={handleToggle}
        >
          <CardTitle className="w-full md:flex md:justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-sm text-white md:h-8 md:w-8 md:text-lg">
                {number}
              </div>
              <div className="flex-grow text-sm md:text-lg">{title}</div>
              {/* Chevron icon for mobile */}
              <ChevronDown
                className={`h-6 w-6 hidden md:block transform transition-transform duration-300 md:hidden ${isExpanded ? "rotate-180" : ""}`}
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent
          className={cn(
            "h-[91%] w-full self-start overflow-y-auto pt-0",
            "opacity-100 transition-all duration-300 ease-in-out md:max-h-screen",
            {
              "max-h-0 p-0 opacity-0 md:max-h-screen md:p-4 md:opacity-100":
                !isExpanded,
            },
            cardBodyClassName,
          )}
        >
          {children}
        </CardContent>
      </Card>

      <AlertDialog onOpenChange={(open) => setAlertOpen(open)} open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>
              This action will discard the current application progress. Are you
              sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VisaColumnCard;
