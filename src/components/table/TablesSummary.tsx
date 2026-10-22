import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";

interface TableSummaryProps {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  cleaningTables: number;
}

const TableSummary = ({
  totalTables,
  availableTables,
  occupiedTables,
  reservedTables,
  cleaningTables,
}: TableSummaryProps) => {
  const summaryItems = [
    {
      label: "Total",
      count: totalTables,
      background: undefined,
      borderColor: undefined,
      textColor: undefined,
    },
    {
      label: "Available",
      count: availableTables,
      background: "#ecfdf5",
      borderColor: "#a7f3d0",
      textColor: "#047857",
    },
    {
      label: "Occupied",
      count: occupiedTables,
      background: "#fef2f2",
      borderColor: "#fecaca",
      textColor: "#b91c1c",
    },
    {
      label: "Reserved",
      count: reservedTables,
      background: "#fffbeb",
      borderColor: "#fde68a",
      textColor: "#b45309",
    },
    {
      label: "Cleaning",
      count: cleaningTables,
      background: "#eff6ff",
      borderColor: "#bfdbfe",
      textColor: "#1d4ed8",
    },
  ];

  return (
    <Grid container spacing={2}>
      {summaryItems.map((item) => (
        <Grid key={item.label} size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: item.background,
              borderColor: item.borderColor,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: item.textColor ?? "text.secondary",
              }}
            >
              {item.label}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
                fontSize: "1.5rem",
                color: item.textColor,
              }}
            >
              {item.count}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TableSummary;