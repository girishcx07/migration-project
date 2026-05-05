"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronsDown,
  ChevronsUp,
  CircleChevronRight,
  Clipboard,
  FileText,
  Info,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { rscActionRequests } from "@repo/rsc-action-requests";
import type { IpData } from "@repo/types";
import type {
  Demand,
  RequiredDocument,
  UploadedDocumentFiles,
  UploadedDocumentImage,
  VisaOffer,
  VisaType,
} from "@repo/types/new-visa";
import type { DateRangeTypes } from "@repo/ui/components/date-range-picker";
import { getClientIpData } from "@repo/api/browser";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import DateRangePicker from "@repo/ui/components/date-range-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { cn } from "@repo/ui/lib/utils";

import type { ModuleBootstrap } from "../../lib/module-registry";
import type { ApplyVisaInitialData } from "../../queries/apply-visa";
import type {
  ApplyVisaActions,
  ApplyVisaCountry,
  ApplyVisaCreateApplicationInput,
  ApplyVisaTravellingToCountry,
  ApplyVisaUploadDocumentRequest,
} from "./types";
import { DocumentDragger } from "../../components/document-dragger";
import { MobileDocumentEditor } from "../../components/mobile-document-editor";
import { CountryCombobox } from "./country-combobox";

const DEFAULT_DAYS_TO_TRAVEL = 1;
const DEFAULT_TRAVEL_YEARS = 1;
const ACCEPTED_DOCUMENT_MIME_TYPES = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg", "jfif"],
  "image/png": ["png"],
} as const;
const ACCEPTED_DOCUMENT_EXTENSIONS = Object.values(
  ACCEPTED_DOCUMENT_MIME_TYPES,
).flat();
const DOCUMENT_DROPZONE_ACCEPT = Object.fromEntries(
  Object.entries(ACCEPTED_DOCUMENT_MIME_TYPES).map(([mimeType, extensions]) => [
    mimeType,
    extensions.map((extension) => `.${extension}`),
  ]),
);
const MAX_DOCUMENT_UPLOAD_SIZE = 20 * 1024 * 1024;
const DOCUMENT_UPLOAD_REQUIREMENTS = `JPG, JPEG, JFIF, PNG, or PDF only. Max ${(
  MAX_DOCUMENT_UPLOAD_SIZE /
  (1024 * 1024)
).toFixed()} MB per file.`;

function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function createRequestKey(parts: readonly (number | string | null | undefined)[]) {
  return parts.map((part) => String(part ?? "")).join("|");
}

