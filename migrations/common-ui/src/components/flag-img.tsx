import { cn } from "@workspace/ui/lib/utils";
import { AppImage as Image, AppImageProps } from "../platform/image";

type FlagProps = {
  className?: string;
} & AppImageProps;

export const Flag = ({ className, ...props }: FlagProps) => {
  return (
    <Image
      height={14}
      width={24}
      className={cn(
        "h-3.5 w-6 overflow-hidden rounded-[2px] border border-gray-300 bg-white object-contain shadow-sm",
        className,
      )}
      {...props}
    />
  );
};
