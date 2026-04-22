import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { getCookie, setClientCookie } from "@workspace/common-ui/lib/utils";
import { orpc } from "@workspace/orpc/lib/orpc";

interface CurrencySelectProps {
  currency: string;
  // flag:string;
  onSelect?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const CurrencySelect = ({
  currency,
  // flag,
  onSelect,
  className,
  disabled,
}: CurrencySelectProps) => {
  const { data, isPending } = useQuery(
    orpc.visa.getSupportedCurrencies.queryOptions(),
  );

  const currencies = data?.data?.currencies || [];

  // Keep provider currency, cookie, and available currencies in sync.
  // useEffect(() => {
  //   if (!currencies.length) return;

  //   const cookieCurrency = getCookie("selected_currency");
  //   const hasCookieCurrency = !!cookieCurrency &&
  //     currencies.some((x) => x.currency === cookieCurrency);
  //   const hasContextCurrency =
  //     !!currency && currencies.some((x) => x.currency === currency);

  //   let nextCurrency = hasCookieCurrency
  //     ? cookieCurrency!
  //     : hasContextCurrency
  //       ? currency
  //       : currencies.at(0)?.currency || "USD";


  //   const host = getCookie("host")

  //   if (host === "arcube") {
  //     nextCurrency = "OMR"
  //   }

  //   if (currency !== nextCurrency) {
  //     onSelect?.(nextCurrency);
  //   }

  //   if (getCookie("selected_currency") !== nextCurrency) {
  //     setClientCookie("selected_currency", nextCurrency);
  //   }
  // }, [currencies, currency, onSelect]);



  // useEffect(() => {
  //   if (!currencies.length) return;

  //   const cookieCurrency = getCookie("selected_currency");
  //   const host = getCookie("host");

  //   const hasCookieCurrency =
  //     !!cookieCurrency && currencies.some((x) => x.currency === cookieCurrency);

  //   const hasContextCurrency =
  //     !!currency && currencies.some((x) => x.currency === currency);

  //   let nextCurrency;

  //   if (hasCookieCurrency) {
  //     nextCurrency = cookieCurrency!;
  //   } else if (hasContextCurrency) {
  //     nextCurrency = currency!;
  //   } else if (host === "arcube") {
  //     nextCurrency = "OMR";
  //   } else {
  //     nextCurrency = currencies.at(0)?.currency || "USD";
  //   }

  //   if (currency !== nextCurrency) {
  //     onSelect?.(nextCurrency);
  //   }

  //   if (getCookie("selected_currency") !== nextCurrency) {
  //     setClientCookie("selected_currency", nextCurrency);
  //   }
  // }, [currencies, currency, onSelect]);



  useEffect(() => {
    if (!currencies.length) return;

    const cookieCurrency = getCookie("selected_currency");
    const host = getCookie("host");

    const hasCookieCurrency =
      !!cookieCurrency && currencies.some((x) => x.currency === cookieCurrency);

    const hasContextCurrency =
      !!currency && currencies.some((x) => x.currency === currency);

    let nextCurrency: string;

    // 1. Cookie has highest priority
    if (hasCookieCurrency) {
      nextCurrency = cookieCurrency!;
    }
    // 2. First load rule for arcube
    else if (host === "arcube") {
      nextCurrency = "OMR";
    }
    // 3. Context currency
    else if (hasContextCurrency) {
      nextCurrency = currency!;
    }
    // 4. Default fallback
    else {
      nextCurrency = currencies.at(0)?.currency || "USD";
    }

    if (currency !== nextCurrency) {
      onSelect?.(nextCurrency);
    }

    if (getCookie("selected_currency") !== nextCurrency) {
      setClientCookie("selected_currency", nextCurrency);
    }

  }, [currencies, currency, onSelect]);

  if (isPending) {
    return <CurrencySelectSkeleton className={className} />;
  }

  return (
    <Select
      value={currency}
      disabled={disabled}
      onValueChange={(val) => {
        setClientCookie("selected_currency", val);
        onSelect?.(val);
      }}
    >
      <SelectTrigger className={cn("min-w-[180px]", className)}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((x) => (
          <SelectItem key={x.currency} value={x.currency}>
            {x.currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelect;

const CurrencySelectSkeleton = ({ className }: { className?: string }) => {
  return <Skeleton className={cn("h-[30px] min-w-[180px]", className)} />;
};
