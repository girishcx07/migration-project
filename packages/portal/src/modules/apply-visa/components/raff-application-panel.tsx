import { LoaderCircle } from "lucide-react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

export function RaffApplicationPanel({
  applicants,
  isPending,
  onAdd,
  searchText,
  setSearchText,
}: Readonly<{
  applicants: string[];
  isPending: boolean;
  onAdd: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
}>) {
  return (
    <div className="bg-card mb-4 space-y-2 rounded-lg border p-4 md:border-0 md:bg-transparent md:p-0">
      <Label>RAFF Application</Label>
      <div className="flex gap-2">
        <Input
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search RAFF reference"
          value={searchText}
        />
        <Button
          disabled={isPending}
          onClick={onAdd}
          type="button"
          variant="outline"
        >
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Add
        </Button>
      </div>
      {applicants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {applicants.map((applicant) => (
            <Badge key={applicant} variant="secondary">
              {applicant}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
