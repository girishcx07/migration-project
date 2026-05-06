import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";

const FORM_SKELETON_GROUPS = Array.from({ length: 4 });
const FORM_SKELETON_FIELDS = Array.from({ length: 5 });

export const VisaFormServerSkeleton = () => {
  return (
    <Card className="h-full overflow-hidden py-0">
      <CardHeader className="hidden bg-gray-100 py-2 md:block">
        <CardTitle>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="visa_card_body h-full px-0 md:pb-12">
        <ScrollArea className="h-full pb-6">
          {FORM_SKELETON_GROUPS.map((_, groupIndex) => (
            <div key={groupIndex} className="mb-3">
              <div className="px-2 py-2">
                <Skeleton className="mb-2 h-5 w-1/2" />
                <Skeleton className="mb-2 h-5 w-1/4" />
              </div>
              <Separator className="mx-2 w-[50%]" />
              <div className="grid grid-cols-3 gap-3 p-2 px-4">
                {FORM_SKELETON_FIELDS.map((__, fieldIndex) => (
                  <Skeleton key={fieldIndex} className="mb-2 h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
