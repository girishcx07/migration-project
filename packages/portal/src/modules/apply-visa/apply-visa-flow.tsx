"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import DateRangePicker from "@repo/ui/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";

import type { ModuleBootstrap } from "../../lib/module-registry";
import type { ApplyVisaInitialData } from "../../queries/apply-visa";
import type { ApplyVisaActions } from "./types";
import {
  DestinationNoticeDialog,
  InvalidDocumentDialog,
  OfferDetailsDialog,
  PriceChangeAlertDialog,
  ResetColumnDialog,
  VisaNoticeDialog,
} from "./components/apply-visa-dialogs";
import { DocumentsPanel } from "./components/documents-panel";
import { FieldShell } from "./components/field-shell";
import { MaxWidthContainer } from "./components/max-width-container";
import { RaffApplicationPanel } from "./components/raff-application-panel";
import { VisaColumnCard } from "./components/visa-column-card";
import { VisaOfferCard } from "./components/visa-offer-card";
import { CountryCombobox } from "./country-combobox";
import { useApplyVisaContext } from "./hooks/use-apply-visa-context";
import { ApplyVisaProvider } from "./providers/apply-visa-provider";
import { getDefaultDateRange } from "./utils/date.utils";

export function ApplyVisaFlow({
  actions,
  bootstrap,
  initialData,
  uploadDocumentEndpoint,
}: {
  actions: ApplyVisaActions;
  bootstrap: ModuleBootstrap;
  initialData: ApplyVisaInitialData;
  uploadDocumentEndpoint?: string;
}) {
  return (
    <ApplyVisaProvider
      actions={actions}
      bootstrap={bootstrap}
      initialData={initialData}
      uploadDocumentEndpoint={uploadDocumentEndpoint}
    >
      <ApplyVisaFlowContent />
    </ApplyVisaProvider>
  );
}