function createUniqueRequestKey(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}:${crypto.randomUUID()}`;
  }

  return `${prefix}:${performance.now()}`;
}

interface LatestActionContext {
  isCurrent: () => boolean;
  runAction: <T>(callback: () => Promise<T>) => Promise<T>;
  signal: AbortSignal;
}

type LatestActionTask = (context: LatestActionContext) => Promise<void>;

function useLatestClientTask(
  actionGroup: string,
  startTransition: (callback: () => void) => void,
) {
  const [isRunning, setIsRunning] = useState(false);
  const activeTaskRef = useRef<{
    controller: AbortController;
    key: string;
  } | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  const abort = useCallback(() => {
    activeTaskRef.current?.controller.abort();
    activeTaskRef.current = null;
    lastKeyRef.current = null;
    setIsRunning(false);
    rscActionRequests.cancelAll(
      new DOMException(`${actionGroup} was cancelled.`, "AbortError"),
    );
  }, [actionGroup]);

  const run = useCallback(
    (key: string, task: LatestActionTask) => {
      if (lastKeyRef.current === key) return;

      activeTaskRef.current?.controller.abort(
        new DOMException(`${actionGroup} was superseded.`, "AbortError"),
      );

      const controller = new AbortController();
      const activeTask = { controller, key };
      activeTaskRef.current = activeTask;
      lastKeyRef.current = key;
      setIsRunning(true);

      startTransition(() => {
        void (async () => {
          const isCurrent = () =>
            activeTaskRef.current === activeTask &&
            lastKeyRef.current === key &&
            !controller.signal.aborted;

          try {
            await task({
              isCurrent,
              runAction: (callback) => callback(),
              signal: controller.signal,
            });
          } catch (error) {
            if (!isAbortError(error)) {
              throw error;
            }
          } finally {
            if (activeTaskRef.current === activeTask) {
              activeTaskRef.current = null;
              setIsRunning(false);
            }
          }
        })();
      });
    },
    [actionGroup, startTransition],
  );

  return useMemo(() => ({ abort, isRunning, run }), [abort, isRunning, run]);
}

async function uploadDocumentViaEndpoint(
  endpoint: string,
  formData: FormData,
  signal: AbortSignal,
) {
  const response = await fetch(endpoint, {
    body: formData,
    method: "POST",
    signal,
  });
  const payload = (await response.json()) as Awaited<
    ReturnType<ApplyVisaUploadDocumentRequest>
  >;

  if (!response.ok) {
    return {
      data: null,
      msg: payload.msg ?? "Document upload failed.",
      status: "error" as const,
    };
  }

  return payload;
}
type VisaDocument = RequiredDocument | Demand;
interface CommonNotice {
  htmlContent: string;
  isOpen: boolean;
  title: string;
}
interface NoticeResult {
  cancel: boolean;
  description: string;
  proceed: boolean;
  subDescription?: string;
  title: string;
}

function getDefaultDateRange(): NonNullable<DateRangeTypes> {
  const from = new Date();
  from.setDate(from.getDate() + DEFAULT_DAYS_TO_TRAVEL);
  from.setHours(12, 0, 0, 0);

  const to = new Date(from);
  to.setFullYear(to.getFullYear() + DEFAULT_TRAVEL_YEARS);

  return { from, to };
}

function getTravellingToIdentity({
  countryOfOrigin,
  nationality,
  travellingTo,
}: {
  countryOfOrigin: ApplyVisaCountry | null;
  nationality: ApplyVisaCountry | null;
  travellingTo: ApplyVisaTravellingToCountry | null;
}) {
  return [countryOfOrigin?.cioc, nationality?.cioc, travellingTo?.cioc]
    .filter(Boolean)
    .join("_");
}

function getClientCookie(name: string) {
  if (typeof document === "undefined") return undefined;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : undefined;
}

function setClientCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    "path=/",
    "SameSite=None",
    "Secure",
  ].join("; ");
}

function getVisaNoticeContent({
  selectedNationality,
  selectedTravellingTo,
  visaOffers = [],
  visaTypesData = [],
}: {
  selectedNationality: string;
  selectedTravellingTo: string;
  visaOffers: VisaOffer[];
  visaTypesData: VisaType[];
}): { navigateToNotification: boolean; obj: NoticeResult } {
  const destinationLabel = `For ${selectedNationality} to ${selectedTravellingTo},`;
  const visaTypeMap = visaTypesData.reduce<Record<string, VisaType>>(
    (result, item) => {
      if (item.type) {
        result[item.type.toLowerCase()] = item;
      }

      return result;
    },
    {},
  );

  const restricted =
    visaTypeMap.entry_restricted ?? visaTypeMap.visa_exempt ?? null;
  const visaOnArrival = visaTypeMap.visa_on_arrival ?? null;
  const eta = visaTypeMap.eta ?? null;
  const offerTypes = new Set(
    visaOffers
      .map((offer) => (offer.visa_type ? offer.visa_type.toLowerCase() : ""))
      .filter(Boolean),
  );
  const buildDescription = (description?: string, extra?: string) =>
    [destinationLabel, description, extra].filter(Boolean).join("\n");

  if (restricted) {
    return {
      navigateToNotification: true,
      obj: {
        cancel: true,
        description: buildDescription(restricted.description),
        proceed: false,
        subDescription: restricted.sub_description,
        title: restricted.title || "Important Notice",
      },
    };
  }

  if (visaOnArrival) {
    let extra = "";

    if (offerTypes.has("eta")) {
      extra =
        "However, you can apply for an Electronic Travel Authorization (ETA) for a longer stay.";
    } else if (offerTypes.has("evisa")) {
      extra =
        "However, you can apply for an electronic visa for a longer stay.";
    }

    return {
      navigateToNotification: true,
      obj: {
        cancel: true,
        description: buildDescription(visaOnArrival.description, extra),
        proceed: Boolean(extra),
        subDescription: visaOnArrival.sub_description,
        title: visaOnArrival.title || "Visa on Arrival",
      },
    };
  }

  if (eta) {
    return {
      navigateToNotification: true,
      obj: {
        cancel: false,
        description: buildDescription(eta.description),
        proceed: true,
        subDescription: eta.sub_description,
        title: eta.title || "Electronic Travel Authorization",
      },
    };
  }

  return {
    navigateToNotification: false,
    obj: {
      cancel: false,
      description: "",
      proceed: false,
      subDescription: "",
      title: "",
    },
  };
}

function getApplicationType(module: ModuleBootstrap["module"]) {
  return module === "qr-visa" ? "qr-visa" : "b2b";
}

function getOfferType(module: ModuleBootstrap["module"]) {
  return module === "qr-visa" ? "qr_app" : "apply_new_visa";
}

function toIsoDate(date: Date | undefined) {
  return date ? date.toISOString() : "";
}

function resolveInitialCurrency(
  currencies: { currency: string }[],
  evmCurrency?: string,
) {
  const selectedCurrency = getClientCookie("selected_currency");
  const host = getClientCookie("host");
  const availableCurrencies = new Set(currencies.map((item) => item.currency));

  if (selectedCurrency && availableCurrencies.has(selectedCurrency)) {
    return selectedCurrency;
  }

  if (host === "arcube" && availableCurrencies.has("OMR")) {
    return "OMR";
  }

  if (evmCurrency && availableCurrencies.has(evmCurrency)) {
    return evmCurrency;
  }

  return currencies[0]?.currency ?? "USD";
}

function shouldShowPriceChangeAlert() {
  return (
    getClientCookie("host") === "resbird" &&
    getClientCookie("price_change_ack") !== "true"
  );
}

function findByName<T extends { name: string }>(items: T[], name?: string) {
  if (!name) return null;

  return (
    items.find((item) => item.name.toLowerCase() === name.toLowerCase()) ?? null
  );
}

function isAcceptedDocumentFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const acceptedExtensions = ACCEPTED_DOCUMENT_EXTENSIONS as readonly string[];

  return (
    file.type in ACCEPTED_DOCUMENT_MIME_TYPES ||
    acceptedExtensions.includes(extension)
  );
}

function isWithinDocumentUploadSize(file: File) {
  return file.size <= MAX_DOCUMENT_UPLOAD_SIZE;
}

function findCountryByIpData(countries: ApplyVisaCountry[], ipData: IpData) {
  const countryName = ipData.country_name.toLowerCase();
  const alpha2Code = ipData.country_code.toLowerCase();
  const alpha3Code = ipData.country_code_iso3.toLowerCase();

  return (
    countries.find(
      (country) =>
        country.name.toLowerCase() === countryName ||
        (country.alpha2Code
          ? country.alpha2Code.toLowerCase() === alpha2Code
          : false) ||
        country.cioc.toLowerCase() === alpha3Code,
    ) ?? null
  );
}

function FieldShell({
  children,
  label,
}: Readonly<{
  children: React.ReactNode;
  label: string;
}>) {
  return (
    <MaxWidthContainer className="grid w-full gap-1.5">
      <Label>{label}</Label>
      {children}
    </MaxWidthContainer>
  );
}

function MaxWidthContainer({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={cn("mx-auto max-w-sm", className)}>{children}</div>;
}

function DestinationNoticeDialog({
  notice,
  onClose,
}: Readonly<{
  notice: CommonNotice;
  onClose: () => void;
}>) {
  return (
    <Dialog open={notice.isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-primary">IMPORTANT NOTICE</DialogTitle>
          <h6>{notice.title}</h6>
        </DialogHeader>
        {notice.htmlContent ? (
          <div
            className="mb-3 max-h-[60vh] overflow-y-auto px-6"
            dangerouslySetInnerHTML={{ __html: notice.htmlContent }}
          />
        ) : (
          <div className="px-6">No Content Found!</div>
        )}
        <DialogFooter className="px-6 pb-6">
          <Button onClick={onClose} type="button">
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VisaNoticeDialog({
  data,
  onBack,
  onClose,
  onProceed,
  open,
}: Readonly<{
  data: NoticeResult | null;
  onBack: () => void;
  onClose: () => void;
  onProceed: () => void;
  open: boolean;
}>) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle className="text-primary">
            {data?.title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {data?.description ? (
          <div className="mb-3 max-h-[60vh] overflow-y-auto px-6 whitespace-pre-line">
            {data.description}
          </div>
        ) : (
          <div className="px-6">No Content Found!</div>
        )}
        {data?.subDescription ? (
          <AlertDialogDescription className="px-6 italic">
            {data.subDescription}
          </AlertDialogDescription>
        ) : null}
        <AlertDialogFooter className="px-6 pb-6">
          {data?.cancel ? (
            <Button
              className={data.proceed ? "bg-black hover:bg-black" : ""}
              onClick={onBack}
              type="button"
            >
              {data.proceed ? "Back" : "OK"}
            </Button>
          ) : null}
          {data?.proceed ? (
            <Button onClick={onProceed} type="button">
              Proceed
            </Button>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PriceChangeAlertDialog({
  onAcknowledge,
  open,
}: Readonly<{
  onAcknowledge: () => void;
  open: boolean;
}>) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pricing Update</AlertDialogTitle>
          <AlertDialogDescription>
            Visa pricing has been updated. Please review the latest fees before
            continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onAcknowledge}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function OfferDetailsDialog({
  offer,
  open,
  onOpenChange,
}: Readonly<{
  offer: VisaOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] overflow-hidden sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">
            {offer?.visa_details?.duration_display}{" "}
            {offer?.visa_type_display_name}
            {offer?.is_visaero_insurance_bundled ? " + Insurance" : ""}
          </DialogTitle>
          <DialogDescription>
            {offer?.visa_category} | {offer?.processing_type} |{" "}
            {offer?.entry_type} Entry
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 max-h-[calc(100vh-15rem)] px-6">
          <h3 className="mb-2 text-lg font-bold">Fee Breakup</h3>
          <div className="mb-2 space-y-3 rounded-lg border bg-card px-3 py-4 text-sm shadow-sm">
            <div className="flex justify-between gap-4">
              <div className="flex flex-col">
                <span>{offer?.visa_type_display_name}</span>
                {offer?.is_visaero_insurance_bundled ? (
                  <span className="text-xs">
                    (With Complimentary Insurance)
                  </span>
                ) : null}
              </div>
              <div>
                {offer?.visa_details?.fees.currency}{" "}
                {offer?.visa_details?.fees.adult_govt_fee}
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div>Service Fee & Taxes</div>
              <div>
                {offer?.visa_details?.fees.currency}{" "}
                {offer?.visa_details?.fees.adult_service_fee}
              </div>
            </div>
            {offer?.visa_details?.fees.convenience_fee ? (
              <div className="flex justify-between gap-4">
                <div>Convenience Fee</div>
                <div>
                  {offer.visa_details.fees.currency}{" "}
                  {offer.visa_details.fees.convenience_fee}
                </div>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 font-bold">
              <div className="text-primary">Total</div>
              <div>
                {offer?.visa_details?.fees.currency}{" "}
                {offer?.visa_details?.fees.total_cost}
              </div>
            </div>
          </div>

          <Separator className="my-3" />
          <div className="rounded-lg border bg-card p-3 font-semibold shadow-sm">
            {offer?.visa_type_display_name}
          </div>
          <div className="my-3 grid grid-cols-3 items-center text-sm font-bold text-gray-800 capitalize">
            <div>{offer?.visa_category}</div>
            <div className="border-x text-center">{offer?.processing_type}</div>
            <div className="text-right">{offer?.entry_type} Entry</div>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              Visa Validity:{" "}
              <span className="text-gray-500">
                {offer?.visa_details?.visa_validity}
              </span>
            </p>
            <p>
              Stay Validity:{" "}
              <span className="text-gray-500">
                {offer?.visa_details?.stay_validity}
              </span>
            </p>
            <p>
              Processing Time:{" "}
              <span className="text-gray-500">
                {offer?.visa_details?.processing_time}
              </span>
            </p>
          </div>

          {offer?.visa_details?.description ? (
            <p className="text-muted-foreground my-2 text-[0.8rem]">
              {offer.visa_details.description}
            </p>
          ) : null}

          {offer?.is_visaero_insurance_bundled ? (
            <>
              <Separator className="my-3" />
              <div className="rounded-lg border bg-card p-3 font-semibold shadow-sm">
                Travel Insurance
              </div>
              <table className="my-2 border-separate border-spacing-y-1 text-sm">
                <tbody>
                  {offer.insurance_details?.insurance_desc.map((item) => (
                    <tr key={`${item.name}-${item.value}`} className="text-xs">
                      <td className="w-1/2 font-normal">{item.name}:</td>
                      <td className="w-1/2 text-gray-500">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function VisaOfferCard({
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
        "flex h-auto min-h-[190px] cursor-pointer flex-col gap-0 overflow-hidden rounded-lg py-0 transition-all duration-300 ease-in-out",
        selected
          ? "border-primary shadow-primary scale-100 border-2 shadow-sm"
          : "scale-95 border-2 border-transparent",
      )}
      onClick={() => onSelect(offer)}
    >
      <CardHeader className="border-b bg-muted/40 px-2 py-3">
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

function DocSection<T extends VisaDocument>({
  documents,
  onInfoClick,
  title,
}: Readonly<{
  documents: T[];
  onInfoClick: (document: T) => void;
  title: string;
}>) {
  if (!documents.length) return null;

  return (
    <div className="mb-3">
      <p className="text-primary mb-2 text-sm font-semibold">{title}</p>
      <ol className="ml-3 list-decimal space-y-2 marker:text-black">
        {documents.map((document) => (
          <li className="text-sm" key={document.doc_id}>
            <div className="flex items-center justify-between gap-3">
              <span>
                {document.doc_display_name}
                {"doc_snap" in document &&
                document.doc_snap.some((snap) => snap.mandatory) ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </span>
              <button onClick={() => onInfoClick(document)} type="button">
                <Info className="size-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {document.doc_short_description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DocumentsEmptyState({
  description,
  title,
}: Readonly<{
  description: string;
  title: string;
}>) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center">
      <FileText className="text-muted-foreground mb-2 size-7" />
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
        {description}
      </p>
    </div>
  );
}

function UploadedFileCard({
  file,
  onDelete,
}: Readonly<{
  file: UploadedDocumentImage;
  onDelete: () => void;
}>) {
  const isPdf =
    file.file_name.toLowerCase().endsWith(".pdf") ||
    file.mime_type === "application/pdf" ||
    file.file_type === "application/pdf";
  const hasError = !file.is_valid && !isPdf;
  const errorMessage = Array.isArray(file.error_message)
    ? (file.error_message as string[]).join(", ")
    : (file.error_message ?? "Image too small or unclear");

  return (
    <div className="flex h-[220px] min-w-0 flex-col overflow-hidden rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="truncate text-left text-sm">
                {file.original_file_name || file.file_name}
              </p>
            }
          />
          <TooltipContent className="border bg-white text-gray-500 shadow-sm">
            {file.original_file_name || file.file_name}
          </TooltipContent>
        </Tooltip>
        <AlertDialog>
          <AlertDialogTrigger render={<button type="button" />}>
            <Trash2 className="size-4 cursor-pointer text-red-500" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isPdf ? (
        <div className="relative flex h-36 w-full items-center justify-center rounded-md border bg-white">
          <span className="absolute top-1 right-1 rounded bg-red-500 px-2 text-xs text-white">
            PDF
          </span>
          <FileText className="size-20 text-red-500" />
        </div>
      ) : (
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-md border bg-white">
          {hasError ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="absolute top-0 right-0 z-10 cursor-pointer">
                    <Info fill="red" className="size-4 text-white" />
                  </div>
                }
              />
              <TooltipContent className="max-w-56 border bg-white text-red-500 shadow-sm">
                {errorMessage}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <img
            alt={file.file_name}
            className="h-full w-full object-contain object-center p-1"
            loading="lazy"
            src={file.file_thumbnail || file.file}
          />
        </div>
      )}
    </div>
  );
}

function DocumentsPanel({
  documents,
  documentsLoading,
  enableCropEditor,
  onUpload,
  uploadedDocuments,
  uploadPending,
  removeDocument,
}: Readonly<{
  documents: Awaited<ReturnType<ApplyVisaActions["getVisaDocuments"]>> | null;
  documentsLoading: boolean;
  enableCropEditor: boolean;
  onUpload: (files: File[]) => void;
  uploadedDocuments: UploadedDocumentFiles;
  uploadPending: boolean;
  removeDocument: (index: number) => void;
}>) {
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [docInfo, setDocInfo] = useState<VisaDocument | null>(null);
  const [copied, setCopied] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropEditorOpen, setIsCropEditorOpen] = useState(false);

  const requiredDocuments = documents?.data?.required_documents ?? [];
  const additionalDocuments = (documents?.data?.evaluate ?? [])
    .map((item) => item.demand[0])
    .filter((document): document is Demand => Boolean(document));
  const listedDocuments = [...requiredDocuments, ...additionalDocuments];
  const hasDocumentError = uploadedDocuments.some(
    (document) =>
      !document.is_valid && document.file_type !== "application/pdf",
  );
  const shouldShowToggle =
    requiredDocuments.length + additionalDocuments.length > 5;

  const submitFiles = (files: File[]) => {
    if (!files.length) return;

    if (
      enableCropEditor &&
      files.length === 1 &&
      files[0]?.type.startsWith("image/")
    ) {
      setCropFile(files[0]);
      setIsCropEditorOpen(true);
      return;
    }

    onUpload(files);
  };

  const copyDocuments = async () => {
    const required = requiredDocuments
      .map((document, index) => `${index + 1}. ${document.doc_display_name}`)
      .join("\n");
    const additional = additionalDocuments
      .map((document, index) => `${index + 1}. ${document.doc_display_name}`)
      .join("\n");

    await navigator.clipboard.writeText(
      [required, additional].filter(Boolean).join("\n"),
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-2 py-2">
        <div className="relative min-h-0 flex-1 px-2 md:px-6">
          <Card
            className={cn(
              "relative h-full gap-0 overflow-hidden rounded-lg py-0 shadow-sm transition-all duration-300",
              shouldShowToggle && "pb-12",
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3 text-base font-semibold text-foreground">
              <span>Documents</span>
              <button
                className="hover:bg-muted inline-flex size-8 items-center justify-center rounded-lg"
                onClick={copyDocuments}
                type="button"
              >
                {copied ? (
                  <span className="flex items-center text-xs text-green-600">
                    <Check className="mr-1 size-4" /> Copied
                  </span>
                ) : (
                  <Clipboard className="size-5 cursor-pointer" />
                )}
              </button>
            </div>
            <CardContent
              className={cn(
                "min-h-0 flex-1 py-3",
                showAllDocs ? "overflow-y-auto" : "overflow-hidden",
              )}
            >
              {documentsLoading ? (
                <div className="mb-3 space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton
                      className={cn(
                        "h-4",
                        index % 2 === 0 ? "w-[250px]" : "w-[200px]",
                      )}
                      key={index}
                    />
                  ))}
                </div>
              ) : listedDocuments.length === 0 ? (
                <DocumentsEmptyState
                  description="The selected visa offer does not have document requirements available yet."
                  title="No document list available"
                />
              ) : (
                <>
                  <DocSection
                    documents={requiredDocuments}
                    onInfoClick={setDocInfo}
                    title="Required Documents"
                  />
                  <DocSection
                    documents={additionalDocuments}
                    onInfoClick={setDocInfo}
                    title="Additional Documents"
                  />
                </>
              )}
            </CardContent>
            {shouldShowToggle ? (
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-2 pt-10",
                  showAllDocs
                    ? "bg-card"
                    : "bg-gradient-to-t from-card via-card/95 to-transparent",
                )}
              >
                <button
                  className="pointer-events-auto flex h-8 items-center gap-2 rounded-lg border bg-background px-3 text-sm shadow-sm hover:bg-muted"
                  onClick={() => setShowAllDocs((current) => !current)}
                  type="button"
                >
                  {showAllDocs ? "Show Less" : "Show More"}
                  {showAllDocs ? (
                    <ChevronsUp size={14} />
                  ) : (
                    <ChevronsDown size={14} />
                  )}
                </button>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="w-full shrink-0 bg-white px-2 pt-2 pb-3 md:px-6">
          <DocumentDragger
            uploadOptions={{
              accept: DOCUMENT_DROPZONE_ACCEPT,
              maxSize: MAX_DOCUMENT_UPLOAD_SIZE,
              multiple: true,
              onDrop: submitFiles,
            }}
          >
            <span className="text-primary text-2xl leading-none">+</span>
            <span className="text-sm font-medium">Upload documents</span>
            <span className="text-muted-foreground text-xs">
              Drag files here or browse from your device
            </span>
            <span className="text-muted-foreground text-xs">
              {DOCUMENT_UPLOAD_REQUIREMENTS}
            </span>
          </DocumentDragger>

          {uploadPending ? (
            <div className="my-2 flex items-center gap-2 text-xs text-slate-500">
              Uploading documents
              <LoaderCircle className="text-primary size-5 animate-spin" />
            </div>
          ) : null}

          {uploadedDocuments.length > 0 ? (
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    className="bg-primary/10 hover:bg-primary/20 border-primary text-primary hover:text-primary relative my-3 w-full"
                    type="button"
                    variant="outline"
                  />
                }
              >
                View Uploaded Documents
                <span className="border-primary relative ml-2 flex min-h-6 min-w-6 items-center justify-center rounded-full border px-2 py-0.5">
                  {uploadedDocuments.length}
                  {hasDocumentError ? (
                    <Info
                      fill="red"
                      className="absolute -top-1 -right-1 size-4 text-white"
                    />
                  ) : null}
                </span>
              </DialogTrigger>
              <DialogContent className="flex h-[75vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden p-4 sm:w-[92vw] sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Uploaded Documents</DialogTitle>
                  <DialogDescription>
                    Review, validate, or remove uploaded files before
                    proceeding.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="min-h-0 flex-1 pr-3">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {uploadedDocuments.map((file, index) => (
                      <UploadedFileCard
                        file={file}
                        key={`${file.file_name}-${index}`}
                        onDelete={() => removeDocument(index)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      <Dialog open={Boolean(docInfo)} onOpenChange={() => setDocInfo(null)}>
        <DialogContent className="sm:min-h-32 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{docInfo?.doc_display_name}</DialogTitle>
            <DialogDescription>
              {docInfo?.doc_short_description}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-black">{docInfo?.doc_description}</p>
        </DialogContent>
      </Dialog>

      <MobileDocumentEditor
        file={cropFile}
        isOpen={isCropEditorOpen}
        onSave={(croppedFile) => {
          onUpload([croppedFile]);
          setCropFile(null);
        }}
        setIsOpen={(open) => {
          setIsCropEditorOpen(open);
          if (!open) setCropFile(null);
        }}
        title="Edit Uploaded Document"
      />
    </>
  );
}

function RaffApplicationPanel({
  applicants,
  isPending,
  onAdd,
  searchText,
  setSearchText,
}: Readonly<{
  applicants: string[];
  isPending: boolean;
  onAdd: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
}>) {
  return (
    <div className="mb-4 space-y-2 rounded-lg border bg-card p-4 md:border-0 md:bg-transparent md:p-0">
      <Label>RAFF Application</Label>
      <div className="flex gap-2">
        <Input
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search RAFF reference"
          value={searchText}
        />
        <Button
          disabled={isPending}
          onClick={onAdd}
          type="button"
          variant="outline"
        >
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Add
        </Button>
      </div>
      {applicants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {applicants.map((applicant) => (
            <Badge key={applicant} variant="secondary">
              {applicant}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VisaColumnCard({
  bodyClassName,
  children,
  columnNumber,
  direction,
  fullWidth,
  number,
  onJumpBack,
  title,
}: Readonly<{
  bodyClassName?: string;
  children: React.ReactNode;
  columnNumber: number;
  direction: "forward" | "backward";
  fullWidth?: boolean;
  number: number;
  onJumpBack: (number: number) => void;
  title: string;
}>) {
  const expanded = columnNumber === number;
  const columnWidth = `${100 / columnNumber}%`;

  return (
    <Card
      className={cn(
        "flex h-[45px] min-w-0 flex-col gap-0 overflow-hidden rounded-lg py-0 shadow-none transition-all duration-300 md:h-full",
        fullWidth && "w-full",
        direction === "forward"
          ? "md:animate-in md:fade-in md:slide-in-from-right-4"
          : "md:animate-in md:fade-in md:slide-in-from-left-4",
        expanded && "h-full md:h-full",
      )}
      style={
        fullWidth
          ? undefined
          : {
              flexBasis: columnWidth,
              maxWidth: columnWidth,
              width: columnWidth,
            }
      }
    >
      <CardHeader
        className="cursor-pointer justify-center border-b bg-muted/40 p-2 md:pointer-events-none md:py-3"
        onClick={() => {
          if (number < columnNumber) onJumpBack(number);
        }}
      >
        <CardTitle className="w-full md:flex md:justify-center">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-black text-sm text-white md:size-8 md:text-lg">
              {number}
            </div>
            <div className="flex-grow text-sm md:text-lg">{title}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "min-h-0 w-full flex-1 self-start overflow-y-auto pt-0 opacity-100 transition-all duration-300 ease-in-out md:max-h-none md:p-4",
          !expanded &&
            "max-h-0 flex-none p-0 opacity-0 md:max-h-none md:flex-1 md:opacity-100",
          bodyClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export function ApplyVisaClient({
  actions,
  bootstrap,
  initialData,
  uploadDocumentEndpoint,
}: Readonly<{
  actions: ApplyVisaActions;
  bootstrap: ModuleBootstrap;
  initialData: ApplyVisaInitialData;
  uploadDocumentEndpoint?: string;
}>) {
  const nationalities = useMemo(
    () => initialData.nationalities.data?.data ?? [],
    [initialData.nationalities.data],
  );
  const evmRequest = initialData.evmRequest?.data ?? null;
  const currencies = initialData.supportedCurrencies.data?.currencies ?? [];
  const defaultNationality = useMemo(
    () => findByName(nationalities, evmRequest?.nationality),
    [evmRequest?.nationality, nationalities],
  );

  const [columnNumber, setColumnNumber] = useState(1);
  const [nationality, setNationality] = useState<ApplyVisaCountry | null>(
    defaultNationality,
  );
  const [countryOfOrigin, setCountryOfOrigin] =
    useState<ApplyVisaCountry | null>(defaultNationality);
  const [travellingTo, setTravellingTo] =
    useState<ApplyVisaTravellingToCountry | null>(null);
  const [travellingToOptions, setTravellingToOptions] = useState<
    ApplyVisaTravellingToCountry[]
  >([]);
  const [dateRange, setDateRange] = useState<DateRangeTypes>(() => {
    if (evmRequest?.start_date && evmRequest.end_date) {
      return {
        from: new Date(evmRequest.start_date),
        to: new Date(evmRequest.end_date),
      };
    }

    return getDefaultDateRange();
  });
  const [currency, setCurrency] = useState(() =>
    resolveInitialCurrency(currencies, evmRequest?.currency),
  );
  const [visaOffers, setVisaOffers] = useState<VisaOffer[]>([]);
  const [visaOffer, setVisaOffer] = useState<VisaOffer | null>(null);
  const [offerDetails, setOfferDetails] = useState<VisaOffer | null>(null);
  const [documents, setDocuments] = useState<Awaited<
    ReturnType<ApplyVisaActions["getVisaDocuments"]>
  > | null>(null);
  const [uploadedDocuments, setUploadedDocuments] =
    useState<UploadedDocumentFiles>([]);
  const [raffApplicants, setRaffApplicants] = useState<string[]>([]);
  const [raffSearchText, setRaffSearchText] = useState("");
  const [commonNotice, setCommonNotice] = useState<CommonNotice>({
    htmlContent: "",
    isOpen: false,
    title: "",
  });
  const [visaNotice, setVisaNotice] = useState<NoticeResult | null>(null);
  const [isVisaNoticeHandled, setIsVisaNoticeHandled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(
    shouldShowPriceChangeAlert,
  );
  const [invalidDocumentDialogOpen, setInvalidDocumentDialogOpen] =
    useState(false);
  const [resetDialogColumn, setResetDialogColumn] = useState<number | null>(
    null,
  );
  const [columnDirection, setColumnDirection] = useState<
    "forward" | "backward"
  >("forward");
  const actionsRef = useLatestRef(actions);
  const hasUserSelectedNationality = useRef(Boolean(defaultNationality));
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [travellingToTransitionPending, startTravellingToTransition] =
    useTransition();
  const [offersTransitionPending, startOffersTransition] = useTransition();
  const [documentsTransitionPending, startDocumentsTransition] =
    useTransition();
  const [uploadTransitionPending, startUploadTransition] = useTransition();
  const [submitTransitionPending, startSubmitTransition] = useTransition();
  const {
    abort: abortTravellingTo,
    isRunning: travellingToRunning,
    run: runTravellingTo,
  } = useLatestClientTask(
    "apply-visa:travelling-to",
    startTravellingToTransition,
  );
  const {
    abort: abortVisaOffers,
    isRunning: visaOffersRunning,
    run: runVisaOffers,
  } = useLatestClientTask(
    "apply-visa:visa-offers",
    startOffersTransition,
  );
  const {
    abort: abortDocuments,
    isRunning: documentsRunning,
    run: runDocuments,
  } = useLatestClientTask(
    "apply-visa:documents",
    startDocumentsTransition,
  );
  const {
    abort: abortUpload,
    isRunning: uploadRunning,
    run: runUpload,
  } = useLatestClientTask(
    "apply-visa:upload",
    startUploadTransition,
  );
  const {
    abort: abortRaffSearch,
    isRunning: raffSearchRunning,
    run: runRaffSearch,
  } = useLatestClientTask(
    "apply-visa:raff-search",
    startTransition,
  );
  const {
    abort: abortPriceAcknowledge,
    run: runPriceAcknowledge,
  } = useLatestClientTask(
    "apply-visa:price-acknowledge",
    startTransition,
  );
  const {
    abort: abortSubmit,
    isRunning: submitRunning,
    run: runSubmit,
  } = useLatestClientTask(
    "apply-visa:submit",
    startSubmitTransition,
  );
  const raffPending = isPending || raffSearchRunning;
  const travellingToPending =
    travellingToTransitionPending || travellingToRunning;
  const offersPending = offersTransitionPending || visaOffersRunning;
  const documentsPending = documentsTransitionPending || documentsRunning;
  const uploadPending = uploadTransitionPending || uploadRunning;
  const submitPending = submitTransitionPending || submitRunning;

  const abortUploadWork = useCallback(() => {
    abortUpload();
  }, [abortUpload]);

  const uploadDocument: ApplyVisaUploadDocumentRequest = (formData, signal) => {
    if (uploadDocumentEndpoint) {
      return uploadDocumentViaEndpoint(
        uploadDocumentEndpoint,
        formData,
        signal,
      );
    }

    if (actionsRef.current.uploadDocument) {
      return actionsRef.current.uploadDocument(formData);
    }

    return Promise.resolve({
      data: null,
      msg: "Document upload is not configured.",
      status: "error" as const,
    });
  };

  useEffect(() => {
    return () => {
      abortTravellingTo();
      abortVisaOffers();
      abortDocuments();
      abortUpload();
      abortRaffSearch();
      abortPriceAcknowledge();
      abortSubmit();
    };
  }, [
    abortDocuments,
    abortPriceAcknowledge,
    abortRaffSearch,
    abortSubmit,
    abortTravellingTo,
    abortUpload,
    abortVisaOffers,
  ]);

  useEffect(() => {
    if (
      defaultNationality ||
      nationality ||
      hasUserSelectedNationality.current ||
      !nationalities.length
    ) {
      return;
    }

    const controller = new AbortController();

    getClientIpData({ signal: controller.signal })
      .then((ipData) => {
        if (hasUserSelectedNationality.current) return;

        const ipNationality = findCountryByIpData(nationalities, ipData);
        if (ipNationality) {
          setNationality(ipNationality);
          setCountryOfOrigin(ipNationality);
        }
      })
      .catch(() => {
        // IP defaulting is best-effort and must not block the form.
      });

    return () => controller.abort();
  }, [defaultNationality, nationalities, nationality]);

  useEffect(() => {
    setClientCookie("selected_currency", currency);
  }, [currency]);

  useEffect(() => {
    const origin = countryOfOrigin ?? nationality;

    if (!nationality || !origin) {
      abortTravellingTo();
      return;
    }

    const requestKey = createRequestKey([
      bootstrap.module,
      nationality.name,
      origin.name,
      evmRequest?.destination ?? "",
    ]);

    runTravellingTo(requestKey, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.getTravellingTo({
          module: bootstrap.module,
          nationality: nationality.name,
          origin: origin.name,
        }),
      );
      if (!isCurrent()) {
        return;
      }

      const options = response.data?.data ?? [];
      setTravellingToOptions(options);

      const defaultDestination = findByName(options, evmRequest?.destination);
      if (defaultDestination && isCurrent()) {
        setTravellingTo(defaultDestination);
      }
    });
  }, [
    actionsRef,
    bootstrap.module,
    countryOfOrigin,
    evmRequest?.destination,
    nationality,
    abortTravellingTo,
    runTravellingTo,
  ]);

  const travellingToIdentity = getTravellingToIdentity({
    countryOfOrigin,
    nationality,
    travellingTo,
  });

  useEffect(() => {
    if (!currency || !nationality || !countryOfOrigin || !travellingTo) {
      abortVisaOffers();
      return;
    }

    const requestKey = createRequestKey([
      bootstrap.module,
      currency,
      travellingTo.managed_by ?? "",
      travellingTo.name,
      travellingToIdentity,
      getOfferType(bootstrap.module),
    ]);

    runVisaOffers(requestKey, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.getVisaOffers({
          currency,
          managedBy: travellingTo.managed_by ?? "",
          module: bootstrap.module,
          travellingTo: travellingTo.name,
          travellingToIdentity,
          type: getOfferType(bootstrap.module),
        }),
      );
      if (!isCurrent()) {
        return;
      }

      setVisaOffers(response.data ?? []);
    });
  }, [
    actionsRef,
    bootstrap.module,
    countryOfOrigin,
    currency,
    abortVisaOffers,
    nationality,
    runVisaOffers,
    travellingTo,
    travellingToIdentity,
  ]);

  const visaNoticeContent = useMemo(() => {
    return getVisaNoticeContent({
      selectedNationality: nationality?.name ?? "",
      selectedTravellingTo: travellingTo?.name ?? "",
      visaOffers,
      visaTypesData: (travellingTo?.visa_types ?? []) as VisaType[],
    });
  }, [
    nationality?.name,
    travellingTo?.name,
    travellingTo?.visa_types,
    visaOffers,
  ]);

  const hasRestrictedVisaNotice = useMemo(
    () =>
      ((travellingTo?.visa_types ?? []) as VisaType[]).some((item) => {
        const type = item.type.toLowerCase();
        return type === "entry_restricted" || type === "visa_exempt";
      }),
    [travellingTo?.visa_types],
  );

  const hasVisaOnArrivalNotice = useMemo(
    () =>
      ((travellingTo?.visa_types ?? []) as VisaType[]).some(
        (item) => item.type.toLowerCase() === "visa_on_arrival",
      ),
    [travellingTo?.visa_types],
  );

  const shouldSuppressVisaOnArrivalNotice =
    hasVisaOnArrivalNotice && !hasRestrictedVisaNotice;

  const shouldOpenVisaNotice =
    visaNoticeContent.navigateToNotification &&
    !shouldSuppressVisaOnArrivalNotice;
  const activeVisaNotice =
    visaNotice ??
    (!isMobile &&
    shouldOpenVisaNotice &&
    !isVisaNoticeHandled &&
    !commonNotice.isOpen
      ? visaNoticeContent.obj
      : null);

  useEffect(() => {
    if (
      !visaOffer?.visa_details?.visa_id ||
      !visaOffer.travelling_to_identity
    ) {
      abortDocuments();
      abortUploadWork();
      return;
    }

    const requestKey = createRequestKey([
      bootstrap.module,
      visaOffer.travelling_to_identity,
      visaOffer.visa_details.visa_id,
    ]);

    abortUploadWork();
    // Show the document skeleton immediately when the selected offer changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(null);

    runDocuments(requestKey, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.getVisaDocuments({
          module: bootstrap.module,
          travellingToIdentity: visaOffer.travelling_to_identity ?? "",
          visaId: visaOffer.visa_details?.visa_id ?? "",
        }),
      );
      if (!isCurrent()) {
        return;
      }

      setDocuments(response);
    });
  }, [
    abortUploadWork,
    actionsRef,
    abortDocuments,
    bootstrap.module,
    runDocuments,
    visaOffer,
  ]);

  const canMoveToVisaType =
    Boolean(nationality) &&
    Boolean(countryOfOrigin) &&
    Boolean(travellingTo) &&
    Boolean(dateRange?.from) &&
    Boolean(dateRange?.to);
  const canSubmit =
    Boolean(visaOffer) &&
    (uploadedDocuments.length > 0 || raffApplicants.length > 0) &&
    !uploadPending &&
    !submitPending;

  const setActiveColumn = (nextColumn: number) => {
    setColumnDirection(nextColumn >= columnNumber ? "forward" : "backward");
    setColumnNumber(nextColumn);
  };

  const rejectDocumentWork = () => {
    abortDocuments();
    abortUploadWork();
  };

  const rejectVisaOfferWork = () => {
    abortVisaOffers();
    rejectDocumentWork();
  };

  const rejectRouteWork = () => {
    abortTravellingTo();
    rejectVisaOfferWork();
  };

  const resetRouteSelection = () => {
    rejectRouteWork();
    setTravellingTo(null);
    setTravellingToOptions([]);
    setVisaOffer(null);
    setDocuments(null);
    setVisaOffers([]);
    setUploadedDocuments([]);
    setCommonNotice({ htmlContent: "", isOpen: false, title: "" });
    setVisaNotice(null);
    setIsVisaNoticeHandled(false);
  };

  const handleNationalityChange = (
    nextNationality: ApplyVisaCountry | null,
  ) => {
    hasUserSelectedNationality.current = true;
    setNationality(nextNationality);
    setCountryOfOrigin(nextNationality);
    resetRouteSelection();
    setActiveColumn(1);
  };

  const handleCountryOfOriginChange = (
    nextCountryOfOrigin: ApplyVisaCountry | null,
  ) => {
    setCountryOfOrigin(nextCountryOfOrigin);
    resetRouteSelection();
    setActiveColumn(1);
  };

  const handleTravellingToChange = (
    nextDestination: ApplyVisaTravellingToCountry | null,
  ) => {
    rejectVisaOfferWork();
    setTravellingTo(nextDestination);
    setVisaOffer(null);
    setDocuments(null);
    setUploadedDocuments([]);
    setVisaOffers([]);
    setVisaNotice(null);
    setIsVisaNoticeHandled(false);
    setCommonNotice({
      htmlContent: nextDestination?.destination_info?.html_content ?? "",
      isOpen: Boolean(nextDestination?.destination_info),
      title: nextDestination?.destination_info?.title ?? "",
    });

    if (!nextDestination?.cor_required) {
      setCountryOfOrigin(nationality);
    }

    if (nextDestination && !nextDestination.destination_info && !isMobile) {
      setActiveColumn(2);
    }
  };

  const handleUpload = (files: File[]) => {
    const acceptedFiles = files.filter(
      (file) =>
        isAcceptedDocumentFile(file) && isWithinDocumentUploadSize(file),
    );

    const hasInvalidType = files.some((file) => !isAcceptedDocumentFile(file));
    const hasOversizedFile = files.some(
      (file) =>
        isAcceptedDocumentFile(file) && !isWithinDocumentUploadSize(file),
    );

    if (hasInvalidType) {
      toast.error("Upload JPG, JPEG, JFIF, PNG, or PDF documents only.");
    }

    if (hasOversizedFile) {
      toast.error(
        `Each document must be ${(MAX_DOCUMENT_UPLOAD_SIZE / (1024 * 1024)).toFixed()} MB or smaller.`,
      );
    }

    if (
      !acceptedFiles.length ||
      !nationality ||
      !visaOffer?.visa_details?.visa_id
    ) {
      return;
    }

    const uploadVisaId = visaOffer.visa_details.visa_id;
    const uploadNationalityCode = nationality.cioc;

    runUpload(
      createUniqueRequestKey("upload"),
      async ({ isCurrent, runAction, signal }) => {
        const uploadResults = await Promise.allSettled(
          acceptedFiles.map((file) => {
            const formData = new FormData();
            formData.append("document", file);
            formData.append("module", bootstrap.module);
            formData.append("nationalityCode", uploadNationalityCode);
            formData.append("visaId", uploadVisaId);

            return runAction(() => uploadDocument(formData, signal));
          }),
        );

        if (!isCurrent()) {
          return;
        }

        const uploaded = uploadResults.flatMap((result) => {
          if (
            result.status === "fulfilled" &&
            result.value.status === "success" &&
            result.value.data
          ) {
            return result.value.data;
          }

          return [];
        });
        const failedUpload = uploadResults.find((result) => {
          if (result.status === "rejected") {
            return !isAbortError(result.reason);
          }

          return result.value.status !== "success" || !result.value.data;
        });

        if (uploaded.length > 0) {
          setUploadedDocuments((previous) => [...previous, ...uploaded]);
        }

        if (failedUpload) {
          toast.error(
            failedUpload.status === "fulfilled"
              ? (failedUpload.value.msg ?? "Document upload failed.")
              : "Document upload failed.",
          );
        }
      },
    );
  };

  const handleRaffSearch = () => {
    if (!raffSearchText.trim()) return;
    const searchText = raffSearchText.trim();

    runRaffSearch(searchText, async ({ isCurrent, runAction }) => {
      const response = await runAction(() =>
        actionsRef.current.searchRaffApplication({
          module: bootstrap.module,
          searchText,
        }),
      );
      if (!isCurrent()) {
        return;
      }
      const applicantRefs =
        response.data?.map((applicant) => applicant.ref_code).filter(Boolean) ??
        [];
      setRaffApplicants((previous) =>
        Array.from(new Set([...previous, ...applicantRefs])),
      );
      if (applicantRefs.length === 0) {
        setMessage(response.msg ?? "No RAFF applicants found.");
      }
    });
  };

  const createApplicationPayload =
    (): ApplyVisaCreateApplicationInput | null => {
      if (
        !nationality ||
        !countryOfOrigin ||
        !travellingTo ||
        !visaOffer ||
        !dateRange
      ) {
        return null;
      }

      return {
        applicationCreatedByUser: "",
        applicationType: getApplicationType(bootstrap.module),
        baseCurrencySymbol: currency,
        currency,
        documents: uploadedDocuments,
        durationType: visaOffer.visa_details?.duration_type ?? "",
        insuranceDetails: visaOffer.insurance_details ?? {
          insurance_coverage: [],
          insurance_desc: [],
          insurance_title: "",
          insurance_type: "",
          insurance_type_id: "",
          visaero_insurance_fees: "",
          visaero_service_fees: "",
        },
        isVisaeroInsuranceBundled: Boolean(
          visaOffer.is_visaero_insurance_bundled,
        ),
        isWithInsurance: String(
          Boolean(visaOffer.is_visaero_insurance_bundled),
        ),
        journeyEndDate: toIsoDate(dateRange.to),
        journeyStartDate: toIsoDate(dateRange.from),
        module: bootstrap.module,
        nationality: nationality.name,
        origin: countryOfOrigin.name,
        platform: "web",
        raffApplicants,
        totalDays: visaOffer.visa_details?.duration_days ?? "",
        travellingTo: travellingTo.cioc,
        travellingToCountry: travellingTo.name,
        travellingToIdentity:
          visaOffer.travelling_to_identity ?? travellingToIdentity,
        userType: bootstrap.module === "qr-visa" ? "customer" : "admin",
        visaCategory: visaOffer.visa_category ?? "",
        visaCode: visaOffer.visa_details?.visa_code ?? "",
        visaEntryType: visaOffer.entry_type ?? "",
        visaFees: visaOffer.visa_details?.fees ?? {
          adult_govt_fee: "",
          adult_service_fee: "",
          child_govt_fee: "",
          child_service_fee: "",
          currency,
          infant_govt_fee: "",
          infant_service_fee: "",
          total_cost: "",
          total_service_fee: "",
        },
        visaId: visaOffer.visa_details?.visa_id ?? "",
        visaProcessingType: visaOffer.processing_type ?? "",
        visaType: visaOffer.visa_type ?? "",
        visaTypeDisplayName: visaOffer.visa_type_display_name ?? "",
      };
    };

  const submitApplication = () => {
    const payload = createApplicationPayload();

    if (!payload) {
      setMessage("Complete the application details before proceeding.");
      return;
    }

    runSubmit(
      createUniqueRequestKey("submit"),
      async ({ isCurrent, runAction }) => {
        const response = await runAction(() =>
          actionsRef.current.createApplication(payload),
        );
        if (!isCurrent()) {
          return;
        }

        if (response.status === "success") {
          window.location.assign(`/${bootstrap.module}/review`);
          return;
        }

        setMessage(response.msg ?? "Failed to create an application.");
      },
    );
  };

  const handleSubmit = () => {
    const hasInvalidDocuments = uploadedDocuments.some(
      (document) =>
        !document.is_valid && document.file_type !== "application/pdf",
    );

    if (hasInvalidDocuments) {
      setInvalidDocumentDialogOpen(true);
      return;
    }

    submitApplication();
  };

  const confirmColumnReset = () => {
    if (!resetDialogColumn) return;

    if (resetDialogColumn === 1) {
      rejectRouteWork();
      setTravellingTo(null);
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
    }

    if (resetDialogColumn === 2) {
      rejectVisaOfferWork();
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
    }

    setActiveColumn(resetDialogColumn);
    setResetDialogColumn(null);
  };

  const handlePrevious = () => {
    if (columnNumber <= 1) return;

    if (columnNumber === 3) {
      rejectDocumentWork();
      setVisaOffer(null);
      setDocuments(null);
      setUploadedDocuments([]);
    }

    if (columnNumber === 2) {
      rejectRouteWork();
      setTravellingTo(null);
      setVisaOffers([]);
      setCommonNotice({ htmlContent: "", isOpen: false, title: "" });
      setVisaNotice(null);
      setIsVisaNoticeHandled(false);
    }

    setActiveColumn(columnNumber - 1);
  };

  const handleNext = () => {
    if (columnNumber === 1) {
      if (commonNotice.isOpen) return;

      if (shouldOpenVisaNotice && !isVisaNoticeHandled) {
        setVisaNotice(visaNoticeContent.obj);
        return;
      }
    }

    setActiveColumn(Math.min(3, columnNumber + 1));
  };

  const closeCommonNotice = () => {
    setCommonNotice({ htmlContent: "", isOpen: false, title: "" });
    if (travellingTo && !isMobile) {
      setActiveColumn(2);
    }
  };

  const proceedFromVisaNotice = () => {
    setVisaNotice(null);
    setIsVisaNoticeHandled(true);
    setActiveColumn(2);
  };

  const cancelVisaNotice = () => {
    rejectRouteWork();
    setVisaNotice(null);
    setIsVisaNoticeHandled(true);
    setTravellingTo(null);
    setVisaOffers([]);
    setVisaOffer(null);
    setDocuments(null);
    setUploadedDocuments([]);
    setActiveColumn(1);
  };

  const acknowledgePriceChange = () => {
    setClientCookie("price_change_ack", "true");
    setIsPriceAlertOpen(false);

    runPriceAcknowledge("acknowledge", async ({ runAction }) => {
      await runAction(() =>
        actionsRef.current.acknowledgePriceChange({ module: bootstrap.module }),
      );
    });
  };

  const applicationColumn = (
    <div className="flex h-auto flex-col">
      <div className="mt-3 flex flex-1 flex-col space-y-4">
        <FieldShell label="Nationality">
          <CountryCombobox
            emptyMessage="No nationalities available."
            items={nationalities}
            onChange={handleNationalityChange}
            placeholder="Select your nationality"
            value={nationality}
          />
        </FieldShell>

        <FieldShell label="Travelling To">
          <CountryCombobox
            disabled={!nationality}
            emptyMessage="No destinations available."
            isLoading={travellingToPending}
            items={travellingToOptions}
            onChange={handleTravellingToChange}
            placeholder="Select your destination"
            value={travellingTo}
          />
        </FieldShell>

        {travellingTo?.cor_required ? (
          <FieldShell label="Country of Residence">
            <CountryCombobox
              emptyMessage="No countries available."
              items={nationalities}
              onChange={handleCountryOfOriginChange}
              placeholder="Select your country"
              value={countryOfOrigin}
            />
          </FieldShell>
        ) : null}

        <FieldShell label="Travelling Dates">
          <DateRangePicker
            fromDate={getDefaultDateRange().from}
            onSelect={setDateRange}
            selectedDates={dateRange}
            toDate={getDefaultDateRange().to}
          />
        </FieldShell>
      </div>
    </div>
  );

  const visaTypeColumn = (
    <div className="m-0 h-full w-full overflow-x-hidden">
      <MaxWidthContainer className="h-full w-full">
        <div className="sticky top-0 z-20 flex w-full items-center justify-end border-b bg-white px-3 py-2">
          <Select
            value={currency}
            onValueChange={(nextCurrency) => {
              if (!nextCurrency) return;

              if (visaOffer) {
                rejectVisaOfferWork();
                setVisaOffer(null);
                setDocuments(null);
                setUploadedDocuments([]);
                setActiveColumn(2);
              }

              setClientCookie("selected_currency", nextCurrency);
              setCurrency(nextCurrency);
            }}
          >
            <SelectTrigger className="h-9 min-w-36 bg-white">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((item) => (
                <SelectItem key={item.currency} value={item.currency}>
                  {item.currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative mt-3 flex w-full flex-col gap-2 px-2">
          {!canMoveToVisaType ? (
            <p className="text-muted-foreground text-sm">
              Select application details to view visa offers.
            </p>
          ) : offersPending ? (
            <>
              <Skeleton className="my-3 h-[190px] w-full rounded-sm" />
              <Skeleton className="my-3 h-[190px] w-full rounded-sm" />
            </>
          ) : visaOffers.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No visa offers available
            </p>
          ) : (
            visaOffers.map((offer, index) => (
              <VisaOfferCard
                index={index}
                key={offer._id ?? `${offer.visa_details?.visa_id}-${index}`}
                offer={offer}
                onDetails={setOfferDetails}
                onSelect={(selectedOffer) => {
                  rejectDocumentWork();
                  setVisaOffer(selectedOffer);
                  if (!isMobile) {
                    setActiveColumn(3);
                  }
                }}
                selected={offer._id === visaOffer?._id}
              />
            ))
          )}
        </div>
      </MaxWidthContainer>
    </div>
  );

  const uploadColumn = visaOffer ? (
    <div className="flex flex-col gap-4">
      {bootstrap.module === "evm" ? (
        <RaffApplicationPanel
          applicants={raffApplicants}
          isPending={raffPending}
          onAdd={handleRaffSearch}
          searchText={raffSearchText}
          setSearchText={setRaffSearchText}
        />
      ) : null}
      <DocumentsPanel
        documents={documents}
        documentsLoading={documentsPending}
        enableCropEditor={isMobile}
        onUpload={handleUpload}
        removeDocument={(index) =>
          setUploadedDocuments((previous) =>
            previous.filter((_, documentIndex) => documentIndex !== index),
          )
        }
        uploadedDocuments={uploadedDocuments}
        uploadPending={uploadPending}
      />
    </div>
  ) : (
    <MaxWidthContainer className="text-muted-foreground text-sm">
      Select a visa offer before uploading documents.
    </MaxWidthContainer>
  );

  return (
    <div className="bg-secondary h-screen overflow-hidden">
      <div className="flex h-full flex-col gap-2 p-3 pb-0">
        {message ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Action needed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="hidden h-[calc(100vh-4.75rem)] flex-1 gap-5 overflow-hidden md:flex">
          <VisaColumnCard
            columnNumber={columnNumber}
            direction={columnDirection}
            number={1}
            onJumpBack={setResetDialogColumn}
            title="Visa Application"
          >
            {applicationColumn}
          </VisaColumnCard>
          {columnNumber >= 2 ? (
            <VisaColumnCard
              columnNumber={columnNumber}
              direction={columnDirection}
              number={2}
              onJumpBack={setResetDialogColumn}
              title="Visa Type"
            >
              {visaTypeColumn}
            </VisaColumnCard>
          ) : null}
          {columnNumber >= 3 ? (
            <VisaColumnCard
              bodyClassName="p-0 md:p-0"
              columnNumber={columnNumber}
              direction={columnDirection}
              number={3}
              onJumpBack={setResetDialogColumn}
              title="Upload Documents"
            >
              {uploadColumn}
            </VisaColumnCard>
          ) : null}
        </div>

        <div className="h-[calc(100vh-4.75rem)] flex-1 overflow-hidden md:hidden">
          {columnNumber === 1 ? (
            <VisaColumnCard
              columnNumber={columnNumber}
              direction={columnDirection}
              fullWidth
              number={1}
              onJumpBack={setResetDialogColumn}
              title="Visa Application"
            >
              {applicationColumn}
            </VisaColumnCard>
          ) : null}
          {columnNumber === 2 ? (
            <VisaColumnCard
              bodyClassName="p-0"
              columnNumber={columnNumber}
              direction={columnDirection}
              fullWidth
              number={2}
              onJumpBack={setResetDialogColumn}
              title="Visa Type"
            >
              {visaTypeColumn}
            </VisaColumnCard>
          ) : null}
          {columnNumber === 3 ? (
            <VisaColumnCard
              bodyClassName="p-0"
              columnNumber={columnNumber}
              direction={columnDirection}
              fullWidth
              number={3}
              onJumpBack={setResetDialogColumn}
              title="Upload Documents"
            >
              {uploadColumn}
            </VisaColumnCard>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-t-xl border bg-white p-3 shadow-sm md:justify-end">
          <div className="md:hidden">
            {columnNumber > 1 ? (
              <Button
                disabled={uploadPending || submitPending}
                onClick={handlePrevious}
                type="button"
                variant="outline"
              >
                Previous
              </Button>
            ) : null}
          </div>
          {columnNumber < 3 ? (
            <Button
              disabled={
                (columnNumber === 1 && !canMoveToVisaType) ||
                (columnNumber === 2 && !visaOffer)
              }
              onClick={handleNext}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button
              disabled={!canSubmit || submitPending}
              onClick={handleSubmit}
              type="button"
            >
              {submitPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Proceed
            </Button>
          )}
        </div>
      </div>

      <OfferDetailsDialog
        offer={offerDetails}
        onOpenChange={(open) => {
          if (!open) setOfferDetails(null);
        }}
        open={Boolean(offerDetails)}
      />

      <DestinationNoticeDialog
        notice={commonNotice}
        onClose={closeCommonNotice}
      />

      <VisaNoticeDialog
        data={activeVisaNotice}
        onBack={cancelVisaNotice}
        onClose={() => setVisaNotice(null)}
        onProceed={proceedFromVisaNotice}
        open={Boolean(activeVisaNotice)}
      />

      <PriceChangeAlertDialog
        onAcknowledge={acknowledgePriceChange}
        open={isPriceAlertOpen}
      />

      <AlertDialog
        onOpenChange={setInvalidDocumentDialogOpen}
        open={invalidDocumentDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Caution</AlertDialogTitle>
            <AlertDialogDescription>
              Some uploaded documents need review. Re-upload clear copies or
              proceed anyway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
            <AlertDialogAction onClick={submitApplication}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setResetDialogColumn(null);
        }}
        open={Boolean(resetDialogColumn)}
      >
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
            <AlertDialogAction onClick={confirmColumnReset}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
