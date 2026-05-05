import { CircleChevronRight } from "lucide-react";

import type { VisaOffer } from "@repo/types/new-visa";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";

export function VisaOfferCard({
  index,
  offer,
  selected,
  onDetails,
  onSelect,
}: Readonly<{
  index: number;
  offer: VisaOffer;
  selected: boolean;
  onDetails: (offer: VisaOffer) => void;
  onSelect: (offer: VisaOffer) => void;
}>) {
  return (
    <Card
      className={cn(
        "flex h-auto min-h-[190px] cursor-pointer flex-col gap-0 overflow-hidden rounded-lg border border-transparent py-0 transition-all duration-300 ease-in-out",
        selected ? "ring-primary scale-100 shadow-sm ring-2" : "scale-95",
      )}
      onClick={() => onSelect(offer)}
    >
      <CardHeader className="bg-muted/40 border-b px-2 py-3">
        <CardTitle className="px-4 text-base">
          <div className="flex items-center justify-between gap-3">
            <span>
              {offer.visa_details?.duration_days}{" "}
              {offer.visa_details?.duration_type} {offer.visa_type_display_name}
            </span>
            <span>
              {offer.visa_details?.fees.currency}{" "}
              {offer.visa_details?.fees.total_cost}
            </span>
          </div>
        </CardTitle>
        {offer.is_visaero_insurance_bundled ? (
          <div className="relative h-6">
            <span className="bg-primary absolute -left-3 py-0.5 pr-10 pl-3 text-xs/5 text-white capitalize">
              + {offer.insurance_details?.insurance_title ?? "Insurance"}
            </span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="text-muted-foreground min-h-20 space-y-1 pb-2 text-sm">
        <div className="pt-4 pb-1 text-sm text-black capitalize">
          {offer.visa_category} | {offer.processing_type} | {offer.entry_type}{" "}
          Entry | {offer.visa_details?.duration_display}
        </div>
        <div className="text-xs">
          Visa Validity: {offer.visa_details?.visa_validity}
        </div>
        <div className="text-xs">
          Stay Validity: {offer.visa_details?.stay_validity}
        </div>
        <div className="text-xs">
          Processing Time: {offer.visa_details?.processing_time}
        </div>
        {offer.is_visaero_insurance_bundled
          ? offer.insurance_details?.insurance_coverage.map((item) => (
              <div className="text-xs" key={`${item.name}-${item.value}`}>
                {item.name}: {item.value}
              </div>
            ))
          : null}
      </CardContent>
      <CardFooter className="bg-primary px-4 py-3 text-white">
        <div className="flex w-full items-center justify-between">
          <button
            className="text-sm underline"
            onClick={(event) => {
              event.stopPropagation();
              onDetails(offer);
            }}
            type="button"
          >
            More Details
          </button>
          <CircleChevronRight aria-label={`Option ${index + 1}`} />
        </div>
      </CardFooter>
    </Card>
  );
}
