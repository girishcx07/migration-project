import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";

export function VisaColumnCard({
  bodyClassName,
  children,
  columnNumber,
  direction,
  fullWidth,
  number,
  onJumpBack,
  title,
}: Readonly<{
  bodyClassName?: string;
  children: React.ReactNode;
  columnNumber: number;
  direction: "forward" | "backward";
  fullWidth?: boolean;
  number: number;
  onJumpBack: (number: number) => void;
  title: string;
}>) {
  const expanded = columnNumber === number;
  const columnWidth = `${100 / columnNumber}%`;

  return (
    <Card
      className={cn(
        "flex h-[45px] min-w-0 flex-col gap-0 overflow-hidden rounded-lg py-0 shadow-none transition-all duration-300 md:h-full",
        fullWidth && "w-full",
        direction === "forward"
          ? "md:animate-in md:fade-in md:slide-in-from-right-4"
          : "md:animate-in md:fade-in md:slide-in-from-left-4",
        expanded && "h-full md:h-full",
      )}
      style={
        fullWidth
          ? undefined
          : {
              flexBasis: columnWidth,
              maxWidth: columnWidth,
              width: columnWidth,
            }
      }
    >
      <CardHeader
        className="bg-muted/40 cursor-pointer justify-center border-b p-2 md:pointer-events-none md:py-3"
        onClick={() => {
          if (number < columnNumber) onJumpBack(number);
        }}
      >
        <CardTitle className="w-full md:flex md:justify-center">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-black text-sm text-white md:size-8 md:text-lg">
              {number}
            </div>
            <div className="flex-grow text-sm md:text-lg">{title}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "min-h-0 w-full flex-1 self-start overflow-y-auto pt-0 opacity-100 transition-all duration-300 ease-in-out md:max-h-none md:p-4",
          !expanded &&
            "max-h-0 flex-none p-0 opacity-0 md:max-h-none md:flex-1 md:opacity-100",
          bodyClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
