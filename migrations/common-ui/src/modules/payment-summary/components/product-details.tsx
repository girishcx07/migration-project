import { Application } from "@workspace/types/review";
import { capitalize } from "@workspace/common-ui/lib/utils";
import { useState } from "react";
import { VisaOfferDetailsModal } from "@workspace/common-ui/components/visa-offer-details-modal";

const ProductDetails = ({ application }: { application?: Application }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const {
    visa_type_display_name,
    duration_type,
    total_days,
    visa_processing_type,
    visa_entry_type,
    visa_category,
    is_visaero_insurance_bundled,
    insurance_details,
    visa_offer,
  } = application || {};
  const durationLabel = duration_type ? capitalize(duration_type) : "Days";
  const visaDuration = `${total_days} ${durationLabel}`;

  const visaCategory = capitalize(visa_category || "");
  const visaType = capitalize(visa_processing_type || "Standard");
  const visaEntry = capitalize(`${visa_entry_type} Entry`);

  const visaDetails = `${visaCategory} | ${visaEntry} | ${visaType}`;
  return (
    <div className="rounded-xl bg-white p-4">
      {/* <h2 className="mb-4 text-lg font-bold text-gray-800">
        Application Details
      </h2> */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">{`${visaDuration} ${visa_type_display_name}`}</h3>
          <p className="text-muted-foreground text-sm capitalize">
            {/* Tourist | Single Entry | Standard Visa */}
            {visaDetails}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Visa Validity</p>
            <p className="font-medium">
              {visa_offer?.visa_details?.visa_validity}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Stay Validity</p>
            <p className="font-medium">
              {visa_offer?.visa_details?.stay_validity}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Processing Time</p>
            <p className="font-medium">
              {visa_offer?.visa_details?.processing_time}
            </p>
          </div>
        </div>
        {is_visaero_insurance_bundled && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-2 flex items-center gap-3">
              <i className="fa-solid fa-shield-halved text-green-600"></i>
              <h4 className="font-semibold">
                Complimentary Insurance Included
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-green-50 p-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-gray-500">Insurance Type</p>
                <p className="font-medium text-gray-700">
                  {/* Basic Insurance */}
                  {insurance_details?.insurance_title}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Coverage</p>
                <p className="font-medium text-gray-700">
                  {/* Medical expenses up to USD 10,000 */}
                  {`${insurance_details?.insurance_coverage[0]?.name} ${insurance_details?.insurance_coverage[0]?.value}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <p
          className="mt-4 cursor-pointer text-sm text-blue-600 hover:underline"
          onClick={() => setIsOpenModal(true)}> More Details...</p>
      </div>

      {isOpenModal && <VisaOfferDetailsModal
        application={application!} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} />}
    </div>
  );
};

export default ProductDetails;
