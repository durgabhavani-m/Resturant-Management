export const formatCurrency = (
  amount: number,
  currencyCode = "INR"
) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);

export const getCurrencySymbol = (currencyCode = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currencyCode;
