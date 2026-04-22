import { useQuery } from "@tanstack/react-query";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Evaluate, RequiredDocument } from "@workspace/types/new-visa";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Copy, Info, SquareCheckBig } from "lucide-react";
import { useEffect, useState } from "react";

interface VisaTypeDetailsProps {
  setIsVisaTypeDetails: (value: boolean) => void;
  setColumnNumber: (value: number) => void;
  selectedVisaOffer: number | null; // index in data array
  data: any[];
  setIsOpenModal: (value: boolean) => void;
  setModalData: (data: any) => void;
}

const VisaTypeDetails = ({
  setIsVisaTypeDetails,
  setColumnNumber,
  selectedVisaOffer,
  data,
  setIsOpenModal,
  setModalData,
}: VisaTypeDetailsProps) => {
  const [visaOffer, setVisaOffer] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (
      Array.isArray(data) &&
      typeof selectedVisaOffer === "number" &&
      selectedVisaOffer >= 0 &&
      selectedVisaOffer < data.length
    ) {
      setVisaOffer(data[selectedVisaOffer]);
    } else {
      setVisaOffer(null);
    }
  }, [data, selectedVisaOffer]);

  const payload = {
    visa_id: visaOffer?.visa_details?.visa_id as string,
    travelling_to_identity: visaOffer?.travelling_to_identity as string,
  };

  const isQueryEnabled =
    !!payload?.travelling_to_identity && !!payload?.visa_id;

  const { data: VisaDocuments } = useQuery(
    orpc.visa.getVisaDocuments.queryOptions({
      input: {
        visa_id: payload.visa_id,
        travelling_to_identity: payload.travelling_to_identity,
      },
      enabled: isQueryEnabled,
    }),
  );

  const requiredDocuments =
    VisaDocuments?.data?.required_documents || ([] as RequiredDocument[]);
  const additionalDocuments =
    VisaDocuments?.data?.evaluate || ([] as Evaluate[]);

  // console.log("visaOffer", { visaOffer, requiredDocuments, additionalDocuments });

  function copyToClipboard(require_docs: any[], additional_docs: any[]) {
    console.log("tettttt", require_docs, additional_docs);
    setIsCopied(true);
    // return
    let temp = document.createElement("textarea");
    let txt = "=== Required Documents ===";
    let copiedValue = require_docs
      ?.map(
        (x) =>
          `Document Name: ${x?.doc_display_name}
           Short Description: ${x?.doc_short_description}
           Document Description: ${x?.doc_description}`,
      )
      ?.join("\r\n");
    let doc_copy_value = `${txt}\r\n${copiedValue}`;

    if (additional_docs?.length > 0) {
      let additional_txt = "=== Additional Documents ===";
      let additional_docs_name = additional_docs
        ?.map(
          (x) =>
            `Document Name: ${x?.demand[0]?.doc_display_name} 
            Short Description: ${x?.demand[0]?.doc_short_description}
            Document Description: ${x?.demand[0]?.doc_description}`,
        )
        ?.join("\r\n");
      doc_copy_value = `${
        doc_copy_value ?? ""
      }\r\n\r\n${additional_txt}\r\n${additional_docs_name}`;
    }

    temp.value = doc_copy_value;

    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <div>
      <div>
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="bg-primary/30">
            <CardTitle className="text-md flex items-center justify-between py-3">
              <div>
                {visaOffer?.visa_details?.duration_days}{" "}
                {visaOffer?.visa_details?.duration_type}{" "}
                {visaOffer?.visa_type_display_name}
              </div>
              <div>
                {visaOffer?.visa_details?.fees?.currency}{" "}
                {visaOffer?.visa_details?.fees?.total_cost}
              </div>
            </CardTitle>
            {visaOffer?.is_visaero_insurance_bundled && (
              <div className="relative h-6">
                <span className="bg-primary ribin_cut absolute -left-3 py-0.5 pr-10 pl-3 text-xs/5 text-white capitalize">
                  + {visaOffer?.insurance_details?.insurance_title}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="text-muted-foreground m-0 flex flex-col p-0">
            <div className="flex flex-col gap-1 px-3 pb-3">
              <div className="pt-4 pb-1 text-sm text-black capitalize">
                {visaOffer?.visa_category} | {visaOffer?.processing_type} |{" "}
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
            </div>

            <hr />

            {/* Required Documents */}
            <div className="mt-2 px-3">
              <div className="flex justify-between">
                <span className="font-medium text-black">
                  Required Documents
                </span>
                <div className="flex gap-2">
                  {isCopied ? (
                    <SquareCheckBig className="w-[18px] text-green-800" />
                  ) : (
                    <Copy
                      className="w-[18px] cursor-pointer"
                      onClick={() =>
                        copyToClipboard(requiredDocuments, additionalDocuments)
                      }
                    />
                  )}
                  <Info
                    className="w-[18px] cursor-pointer"
                    onClick={() => setIsInfoOpen(true)}
                  />
                </div>
              </div>
              {requiredDocuments?.map((item, index) => (
                <div key={index} className="mt-1">
                  <div className="flex gap-1 text-sm text-black">
                    <span>{index + 1}.</span>
                    <span>{item?.doc_display_name}</span>
                  </div>
                  <div className="ml-3 text-xs">
                    {item?.doc_short_description}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Documents */}
            {additionalDocuments.length > 0 && (
              <div className="mt-4 border-t px-3 py-2">
                <span className="font-medium text-black">
                  Additional Documents
                </span>
                {additionalDocuments.map((item, index) => {
                  const demand = item?.demand?.[0];
                  return (
                    <div key={index} className="mt-1">
                      <div className="flex gap-1 text-sm text-black">
                        <span>{index + 1}.</span>
                        <span>{demand?.doc_display_name}</span>
                      </div>
                      <div className="ml-3 text-xs">
                        {demand?.doc_short_description ||
                          demand?.doc_description}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardAction className="bg-primary w-full px-3">
            <button
              className="bg-primary py-2 text-sm text-white underline transition-colors hover:cursor-pointer"
              onClick={() => {
                setIsOpenModal(true);
                setModalData(visaOffer);
              }}
            >
              More Details...
            </button>
          </CardAction>
        </Card>
      </div>
    </div>
  );
};

export default VisaTypeDetails;
