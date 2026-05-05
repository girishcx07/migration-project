"use client";
import { InsuranceCoverage, VisaOffer } from "@repo/types/new-visa";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import clsx from "clsx";
import React, { useState } from "react";
import { useVisaColumn } from "../context/visa-columns-context";
import { CircleChevronRight } from "lucide-react";

interface VisaCardProps {
  type?: string;
  visaOffer: VisaOffer;
  handleVisaClicked: (visa: VisaOffer, index: number | null) => void;
  index?: number | null;
  selectedVisa: number | null;
  setIsOpenModal?: (value: boolean) => void;
  setModalData?: (data: VisaOffer | null) => void;
  children?: React.ReactNode;
}

// const VisaOfferCard = ({
//   type,
//   visaOffer,
//   handleVisaClicked,
//   selectedVisa,
//   index = null,
//   setIsOpenModal,
//   setModalData,
//   children,
//   ref
// }: VisaCardProps) => {
//   const {
//     data: { visaOffer: selectedVisaOffer },
//   } = useVisaColumn();
//   const isActiveVisaOffer =
//     index === selectedVisa && visaOffer?._id === selectedVisaOffer?._id;

//   return (
//     <>
//       <Card
//         className={clsx(
//           "gap-0 overflow-hidden rounded-sm py-0 transition-all ease-in-out",
//           {
//             "border-primary shadow-primary scale-100 border-2 shadow-sm":
//               isActiveVisaOffer,
//             "scale-95 border-2 border-transparent": !isActiveVisaOffer,
//           },
//         )}
//         onClick={() => handleVisaClicked(visaOffer, index)}
//       >
//         <CardHeader className="bg-primary/30 px-2 py-3">
//           <CardTitle className="text-md px-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 {visaOffer?.visa_details?.duration_days}{" "}
//                 {visaOffer.visa_details?.duration_type}{" "}
//                 {visaOffer?.visa_type_display_name}
//               </div>
//               {/* <div> 30 Days e-Visa</div> */}
//               <div>
//                 {visaOffer?.visa_details?.fees.currency}{" "}
//                 {visaOffer?.visa_details?.fees.total_cost}{" "}
//               </div>
//             </div>
//           </CardTitle>
//           {visaOffer.is_visaero_insurance_bundled && (
//             <div className="relative h-6">
//               <span className="bg-primary ribin_cut absolute -left-3 py-0.5 pr-10 pl-3 text-xs/5 text-white capitalize">
//                 + {visaOffer.insurance_details?.insurance_title}
//               </span>
//             </div>
//           )}
//         </CardHeader>
//         <CardContent className="text-muted-foreground min-h-32 space-y-1 pb-2 text-sm">
//           <div className="pt-4 pb-1 text-sm text-black capitalize">
//             {visaOffer?.visa_category} | {visaOffer.processing_type} |{" "}
//             {visaOffer?.entry_type} Entry |{" "}
//             {visaOffer?.visa_details?.duration_display}
//           </div>

//           <div className="text-xs">
//             Visa Validity: {visaOffer?.visa_details?.visa_validity}
//           </div>
//           <div className="text-xs">
//             Stay Validity: {visaOffer?.visa_details?.stay_validity}
//           </div>
//           <div className="text-xs">
//             Processing Time: {visaOffer?.visa_details?.processing_time}
//           </div>
//           {visaOffer.is_visaero_insurance_bundled &&
//             visaOffer.insurance_details?.insurance_coverage?.map(
//               (ins: InsuranceCoverage, i: number) => (
//                 <div className="text-xs" key={i}>
//                   {ins.name}: {ins.value}
//                 </div>
//               ),
//             )}

//           {children && (
//             <div>
//               <Separator className="my-2" />
//               {children}
//             </div>
//           )}
//         </CardContent>
//         <CardFooter className="bg-primary pb-3 text-white">
//           <div className="mt-3 flex w-full items-center justify-between">
//             <div
//               className="text-sm underline hover:cursor-pointer"
//               onClick={(e) => {
//                 setIsOpenModal?.(true);
//                 setModalData?.(visaOffer);
//                 // stop propogation
//                 e.stopPropagation();
//               }}
//             >
//               More Details
//             </div>
//             <CircleChevronRight />
//           </div>
//         </CardFooter>
//       </Card>
//     </>
//   );
// };


