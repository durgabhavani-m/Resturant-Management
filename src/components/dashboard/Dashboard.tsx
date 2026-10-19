import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChairIcon from "@mui/icons-material/Chair";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import StatCard from "./StatCard";
import RecentOrders from "./RecentOrders";
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { useTable } from "../../context/TableContext";
import { useBilling } from "../../context/BillingContext";
import { useRestaurant } from "../../context/ResturantContext";
import { formatCurrency } from "../../utils/formatCurrency";

type DateRange =
  | "today"
  | "yesterday"
  | "7"
  | "30"
  | "3months"
  | "6months"
  | "year"
  | "custom";

const STORAGE_KEY = "dashboardDateRange";
const START_KEY = "dashboardCustomStart";
const END_KEY = "dashboardCustomEnd";

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getRangeStart = (range: DateRange, today: Date) => {
  const start = startOfDay(today);

  switch (range) {
    case "today":
      return start;
    case "yesterday":
      return addDays(start, -1);
    case "7":
      return addDays(start, -6);
    case "30":
      return addDays(start, -29);
    case "3months": {
      const date = new Date(start);
      date.setMonth(date.getMonth() - 3);
      return addDays(date, 1);
    }
    case "6months": {
      const date = new Date(start);
      date.setMonth(date.getMonth() - 6);
      return addDays(date, 1);
    }
    case "year": {
      const date = new Date(start);
      date.setFullYear(date.getFullYear() - 1);
      return addDays(date, 1);
    }
    case "custom":
      return start;
  }
};

interface ComparisonChartProps {
  title: string;
  subtitle: string;
  currentLabel: string;
  previousLabel: string;
  currentValues: number[];
  previousValues: number[];
  dates: Date[];
  formatValue: (value: number) => string;
  color: string;
}

