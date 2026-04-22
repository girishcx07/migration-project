"use client";

import bg_img from "@workspace/common-ui/assets/img/bg_img.png";
import { useEnterpriseGlobalData } from "@workspace/common-ui/hooks/global-queries";
import { Button } from "@workspace/ui/components/button";
import { useAppNavigation } from "@workspace/common-ui/hooks/use-app-navigation";
import { AppImage as Image } from "../../platform/image";

const Page = () => {
  const { data } = useEnterpriseGlobalData();
  const enterpriseData = data?.data;
  const coBrandLogo = enterpriseData?.brand_logo || "";

  const { goToNewVisa, goToTrackApplications } = useAppNavigation();

  const handleApplyVisa = () => {
    goToNewVisa();
  };

  const handleTrackApplication = () => {
    goToTrackApplications();
  };

  return (
    <div className="relative grid h-screen grid-rows-[auto_1fr_auto] overflow-hidden">
      {/* Background image */}
      <Image
        src={bg_img}
        alt="background image"
        fill
        priority
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 -z-10 bg-black opacity-50" />

      {/* Header */}
      <header className="bg-secondary p-2 shadow-md">
        {coBrandLogo && (
          <Image
            alt="Brand Logo"
            width={40}
            height={40}
            src={coBrandLogo}
            className="object-contain"
          />
        )}
      </header>

      {/* Main */}
      <main className="flex -translate-y-50 transform items-center justify-center md:translate-y-0 md:justify-end">
        <div className="md:-translate-x-30 md:translate-y-0">
          <h1 className="mb-6 text-center font-sans text-3xl leading-10 font-normal text-white">
            Save up to 90% time <br />
            Data is Private & Secure <br />
            Auto-form filling
          </h1>
          <Button className="bg-primary" onClick={handleApplyVisa}>
            Apply for e-Visa
          </Button>{" "}
          &nbsp;
          <Button variant="outline" onClick={handleTrackApplication}>
            Track Applications
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary p-2">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center md:gap-0">
          <div className="flex flex-row items-start gap-4">
            <a
              href="https://visaero.com/terms-of-use.html"
              className="text-xs text-black hover:underline"
            >
              Terms & Conditions
            </a>
            <a
              href="https://visaero.com/privacy-policy.html"
              className="text-xs text-black hover:underline"
            >
              Privacy Notice
            </a>
          </div>
          <div className="-mt-2 flex items-center gap-2 md:mt-0">
            {coBrandLogo && (
              <Image
                alt="Brand Logo"
                width={30}
                height={30}
                src={coBrandLogo}
                className="object-contain"
              />
            )}
            <p className="text-xs text-black">
              Copyright ©2025, Visaero Pte. Ltd. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