export function ApplyVisaFlowContent() {
  const applyVisa = useApplyVisaContext();
  const applicationColumn = <ApplicationColumn />;
  const visaTypeColumn = <VisaTypeColumn />;
  const uploadColumn = <UploadColumn />;

  return (
    <div className="bg-secondary h-screen overflow-hidden">
      <div className="flex h-full flex-col gap-2 p-3 pb-0">
        {applyVisa.message ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Action needed</AlertTitle>
            <AlertDescription>{applyVisa.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="hidden h-[calc(100vh-4.75rem)] flex-1 gap-5 overflow-hidden md:flex">
          <VisaColumnCard
            columnNumber={applyVisa.columnNumber}
            direction={applyVisa.columnDirection}
            number={1}
            onJumpBack={applyVisa.setResetDialogColumn}
            title="Visa Application"
          >
            {applicationColumn}
          </VisaColumnCard>
          {applyVisa.columnNumber >= 2 ? (
            <VisaColumnCard
              columnNumber={applyVisa.columnNumber}
              direction={applyVisa.columnDirection}
              number={2}
              onJumpBack={applyVisa.setResetDialogColumn}
              title="Visa Type"
            >
              {visaTypeColumn}
            </VisaColumnCard>
          ) : null}
          {applyVisa.columnNumber >= 3 ? (
            <VisaColumnCard
              bodyClassName="p-0 md:p-0"
              columnNumber={applyVisa.columnNumber}
              direction={applyVisa.columnDirection}
              number={3}
              onJumpBack={applyVisa.setResetDialogColumn}
              title="Upload Documents"
            >
              {uploadColumn}
            </VisaColumnCard>
          ) : null}
        </div>

        <div className="h-[calc(100vh-4.75rem)] flex-1 overflow-hidden md:hidden">
          {applyVisa.columnNumber === 1 ? (
            <VisaColumnCard
              columnNumber={applyVisa.columnNumber}
              direction={applyVisa.columnDirection}
              fullWidth
              number={1}
              onJumpBack={applyVisa.setResetDialogColumn}
              title="Visa Application"
            >
              {applicationColumn}
            </VisaColumnCard>
          ) : null}
          {applyVisa.columnNumber === 2 ? (
            <VisaColumnCard
              bodyClassName="p-0"
              columnNumber={applyVisa.columnNumber}
              direction={applyVisa.columnDirection}
              fullWidth
              number={2}
              onJumpBack={applyVisa.setResetDialogColumn}
              title="Visa Type"
            >
              {visaTypeColumn}
            </VisaColumnCard>
          ) : null}
          {applyVisa.columnNumber === 3 ? (
            <VisaColumnCard
              bodyClassName="p-0"
              columnNumber={applyVisa.columnNumber}
              direction={applyVisa.columnDirection}
              fullWidth
              number={3}
              onJumpBack={applyVisa.setResetDialogColumn}
              title="Upload Documents"
            >
              {uploadColumn}
            </VisaColumnCard>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-t-xl border bg-white p-3 shadow-sm md:justify-end">
          <div className="md:hidden">
            {applyVisa.columnNumber > 1 ? (
              <Button
                disabled={applyVisa.uploadPending || applyVisa.submitPending}
                onClick={applyVisa.handlePrevious}
                type="button"
                variant="outline"
              >
                Previous
              </Button>
            ) : null}
          </div>
          {applyVisa.columnNumber < 3 ? (
            <Button
              disabled={
                (applyVisa.columnNumber === 1 &&
                  !applyVisa.canMoveToVisaType) ||
                (applyVisa.columnNumber === 2 && !applyVisa.visaOffer)
              }
              onClick={applyVisa.handleNext}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button
              disabled={!applyVisa.canSubmit || applyVisa.submitPending}
              onClick={applyVisa.handleSubmit}
              type="button"
            >
              {applyVisa.submitPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Proceed
            </Button>
          )}
        </div>
      </div>

      <OfferDetailsDialog
        offer={applyVisa.offerDetails}
        onOpenChange={(open) => {
          if (!open) applyVisa.closeOfferDetails();
        }}
        open={Boolean(applyVisa.offerDetails)}
      />

      <DestinationNoticeDialog
        notice={applyVisa.commonNotice}
        onClose={applyVisa.closeCommonNotice}
      />

      <VisaNoticeDialog
        data={applyVisa.activeVisaNotice}
        onBack={applyVisa.cancelVisaNotice}
        onClose={applyVisa.closeVisaNotice}
        onProceed={applyVisa.proceedFromVisaNotice}
        open={Boolean(applyVisa.activeVisaNotice)}
      />

      <PriceChangeAlertDialog
        onAcknowledge={applyVisa.acknowledgePriceChange}
        open={applyVisa.isPriceAlertOpen}
      />

      <InvalidDocumentDialog
        onOpenChange={applyVisa.setInvalidDocumentDialogOpen}
        onProceed={applyVisa.submitApplication}
        open={applyVisa.invalidDocumentDialogOpen}
      />

      <ResetColumnDialog
        onConfirm={applyVisa.confirmColumnReset}
        onOpenChange={(open) => {
          if (!open) applyVisa.setResetDialogColumn(null);
        }}
        open={applyVisa.resetDialogOpen}
      />
    </div>
  );
}

function ApplicationColumn() {
  const applyVisa = useApplyVisaContext();
  const defaultDateRange = getDefaultDateRange();

  return (
    <div className="flex h-auto flex-col">
      <div className="mt-3 flex flex-1 flex-col space-y-4">
        <FieldShell label="Nationality">
          <CountryCombobox
            emptyMessage="No nationalities available."
            items={applyVisa.nationalities}
            onChange={applyVisa.setNationality}
            placeholder="Select your nationality"
            value={applyVisa.nationality}
          />
        </FieldShell>

        <FieldShell label="Travelling To">
          <CountryCombobox
            disabled={!applyVisa.nationality}
            emptyMessage="No destinations available."
            isLoading={applyVisa.travellingToPending}
            items={applyVisa.travellingToOptions}
            onChange={applyVisa.handleTravellingToChange}
            placeholder="Select your destination"
            value={applyVisa.travellingTo}
          />
        </FieldShell>

        {applyVisa.travellingTo?.cor_required ? (
          <FieldShell label="Country of Residence">
            <CountryCombobox
              emptyMessage="No countries available."
              items={applyVisa.nationalities}
              onChange={applyVisa.handleCountryOfOriginChange}
              placeholder="Select your country"
              value={applyVisa.countryOfOrigin}
            />
          </FieldShell>
        ) : null}

        <FieldShell label="Travelling Dates">
          <DateRangePicker
            fromDate={defaultDateRange.from}
            onSelect={applyVisa.setDateRange}
            selectedDates={applyVisa.dateRange}
            toDate={defaultDateRange.to}
          />
        </FieldShell>
      </div>
    </div>
  );
}

function VisaTypeColumn() {
  const applyVisa = useApplyVisaContext();

  return (
    <div className="m-0 h-full w-full overflow-x-hidden">
      <MaxWidthContainer className="h-full w-full">
        <div className="sticky top-0 z-20 flex w-full items-center justify-end border-b bg-white px-3 py-2">
          <Select
            value={applyVisa.currency}
            onValueChange={applyVisa.handleCurrencyChange}
          >
            <SelectTrigger className="h-9 min-w-36 bg-white">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {applyVisa.currencies.map((item) => (
                <SelectItem key={item.currency} value={item.currency}>
                  {item.currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative mt-3 flex w-full flex-col gap-2 px-2">
          {!applyVisa.canMoveToVisaType ? (
            <p className="text-muted-foreground text-sm">
              Select application details to view visa offers.
            </p>
          ) : applyVisa.offersPending ? (
            <>
              <Skeleton className="my-3 h-[190px] w-full rounded-sm" />
              <Skeleton className="my-3 h-[190px] w-full rounded-sm" />
            </>
          ) : applyVisa.visaOffers.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No visa offers available
            </p>
          ) : (
            applyVisa.visaOffers.map((offer, index) => (
              <VisaOfferCard
                index={index}
                key={offer._id ?? `${offer.visa_details?.visa_id}-${index}`}
                offer={offer}
                onDetails={applyVisa.setOfferDetails}
                onSelect={applyVisa.handleVisaOfferSelect}
                selected={offer._id === applyVisa.visaOffer?._id}
              />
            ))
          )}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

function UploadColumn() {
  const applyVisa = useApplyVisaContext();

  if (!applyVisa.visaOffer) {
    return (
      <MaxWidthContainer className="text-muted-foreground text-sm">
        Select a visa offer before uploading documents.
      </MaxWidthContainer>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DocumentsPanel
        documents={applyVisa.documents}
        documentsLoading={applyVisa.documentsPending}
        enableCropEditor={applyVisa.isMobile}
        onUpload={applyVisa.handleUpload}
        removeDocument={applyVisa.removeDocument}
        uploadedDocuments={applyVisa.uploadedDocuments}
        uploadPending={applyVisa.uploadPending}
        wrapSection={
          applyVisa.bootstrap.module === "evm" ? (
            <RaffApplicationPanel
              applicants={applyVisa.raffApplicants}
              isPending={applyVisa.raffPending}
              onAdd={applyVisa.handleRaffSearch}
              searchText={applyVisa.raffSearchText}
              setSearchText={applyVisa.setRaffSearchText}
            />
          ) : null
        }
      />
    </div>
  );
}