const ComparisonChart = ({
  title,
  subtitle,
  currentLabel,
  previousLabel,
  currentValues,
  previousValues,
  dates,
  formatValue,
  color,
}: ComparisonChartProps) => {
  const currentTotal = currentValues.reduce((sum, value) => sum + value, 0);
  const previousTotal = previousValues.reduce((sum, value) => sum + value, 0);
  const maxValue = Math.max(...currentValues, ...previousValues, 1);

  const labelEvery = Math.max(1, Math.ceil(dates.length / 10));

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography
        sx={{
        fontSize: { xs: "1.25rem", md: "1.5rem" },
        fontWeight: 600,
        lineHeight: 1.3,
        }}
        >
         {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: color,
                  borderRadius: 0.5,
                }}
              />
              {currentLabel}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: "grey.300",
                  borderRadius: 0.5,
                }}
              />
              {previousLabel}
            </Typography>
          </Box>

          <Typography variant="caption" fontWeight={600}>
            {formatValue(currentTotal)} vs {formatValue(previousTotal)}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
          }}
        >
          <Box sx={{ height: 190, overflowX: "auto", overflowY: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
                height: "100%",
                minWidth: dates.length > 14 ? dates.length * 25 : "100%",
              }}
            >
              {dates.map((date, index) => {
                const current = currentValues[index] ?? 0;
                const previous = previousValues[index] ?? 0;

                const currentHeight =
                  current === 0 ? 1 : Math.max((current / maxValue) * 100, 5);
                const previousHeight =
                  previous === 0 ? 1 : Math.max((previous / maxValue) * 100, 5);

                const showLabel =
                  index % labelEvery === 0 || index === dates.length - 1;

                return (
                  <Box
                    key={getDateKey(date)}
                    title={`${getDateKey(date)} | ${currentLabel}: ${formatValue(current)} | ${previousLabel}: ${formatValue(previous)}`}
                    sx={{
                      flex: 1,
                      minWidth: dates.length > 14 ? 18 : 0,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: "2px",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width: "45%",
                          height: `${currentHeight}%`,
                          bgcolor: color,
                          borderRadius: "3px 3px 0 0",
                        }}
                      />
                      <Box
                        sx={{
                          width: "45%",
                          height: `${previousHeight}%`,
                          bgcolor: "grey.300",
                          borderRadius: "3px 3px 0 0",
                        }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", minHeight: 16 }}
                    >
                      {showLabel
                        ? date.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { orders } = useOrder();
  const { tables } = useTable();
  const { bills } = useBilling();
  const { preferences } = useAppPreferences();
  const { settings } = useRestaurant();

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const allowed: DateRange[] = [
      "today",
      "yesterday",
      "7",
      "30",
      "3months",
      "6months",
      "year",
      "custom",
    ];

    if (saved && allowed.includes(saved as DateRange)) {
      return saved as DateRange;
    }
    if (preferences.defaultHistoryDateRange === "Today") return "today";
    if (preferences.defaultHistoryDateRange === "Last 30 Days") return "30";
    return "7";
  });

  const [customStart, setCustomStart] = useState(
    () => localStorage.getItem(START_KEY) ?? getDateKey(new Date())
  );
  const [customEnd, setCustomEnd] = useState(
    () => localStorage.getItem(END_KEY) ?? getDateKey(new Date())
  );

  const today = startOfDay(new Date());

  const changeRange = (value: DateRange) => {
    setDateRange(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const startDate = useMemo(() => {
    if (dateRange === "custom") {
      return startOfDay(new Date(`${customStart}T00:00:00`));
    }
    return getRangeStart(dateRange, today);
  }, [dateRange, customStart, today.getTime()]);

  const endDate = useMemo(() => {
    if (dateRange === "custom") {
      return startOfDay(new Date(`${customEnd}T00:00:00`));
    }
    return startOfDay(today);
  }, [dateRange, customEnd, today.getTime()]);

  const validRange =
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    startDate <= endDate;

  const dayCount = validRange
    ? Math.floor(
        (startOfDay(endDate).getTime() - startOfDay(startDate).getTime()) /
          86400000
      ) + 1
    : 0;

  const previousStart = addDays(startDate, -dayCount);
  const previousEnd = addDays(startDate, -1);

  const isInRange = (value: string, start: Date, end: Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const key = getDateKey(date);
    return key >= getDateKey(start) && key <= getDateKey(end);
  };

  const billedOrderIds = new Set(bills.map((bill) => bill.orderId));

  const salesRecords = [
    ...bills
      .filter((bill) => bill.paymentStatus === "Paid")
      .map((bill) => ({
        date: bill.paidAt ?? bill.createdAt,
        total: bill.total,
        currencyCode: bill.currencyCode ?? "INR",
      })),
    ...orders
      .filter(
        (order) =>
          order.paymentStatus === "Paid" && !billedOrderIds.has(order.id)
      )
      .map((order) => ({
        date: order.createdAt,
        total: order.total,
        currencyCode: order.currencyCode ?? "INR",
      })),
  ];

  const salesByDate = new Map<string, number>();

  salesRecords.forEach((record) => {
    const date = new Date(record.date);
    if (Number.isNaN(date.getTime())) return;

    const key = `${record.currencyCode}:${getDateKey(date)}`;
    salesByDate.set(key, (salesByDate.get(key) ?? 0) + record.total);
  });

  const sumSalesByCurrency = (start: Date, end: Date) => {
    const totals = new Map<string, number>();
    salesRecords.forEach((record) => {
      if (!isInRange(record.date, start, end)) return;
      totals.set(
        record.currencyCode,
        (totals.get(record.currencyCode) ?? 0) + record.total
      );
    });
    return totals;
  };

  const formatCurrencyTotals = (totals: Map<string, number>) =>
    totals.size
      ? [...totals.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([currencyCode, total]) =>
            formatCurrency(total, currencyCode)
          )
          .join(" · ")
      : formatCurrency(0, settings.billing.currency);

  const filteredOrders = validRange
    ? orders.filter((order) =>
        isInRange(order.createdAt, startDate, endDate)
      )
    : [];

  const selectedRevenueByCurrency = validRange
    ? sumSalesByCurrency(startDate, endDate)
    : new Map<string, number>();
  const previousRevenueByCurrency = validRange
    ? sumSalesByCurrency(previousStart, previousEnd)
    : new Map<string, number>();

  const currentDates = validRange
    ? Array.from({ length: dayCount }, (_, index) =>
        addDays(startDate, index)
      )
    : [];

  const previousDates = validRange
    ? Array.from({ length: dayCount }, (_, index) =>
        addDays(previousStart, index)
      )
    : [];

  const currentOrderCounts = currentDates.map((date) => {
    const key = getDateKey(date);
    return orders.filter((order) => getDateKey(new Date(order.createdAt)) === key)
      .length;
  });

  const previousOrderCounts = previousDates.map((date) => {
    const key = getDateKey(date);
    return orders.filter((order) => getDateKey(new Date(order.createdAt)) === key)
      .length;
  });

  const currentRevenueValues = currentDates.map(
    (date) =>
      salesByDate.get(
        `${settings.billing.currency}:${getDateKey(date)}`
      ) ?? 0
  );

  const previousRevenueValues = previousDates.map(
    (date) =>
      salesByDate.get(
        `${settings.billing.currency}:${getDateKey(date)}`
      ) ?? 0
  );

  const previousOrderTotal = validRange
    ? orders.filter((order) =>
        isInRange(order.createdAt, previousStart, previousEnd)
      ).length
    : 0;

  const availableTables = tables.filter(
    (table) => table.status === "Available"
  ).length;

  const rangeLabel: Record<DateRange, string> = {
    today: "Today",
    yesterday: "Yesterday",
    "7": "Last 7 Days",
    "30": "Last 30 Days",
    "3months": "Last 3 Months",
    "6months": "Last 6 Months",
    year: "Last Year",
    custom: "Custom Range",
  };

  const orderChange =
    filteredOrders.length - previousOrderTotal;
  const revenueChangeByCurrency = new Map<string, number>();
  new Set([
    ...selectedRevenueByCurrency.keys(),
    ...previousRevenueByCurrency.keys(),
  ]).forEach((currencyCode) => {
    revenueChangeByCurrency.set(
      currencyCode,
      (selectedRevenueByCurrency.get(currencyCode) ?? 0) -
        (previousRevenueByCurrency.get(currencyCode) ?? 0)
    );
  });
  const formattedRevenueChange = revenueChangeByCurrency.size
    ? [...revenueChangeByCurrency.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([currencyCode, amount]) =>
          formatCurrency(amount, currencyCode)
        )
        .join(" · ")
    : formatCurrency(0, settings.billing.currency);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{
        display:"flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          Welcome back, {user?.name}
        </Typography>
        <Typography variant="h1" sx={{ mt: 0.5 }}>
          {user?.role} Dashboard
        </Typography>
      </Box>

      <Box sx={{
        display:"flex",
        alignItems: "center",
        gap:1.5,
        flexWrap: "wrap"
      }}>
        <TextField
        select
        size="small"
        label="Date Range"
        value={dateRange}
        onChange={(event) => 
          changeRange(event.target.value as DateRange)
        }
        sx={{minWidth:180}}
        >
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="7">Last 7 Days</MenuItem>
          <MenuItem value="30">Last 30 Days</MenuItem>
          <MenuItem value="3months">Last 3 Months</MenuItem>
          <MenuItem value="6months">Last 6 Months</MenuItem>
          <MenuItem value="year">Last Year</MenuItem>
          <MenuItem value="custom">Custom Range</MenuItem>
        </TextField>

        {dateRange === "custom" && (
          <>
          <TextField
          size="small"
          label="From"
          type="date"
          value={customStart}
          onChange={(event) => {
            setCustomStart(event.target.value);
            localStorage.setItem(START_KEY,event.target.value);
          }}
          slotProps={{inputLabel: {shrink:true}}}
          />
          <TextField
          size="small"
          label="To"
          type="date"
          value={customEnd}
          onChange={(event) => {
            setCustomEnd(event.target.value);
            localStorage.setItem(END_KEY, event.target.value);
          }}
          slotProps ={{inputLabel:{shrink:true}}}
          />
          </>
        )}
      </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 10, sm: 6, xl: 4 }}>
          <StatCard
            title={`${rangeLabel[dateRange]} Orders`}
            value={validRange ? filteredOrders.length.toString() : "—"}
            change={
              validRange
                ? `${orderChange >= 0 ? "+" : ""}${orderChange} vs previous period`
                : "Invalid date range"
            }
            icon={<ShoppingCartIcon />}
          />
        </Grid>

        <Grid size={{ xs: 10, sm: 6, xl: 4 }}>
          <StatCard
            title={`${rangeLabel[dateRange]} Revenue`}
            value={
              validRange
                ? formatCurrencyTotals(selectedRevenueByCurrency)
                : "—"
            }
            change={
              validRange
                ? `${formattedRevenueChange} vs previous period`
                : "Invalid date range"
            }
            icon={<PaymentsIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
          <StatCard
            title="Available Tables"
            value={`${availableTables} / ${tables.length}`}
            change="Live availability"
            icon={<ChairIcon />}
          />
        </Grid>
      </Grid>

      {validRange && dayCount > 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 6 }}>
            <ComparisonChart
              title="Sales Overview"
              subtitle="Orders per day compared with the previous equivalent period"
              currentLabel="Selected period"
              previousLabel="Previous period"
              currentValues={currentOrderCounts}
              previousValues={previousOrderCounts}
              dates={currentDates}
              formatValue={(value) => value.toLocaleString("en-IN")}
              color="#ed6c02"
            />
          </Grid>

          <Grid size={{ xs: 12, xl: 6 }}>
            <ComparisonChart
              title="Revenue Overview"
              subtitle="Collected revenue per day compared with the previous equivalent period"
              currentLabel="Selected period"
              previousLabel="Previous period"
              currentValues={currentRevenueValues}
              previousValues={previousRevenueValues}
              dates={currentDates}
              formatValue={(value) =>
                formatCurrency(value, settings.billing.currency)
              }
              color="#ed6c02"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RecentOrders />
          </Grid>
        </Grid>
      )}

      {!validRange && (
        <Typography color="error" variant="body2">
          Please select a valid date range. The start date must not be after
          the end date.
        </Typography>
      )}
    </Box>
  );
};

export default Dashboard;