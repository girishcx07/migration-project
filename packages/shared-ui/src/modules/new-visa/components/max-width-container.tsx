import { cn } from "@repo/ui/lib/utils";

interface MaxWidthContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MaxWidthContainer: React.FC<MaxWidthContainerProps> = ({
  children,
  className,
}) => {
  return <div className={cn("max-w-sm mx-auto", className)}>{children}</div>;
};
