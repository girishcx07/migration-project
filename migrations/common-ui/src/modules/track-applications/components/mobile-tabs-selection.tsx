
import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { TABS } from "@workspace/common-ui/constants/track-applications";

interface TabsSelectProps {
  tab: string;
  onSelect?: (value: string) => void;
  className?: string;
}

const TabsSelect = ({ tab, onSelect, className }: TabsSelectProps) => {
     return (
        <Select value={tab} onValueChange={onSelect} >
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {TABS?.map((tab, i) => (
              <SelectItem key={tab.name} value={tab.name}>
                {tab.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

}

export default TabsSelect;