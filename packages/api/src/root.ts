// import { dataSimRouter } from "./router/data-sim";
import { enterpriseRouter } from "./router/enterprise";
import { evmRouter } from "./router/evm";
import { newVisaRouter } from "./router/new-visa";
import { qrVisaRouter } from "./router/qr-visa";
// import { reviewRouter } from "./router/review";
// import { trackApplicationRouter } from "./router/track-application";
// import { visaPaymentSummaryRouter } from "./router/visa-payment-summary";
import { createTRPCRouter, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
  enterprise: enterpriseRouter,
  newVisa: newVisaRouter,
  qrVisa: qrVisaRouter,
  evm: evmRouter,
  // dataSim: dataSimRouter,
  // reviewVisa: reviewRouter,
  // trackApplication: trackApplicationRouter,
  // visaPaymentSummary: visaPaymentSummaryRouter,
  health: publicProcedure.query(() => {
    return {
      ok: true,
      name: "api-template",
    };
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
