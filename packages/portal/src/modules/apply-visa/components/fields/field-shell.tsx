import { Label } from "@repo/ui/components/label";

import { MaxWidthContainer } from "../layout/max-width-container";

export function FieldShell({
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
