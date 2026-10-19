import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import PeopleIcon from "@mui/icons-material/People";

import type { Staff } from "../../types/staff";

interface StaffStatsProps {
  staff: Staff[];
}

const StaffStats = ({ staff }: StaffStatsProps) => {
  const activeCount = staff.filter(
    (member) => member.status === "Active"
  ).length;

  const inactiveCount = staff.filter(
    (member) => member.status === "Inactive"
  ).length;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Total Staff */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Staff
              </Typography>

              <Typography
                variant="h2"
                sx={{ mt: 0.5 }}
              >
                {staff.length}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "primary.light",
                color: "primary.main",
                display: "flex",
              }}
            >
              <PeopleIcon />
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Active Staff */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Active Staff
          </Typography>

          <Typography
            variant="h2"
            sx={{
              mt: 0.5,
              color: "#059669",
            }}
          >
            {activeCount}
          </Typography>
        </Paper>
      </Grid>

      {/* Inactive Staff */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Inactive Staff
          </Typography>

          <Typography
            variant="h2"
            sx={{
              mt: 0.5,
              color: "text.secondary",
            }}
          >
            {inactiveCount}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StaffStats;