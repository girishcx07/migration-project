import type {
  ClearIndicatorProps,
  DropdownIndicatorProps,
  GroupBase,
  InputProps,
  MultiValueRemoveProps,
  OptionProps,
  PlaceholderProps,
  ValueContainerProps,
} from "react-select";
import { components } from "react-select";

import {
  CaretSortIcon,
  CheckIcon,
  Cross2Icon as CloseIcon,
} from "@radix-ui/react-icons";

import { Search } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

// import { VariableSizeList as List } from "react-window";
import { cn } from "@workspace/ui/lib/utils";
import { WithOptionFields } from "../modules/new-visa/types";
import { Flag } from "./flag-img";

export const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <CaretSortIcon className={"h-4 w-4 opacity-50"} />
    </components.DropdownIndicator>
  );
};
export const ClearIndicator = (props: ClearIndicatorProps) => {
  return (
    <components.ClearIndicator {...props}>
      <CloseIcon className={"h-3.5 w-3.5 opacity-50"} />
    </components.ClearIndicator>
  );
};
export const MultiValueRemove = (props: MultiValueRemoveProps) => {
  return (
    <components.MultiValueRemove {...props}>
      <CloseIcon className={"h-3 w-3 opacity-50"} />
    </components.MultiValueRemove>
  );
};

// export const Option = (props: OptionProps) => {
//   const { icon, label } = props!.data! as OptionPropsWith;
//   return (
//     <components.Option {...props}>
//       <div className="flex items-center justify-between overflow-x-hidden">
//         <div className="flex items-center gap-2">
//           {icon && (
//             <img
//               height={14}
//               width={24}
//               className="object-contain shadow-sm h-6 "
//               src={icon}
//               alt={label}
//             />
//           )}
//           {label}
//         </div>
//         {props.isSelected && <CheckIcon />}
//       </div>
//     </components.Option>
//   );
// };
export const SelectInput = (props: InputProps) => {
  return <components.Input {...props} className="w-auto" />;
};

export const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
  const selected = props.getValue()?.[0] as unknown as { icon: string };

  return (
    <components.ValueContainer {...props}>
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="shrink-0">
          {selected?.icon ? (
            <Flag src={selected.icon} alt="" />
          ) : (
            <Search className="h-5 w-4 text-gray-500 flex" />
          )}
        </div>
        <div className="flex min-w-0 truncate">{children}</div>
      </div>
    </components.ValueContainer>
  );
};

export const Placeholder = (
  props: PlaceholderProps<unknown, boolean, GroupBase<unknown>>,
) => {
  return <div className="text-sm text-gray-500 flex items-center justify-center">{props.children}</div>;
};

// Helper to calculate text height based on content and width
const calculateTextHeight = (text: string, width: number) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 36;

  context.font = "14px sans-serif"; // Match your actual font
  const words = text?.split(" ");
  let line = "";
  let lines = 1;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = context.measureText(testLine);
    if (metrics.width > width - 32) {
      // Account for padding
      line = word + " ";
      lines++;
    } else {
      line = testLine;
    }
  }

  return Math.max(1, lines) * 24 + 12; // 24px line height + 12px padding
};

// Memoized height calculation component
const HeightCalculator = memo(
  ({ option, width }: { option: any; width: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(36);

    useEffect(() => {
      if (ref.current) {
        const calculatedHeight = calculateTextHeight(option.label, width);
        setHeight(calculatedHeight);
      }
    }, [option.label, width]);

    return <div ref={ref} style={{ height }} />;
  },
);

HeightCalculator.displayName = "HeightCalculator";

// Custom MenuList component with variable size virtualization
// export const MenuList = ({ children, maxHeight, selectProps }: any) => {
//   const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
//   const listRef = useRef<List>(null);
//   const [menuWidth, setMenuWidth] = useState(0);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const options = selectProps.options || [];

//   // Get menu width for text wrapping calculations
//   useEffect(() => {
//     if (menuRef.current) {
//       const resizeObserver = new ResizeObserver((entries) => {
//         for (const entry of entries) {
//           setMenuWidth(entry.contentRect.width);
//         }
//       });

//       resizeObserver.observe(menuRef.current);
//       return () => resizeObserver.disconnect();
//     }
//   }, []);

//   // Update heights when options change
//   useEffect(() => {
//     const newHeights = new Map();
//     options.forEach((option: any, index: number) => {
//       const height = calculateTextHeight(option.label, menuWidth);
//       newHeights.set(index, height);
//     });
//     setItemHeights(newHeights);
//     if (listRef.current) {
//       listRef.current.resetAfterIndex(0);
//     }
//   }, [options, menuWidth]);

//   const getItemHeight = (index: number) => {
//     return itemHeights.get(index) || 36;
//   };

//   if (!children.length) return null;

//   const height = Math.min(maxHeight,
//     Array.from(itemHeights.values()).reduce((a, b) => a + b, 0));

//   return (
//     <div ref={menuRef}>
//       <List
//         ref={listRef}
//         height={height}
//         itemCount={children.length}
//         itemSize={getItemHeight}
//         width="100%"
//         className="scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
//       >
//         {({ index, style }: { index: number; style: React.CSSProperties }) => (
//           <div
//             style={{
//               ...style,
//               position: 'absolute',
//               top: style.top,
//               left: 0,
//               width: '100%',
//               height: getItemHeight(index)
//             }}
//             className=""
//           >
//             {children[index]}
//           </div>
//         )}
//       </List>
//     </div>
//   );
// };

// Custom Option component with proper height handling
export const Option = ({ children, ...props }: any) => {
  return (
    <components.Option {...props}>
      <div
        className={cn(
          "px-2 text-sm break-words whitespace-pre-wrap flex item-center",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "active:bg-accent active:text-accent-foreground",
          "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
          // props.isSelected && "bg-accent text-accent-foreground",
          props.isFocused && "bg-accent/50",
        )}
      >
        {children}
      </div>
    </components.Option>
  );
};

interface RenderSelectDataProps {
  option: WithOptionFields<{ icon?: string; value: string }>;
}

export const RenderSelectData: React.FC<RenderSelectDataProps> = ({
  option,
}) => {

  return (
    <div className="flex items-center gap-2">
      {option?.icon && (
        <Flag src={option?.icon || ""} alt={option?.value || ""} />
      )}
      {option?.label}
    </div>
  );
};

export const OptionComponentWithIcon = ({
  data,
  ...props
}: OptionProps<any>) => (
  <components.Option data={data} {...props}>
    <RenderSelectData option={data} />
  </components.Option>
);
