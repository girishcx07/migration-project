"use client";
import { useAppRouter } from "../platform/navigation";
import { useRouteContext, ROUTES } from "../context/route-context";
import { setNavigationFlag } from "./use-persisted-state";

const FROM_REVIEW_PAGE_FLAG = "from_review_page";

export function useAppNavigation() {
  const router = useAppRouter();
  const { getRoute, buildPath, basePath, workflow } = useRouteContext();

  return {
    // Predefined route navigation
    goToNewVisa: () => router.push(getRoute("NEW_VISA")),
    goToReview: () => router.push(getRoute("REVIEW")),
    goToPaymentSummary: () => router.push(getRoute("PAYMENT_SUMMARY")),
    /**
     * Navigate to payment summary with a flag to reset contact details.
     * Use this when coming from the review page to require re-verification.
     */
    goToPaymentSummaryWithReset: () => {
      setNavigationFlag(FROM_REVIEW_PAGE_FLAG);
      router.push(getRoute("PAYMENT_SUMMARY"));
    },
    goToPaymentCheckout: () => router.push(getRoute("PAYMENT_CHECKOUT")),
    goToPaymentSuccess: () => router.push(getRoute("PAYMENT_SUCCESS")),
    goToTrackApplications: () => router.push(getRoute("TRACK_APPLICATIONS")),
    goToApplicationDetails: () =>
      router.push(getRoute("TRACK_APPLICATION_DETAILS")),
    goToSearchApplications: (params?: URLSearchParams) => {
      const path = getRoute("SEARCH_APPLICATIONS");
      router.push(params ? `${path}?${params.toString()}` : path);
    },
    goToNotFound: () => router.push(getRoute("NOT_FOUND")),
    goToUnauthorized: () => router.push(getRoute("UNAUTHORIZED")),

    // Custom path navigation (relative to base)
    navigateTo: (relativePath: string) => router.push(buildPath(relativePath)),

    // Get route path without navigation
    getRoute,
    buildPath,
    basePath,
    workflow,

    // Original router for edge cases
    router,
  };
}
