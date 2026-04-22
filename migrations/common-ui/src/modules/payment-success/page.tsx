"use client";

import Successfull from "@workspace/common-ui/assets/svg/successful.svg";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Confetti,
  ConfettiRef,
} from "@workspace/ui/components/magicui/confetti";
import { useEffect, useRef } from "react";
import { useApplicationDetails } from "@workspace/common-ui/hooks/global-queries";
import { CopyIcon, Check, SquareCheckBig, Copy } from "lucide-react";
import useCopyToClipboard from "@workspace/common-ui/hooks/use-copy-to-clipboard";

import { getCookie } from "@workspace/common-ui/lib/utils";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import { AppLink as Link } from "../../platform/navigation";

const PaymentSuccess = () => {
  const confettiRef = useRef<ConfettiRef>(null);
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const { getRoute, workflow } = useAppNavigation();

  const host = getCookie("host");
  const successIconSrc =
    typeof Successfull === "string" ? Successfull : Successfull.src;

  const { data } = useApplicationDetails();
  const application = data?.data?.application;

  console.log("application", application);

  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.fire({
        particleCount: 50,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, []);

  return (
    <div className="bg-secondary flex h-screen items-center justify-center p-4">
      {/* Confetti should stay in background but not block interactions */}

      {/* Main Content Card */}
      <Card className="relative z-10 mx-auto h-full w-full rounded-none bg-white shadow-lg sm:rounded-xl">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Confetti ref={confettiRef} className="size-full" />
        </div>
        <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-y-4 p-8 text-center">
          <img
            alt="success icon"
            className="mx-auto h-16 w-16"
            src={successIconSrc}
            width={64}
            height={64}
          />

          <h1 className="text-2xl font-bold text-neutral-400 sm:text-3xl">
            Thank You
          </h1>

          <div className="flex flex-wrap items-center">
            <span className="font-bold text-lime-500">
              {" "}
              Your Application is successful
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="flex items-center text-xs font-bold text-black md:text-sm">
                Visa Reference Number: &nbsp;{" "}
              </span>
              <span className="text-md font-bold text-black">
                {application?.application_reference_code}
              </span>
            </div>

            <button
              onClick={() =>
                copyToClipboard(application?.application_reference_code || "-")
              }
              className="cursor-pointer text-gray-500 transition-colors hover:text-blue-600"
              title="Copy Reference Number"
            >
              {isCopied ? (
                <SquareCheckBig className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          <h6 className="rounded-sm px-2 text-center text-base font-semibold text-green-500 sm:text-lg">
            Your payment has been processed successfully and visa application
            has been submitted!
          </h6>

          {application?.is_visaero_insurance_bundled && (
            <h6 className="mt-2 text-center text-sm font-medium text-slate-600 sm:text-base">
              Your complimentary insurance request is in process and will be
              issued soon.
            </h6>
          )}

          {host !== "resbird" && (
            <Button
              className="bg-primary hover:bg-primary/90 mt-6 self-center"
              asChild
            >
              <Link
                href={
                  workflow === "qr-visa"
                    ? getRoute("TRACK_SINGLE_APPLICATION")
                    : getRoute("TRACK_APPLICATIONS")
                }
              >
                {/* Track Applications */}

                {workflow === "qr-visa"
                  ? "Track Application"
                  : "Track Applications"}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
