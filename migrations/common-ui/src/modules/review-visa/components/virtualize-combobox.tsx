"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useDeferredValue } from "react";
import {
    Combobox,
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxTrigger,
} from "@workspace/ui/components/combobox";

interface Option {
    label: string;
    value: string;
}

interface VirtualizedComboboxProps {
    options: Option[];
    label?: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

export function VirtualizedCombobox({ options, label, name, value, onChange, disabled, className, placeholder = "Select an option" }: VirtualizedComboboxProps) {
    const [content, setContent] =
        React.useState<React.ComponentRef<"div"> | null>(null);
    const [inputValue, setInputValue] = React.useState(value);
    const deferredInputValue = useDeferredValue(inputValue);

    const filteredTricks = React.useMemo(() => {
        if (!deferredInputValue) return options;
        const normalized = deferredInputValue.toLowerCase();
        return options.filter((item) =>
            item.label.toLowerCase().includes(normalized),
        );
    }, [deferredInputValue]);

    const virtualizer = useVirtualizer({
        count: filteredTricks.length,
        getScrollElement: () => content,
        estimateSize: () => 32,
        overscan: 20,
    });

    const onInputValueChange = React.useCallback(
        (value: string) => {
            setInputValue(value);
            if (content) {
                content.scrollTop = 0; // Reset scroll position
                virtualizer.measure();
            }
        },
        [content, virtualizer],
    );

    // Re-measure virtualizer when filteredItems changes
    React.useEffect(() => {
        if (content) {
            virtualizer.measure();
        }
    }, [content, virtualizer]);

    return (
        <Combobox
            value={value}
            onValueChange={onChange}
            inputValue={inputValue}
            onInputValueChange={onInputValueChange}
            manualFiltering
            name={name}
            disabled={disabled}
            className={className}
        >
            {label && <ComboboxLabel>{label}</ComboboxLabel>}
            <ComboboxAnchor>
                <ComboboxInput placeholder={placeholder} />
                <ComboboxTrigger>
                    <ChevronDown className="h-4 w-4" />
                </ComboboxTrigger>
            </ComboboxAnchor>
            <ComboboxContent
                ref={(node) => setContent(node)}
                className="relative max-h-[300px] overflow-y-auto overflow-x-hidden"
            >
                <ComboboxEmpty>No tricks found.</ComboboxEmpty>
                <div
                    className="relative w-full"
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                        const trick = filteredTricks[virtualItem.index];
                        if (!trick) return null;

                        return (
                            <ComboboxItem
                                key={virtualItem.key}
                                value={trick.value}
                                className="absolute top-0 left-0 w-full"
                                style={{
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                                outset
                            >
                                {trick.label}
                            </ComboboxItem>
                        );
                    })}
                </div>
            </ComboboxContent>
        </Combobox>
    );
}