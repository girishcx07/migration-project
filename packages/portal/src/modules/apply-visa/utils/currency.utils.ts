import { getClientCookie } from "./cookie.utils";

export function resolveInitialCurrency(
  currencies: { currency: string }[],
  evmCurrency?: string,
) {
  const selectedCurrency = getClientCookie("selected_currency");
  const host = getClientCookie("host");
  const availableCurrencies = new Set(currencies.map((item) => item.currency));

  if (selectedCurrency && availableCurrencies.has(selectedCurrency)) {
    return selectedCurrency;
  }

  if (host === "arcube" && availableCurrencies.has("OMR")) {
    return "OMR";
  }

  if (evmCurrency && availableCurrencies.has(evmCurrency)) {
    return evmCurrency;
  }

  return currencies[0]?.currency ?? "USD";
}
