import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";

import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import type { Role } from "../../types/role";
import type {
  StaffRole,
  StaffStatus,
} from "../../types/staff";

interface StaffFiltersProps {
  search: string;
  role: StaffRole | "All";
  status: StaffStatus | "All";
  roles: Role[];

  onSearchChange: (value: string) => void;
  onRoleChange: (value: StaffRole | "All") => void;
  onStatusChange: (value: StaffStatus | "All") => void;
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

interface FilterSelectProps<T extends string> {
  value: T | "All";
  onChange: (value: T | "All") => void;
  options: Array<{
    value: T | "All";
    label: string;
  }>;
  sx?: object;
}

const SearchField = ({ value, onChange }: SearchFieldProps) => (
  <TextField
    size="small"
    placeholder="Search Staff..."
    value={value}
    onChange={(event) => onChange(event.target.value)}
    sx={{ flex: 1 }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon fontSize="small" />
        </InputAdornment>
      ),
      endAdornment: value && (
        <InputAdornment position="end">
          <IconButton 
          size="small"
          onClick={() => onChange("")}
          aria-label="Clear search"
          edge="end">
            <CloseIcon fontSize="small"/>
          </IconButton>

        </InputAdornment>
      )
    }}
  />
);

const FilterSelect = <T extends string>({
  value,
  onChange,
  options,
  sx,
}: FilterSelectProps<T>) => (
  <TextField
    select
    size="small"
    value={value}
    onChange={(event) =>
      onChange(event.target.value as T | "All")
    }
    sx={{ minWidth: 160, ...sx }}
  >
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

const RoleFilter = ({
  value,
  roles,
  onChange,
}: {
  value: StaffRole | "All";
  roles: Role[];
  onChange: (value: StaffRole | "All") => void;
}) => (
  <FilterSelect
    value={value}
    onChange={onChange}
    options={[
      { value: "All", label: "All Roles" },
      ...roles.map((role) => ({
        value: role.name as StaffRole,
        label: role.name,
      })),
    ]}
  />
);

const StatusFilter = ({
  value,
  onChange,
}: {
  value: StaffStatus | "All";
  onChange: (value: StaffStatus | "All") => void;
}) => (
  <FilterSelect
    value={value}
    onChange={onChange}
    options={[
      { value: "All", label: "All Status" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ]}
  />
);

const StaffFilters = ({
  search,
  role,
  status,
  roles,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: StaffFiltersProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2.5,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            lg: "row",
          },
          gap: 2,
        }}
      >
        <SearchField
          value={search}
          onChange={onSearchChange}
        />

        <RoleFilter
          value={role}
          roles={roles}
          onChange={onRoleChange}
        />

        <StatusFilter
          value={status}
          onChange={onStatusChange}
        />
      </Box>
    </Paper>
  );
};

export default StaffFilters;