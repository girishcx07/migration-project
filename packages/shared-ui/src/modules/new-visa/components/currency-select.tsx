"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@acme/api/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@acme/ui/components/select";
import { Skeleton } from "@acme/ui/components/skeleton";
import { getCookie, setClientCookie } from "@acme/shared-ui/lib/cookies";
import { cn } from "@acme/ui/lib/utils";

interface CurrencySelectProps {
  currency: string;
  onSelect?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function CurrencySelect({
  currency,
  onSelect,
  className,
  disabled,
}: CurrencySelectProps) {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(
    trpc.newVisa.getSupportedCurrencies.queryOptions(),
  );

  const currencies = data?.currencies ?? [];

  useEffect(() => {
    if (!currencies.length) {
      return;
    }

    const cookieCurrency = getCookie("selected_currency") ?? undefined;
    const host = getCookie("host");
    const hasCookieCurrency =
      !!cookieCurrency && currencies.some((item) => item.currency === cookieCurrency);
    const hasContextCurrency =
      !!currency && currencies.some((item) => item.currency === currency);

    let nextCurrency: string;
    if (hasCookieCurrency) {
      nextCurrency = cookieCurrency!;
    } else if (host === "arcube") {
      nextCurrency = "OMR";
    } else if (hasContextCurrency) {
      nextCurrency = currency;
    } else {
      nextCurrency = currencies[0]?.currency ?? "USD";
    }

    if (currency !== nextCurrency) {
      onSelect?.(nextCurrency);
    }

    const currentCookieCurrency = getCookie("selected_currency") ?? undefined;

    if (currentCookieCurrency !== nextCurrency) {
      setClientCookie("selected_currency", nextCurrency);
    }
  }, [currencies, currency, onSelect]);

  if (isPending) {
    return <Skeleton className={cn("h-[30px] min-w-[180px]", className)} />;
  }

  return (
    <Select
      value={currency}
      disabled={disabled}
      onValueChange={(value) => {
        if (!value) {
          return;
        }

        setClientCookie("selected_currency", value);
        onSelect?.(value);
      }}
    >
      <SelectTrigger className={cn("min-w-[180px]", className)}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((item) => (
          <SelectItem key={item.currency} value={item.currency}>
            {item.currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
