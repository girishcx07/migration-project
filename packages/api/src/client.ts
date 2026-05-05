import { createApiClient, createBrowserApiClient } from "./fetcher";
import { createBaseApiRoutes } from "./routes/base-api";
import { createDataSimRoutes } from "./routes/data-sim";
import { createEvmRoutes } from "./routes/evm";
import { createNewVisaRoutes } from "./routes/new-visa";
import { createQrVisaRoutes } from "./routes/qr-visa";
import { createReviewVisaRoutes } from "./routes/review-visa";
import { createTrackVisaApplicationRoutes } from "./routes/track-visa-application";
import { createVisaPaymentSummaryRoutes } from "./routes/visa-payment-summary";

export function createVisaeroApi(
  options?: Parameters<typeof createApiClient>[0],
) {
  const http = createApiClient(options);
  const newVisa = createNewVisaRoutes(http);
  const reviewVisa = createReviewVisaRoutes(http);
  const trackVisaApplication = createTrackVisaApplicationRoutes(http);
  const visaPaymentSummary = createVisaPaymentSummaryRoutes(http);
  const baseApi = createBaseApiRoutes(http);
  const dataSim = createDataSimRoutes(http);
  const evm = createEvmRoutes(http);
  const qrVisa = createQrVisaRoutes(http);

  return {
    http,
    baseApi,
    dataSim,
    evm,
    newVisa,
    qrVisa,
    reviewVisa,
    trackVisaApplication,
    visaPaymentSummary,
  };
}

export type VisaeroApi = ReturnType<typeof createVisaeroApi>;

export function createVisaeroBrowserApi(
  options: Parameters<typeof createBrowserApiClient>[0],
) {
  const http = createBrowserApiClient(options);
  const newVisa = createNewVisaRoutes(http);
  const reviewVisa = createReviewVisaRoutes(http);
  const trackVisaApplication = createTrackVisaApplicationRoutes(http);
  const visaPaymentSummary = createVisaPaymentSummaryRoutes(http);
  const baseApi = createBaseApiRoutes(http);
  const dataSim = createDataSimRoutes(http);
  const evm = createEvmRoutes(http);
  const qrVisa = createQrVisaRoutes(http);

  return {
    http,
    baseApi,
    dataSim,
    evm,
    newVisa,
    qrVisa,
    reviewVisa,
    trackVisaApplication,
    visaPaymentSummary,
  };
}

export type VisaeroBrowserApi = ReturnType<typeof createVisaeroBrowserApi>;
