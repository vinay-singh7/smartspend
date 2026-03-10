const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function formatCurrency(amount: number, currency = "USD") {
  const locale = CURRENCY_LOCALE[currency] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
