import { cn } from "@repo/ui/lib/utils";

export function MaxWidthContainer({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={cn("mx-auto max-w-sm", className)}>{children}</div>;
}