const VisaOfferCard = React.forwardRef<HTMLDivElement, VisaCardProps>(
  ({
    type,
    visaOffer,
    handleVisaClicked,
    selectedVisa,
    index = null,
    setIsOpenModal,
    setModalData,
    children,
  }, ref) => {
    const {
      data: { visaOffer: selectedVisaOffer },
    } = useVisaColumn();
    const isActiveVisaOffer =
      index === selectedVisa && visaOffer?._id === selectedVisaOffer?._id;

    return (
      <>
        <Card ref={ref}
          className={clsx(
            "gap-0 overflow-hidden rounded-sm py-0 transition-all ease-in-out",
            {
              "border-primary shadow-primary scale-100 border-2 shadow-sm":
                isActiveVisaOffer,
              "scale-95 border-2 border-transparent": !isActiveVisaOffer,
            },
          )}
          onClick={() => handleVisaClicked(visaOffer, index)}
        >
          <CardHeader className="bg-primary/30 px-2 py-3">
            <CardTitle className="text-md px-4">
              <div className="flex items-center justify-between">
                <div>
                  {visaOffer?.visa_details?.duration_days}{" "}
                  {visaOffer.visa_details?.duration_type}{" "}
                  {visaOffer?.visa_type_display_name}
                </div>
                {/* <div> 30 Days e-Visa</div> */}
                <div>
                  {visaOffer?.visa_details?.fees.currency}{" "}
                  {visaOffer?.visa_details?.fees.total_cost}{" "}
                </div>
              </div>
            </CardTitle>
            {visaOffer.is_visaero_insurance_bundled && (
              <div className="relative h-6">
                <span className="bg-primary ribin_cut absolute -left-3 py-0.5 pr-10 pl-3 text-xs/5 text-white capitalize">
                  + {visaOffer.insurance_details?.insurance_title}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="text-muted-foreground min-h-32 space-y-1 pb-2 text-sm">
            <div className="pt-4 pb-1 text-sm text-black capitalize">
              {visaOffer?.visa_category} | {visaOffer.processing_type} |{" "}
              {visaOffer?.entry_type} Entry |{" "}
              {visaOffer?.visa_details?.duration_display}
            </div>

            <div className="text-xs">
              Visa Validity: {visaOffer?.visa_details?.visa_validity}
            </div>
            <div className="text-xs">
              Stay Validity: {visaOffer?.visa_details?.stay_validity}
            </div>
            <div className="text-xs">
              Processing Time: {visaOffer?.visa_details?.processing_time}
            </div>
            {visaOffer.is_visaero_insurance_bundled &&
              visaOffer.insurance_details?.insurance_coverage?.map(
                (ins: InsuranceCoverage, i: number) => (
                  <div className="text-xs" key={i}>
                    {ins.name}: {ins.value}
                  </div>
                ),
              )}

            {children && (
              <div>
                <Separator className="my-2" />
                {children}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-primary pb-3 text-white">
            <div className="mt-3 flex w-full items-center justify-between">
              <div
                className="text-sm underline hover:cursor-pointer"
                onClick={(e) => {
                  setIsOpenModal?.(true);
                  setModalData?.(visaOffer);
                  // stop propogation
                  e.stopPropagation();
                }}
              >
                More Details
              </div>
              <CircleChevronRight />
            </div>
          </CardFooter>
        </Card>
      </>
    );
  }
)

export default VisaOfferCard;

interface LoadingProps {
  totalCards?: number;
}

export const VisaOfferCardSkeleton: React.FC<LoadingProps> = ({ }) => {
  return (
    <div className="my-5 flex flex-col">
      <Skeleton className="h-[250px] w-full rounded-sm" />
    </div>
  );
};
