import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

function ApplyVisaColumnSkeleton({
  children,
  number,
  title,
}: Readonly<{
  children: ReactNode;
  number: number;
  title: string;
}>) {
  return (
    <Card className="flex min-w-0 flex-col gap-0 overflow-hidden rounded py-0 shadow-none md:h-full">
      <CardHeader className="justify-center bg-gray-100 p-2 md:py-3">
        <div className="flex items-center gap-3 md:justify-center">
          <div className="flex size-6 items-center justify-center rounded-full bg-black text-sm text-white md:size-8 md:text-lg">
            {number}
          </div>
          <span className="text-lg font-semibold">{title}</span>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-4 overflow-hidden p-4">
        {children}
      </CardContent>
    </Card>
  );
}

export function ApplyVisaSkeleton() {
  return (
    <div className="bg-secondary h-screen overflow-hidden">
      <div className="flex h-full flex-col gap-2 p-3 pb-0">
        <div className="hidden h-[calc(100vh-4.75rem)] min-h-0 flex-1 grid-cols-3 gap-5 overflow-hidden md:grid">
          <ApplyVisaColumnSkeleton number={1} title="Visa Application">
            <ApplicationFieldsSkeleton />
          </ApplyVisaColumnSkeleton>
          <ApplyVisaColumnSkeleton number={2} title="Visa Type">
            <VisaOffersSkeleton />
          </ApplyVisaColumnSkeleton>
          <ApplyVisaColumnSkeleton number={3} title="Upload Documents">
            <UploadDocumentsSkeleton />
          </ApplyVisaColumnSkeleton>
        </div>
        <div className="grid h-[calc(100vh-4.75rem)] flex-1 gap-3 overflow-y-auto md:hidden">
          <ApplyVisaColumnSkeleton number={1} title="Visa Application">
            <ApplicationFieldsSkeleton />
          </ApplyVisaColumnSkeleton>
          <ApplyVisaColumnSkeleton number={2} title="Visa Type">
            <VisaOffersSkeleton />
          </ApplyVisaColumnSkeleton>
          <ApplyVisaColumnSkeleton number={3} title="Upload Documents">
            <UploadDocumentsSkeleton />
          </ApplyVisaColumnSkeleton>
        </div>
        <div className="flex items-center justify-between rounded-t-xl border bg-white p-3 shadow-sm md:justify-end">
          <Skeleton className="h-9 w-24 md:hidden" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

function ApplicationFieldsSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-9 w-full" />
    </>
  );
}

function VisaOffersSkeleton() {
  return (
    <>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-[190px] w-full rounded-sm" />
      <Skeleton className="h-[190px] w-full rounded-sm" />
    </>
  );
}

function UploadDocumentsSkeleton() {
  return (
    <>
      <div className="space-y-3 rounded border bg-white p-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="h-4 w-52 max-w-full" />
        <Skeleton className="h-4 w-60 max-w-full" />
      </div>
      <div className="space-y-3 rounded border border-dashed bg-white p-4 text-center">
        <Skeleton className="mx-auto size-9 rounded-full" />
        <Skeleton className="mx-auto h-4 w-40" />
        <Skeleton className="mx-auto h-3 w-64 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-sm" />
    </>
  );
}
