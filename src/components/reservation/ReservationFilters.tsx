import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import type { ReservationStatus } from "../../types/reservation";

interface ReservationFiltersProps {
  search: string;
  status: ReservationStatus | "All";
  section :string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ReservationStatus | "All") => void;
  onSectionChange: (value: string) => void;
}

const ReservationFilters = ({
  search,
  status,
  section,
  onSearchChange,
  onStatusChange,
  onSectionChange,
}: ReservationFiltersProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="search reservations..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          sx={{ maxWidth: 400, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton 
                size="small"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                edge="end">
                  <CloseIcon fontSize="small"/>
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Select
          size="small"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ReservationStatus | "All")
          }
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Confirmed">Confirmed</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
        </Select>

        <Select
        size="small"
        value={section}
        onChange={(event) => onSectionChange(event.target.value)}
        sx={{minWidth:180}}
        >
         <MenuItem value="All">All Sections</MenuItem>
         <MenuItem value="Indoor">Indoor</MenuItem>
         <MenuItem value="Outdoor">Outdoor</MenuItem> 
         <MenuItem value="Private">Private</MenuItem>
        </Select>
      </Box>
    </Paper>
  );
};

export default ReservationFilters;
