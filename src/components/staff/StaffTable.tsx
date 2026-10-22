import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SecurityIcon from "@mui/icons-material/Security";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import type {
  Staff,
  StaffRole,
  StaffStatus,
} from "../../types/staff";

interface StaffTableProps {
  staff: Staff[];
  menuAnchorEl: HTMLElement | null;
  menuMember: Staff | null;

  onMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    member: Staff
  ) => void;

  onMenuClose: () => void;
  onView: (member: Staff) => void;
  onEdit: (member: Staff) => void;
  onDelete: (member: Staff) => void;
  onManagePermissions: (member: Staff) => void;
}

const StaffTable = ({
  staff,
  menuAnchorEl,
  menuMember,
  onMenuOpen,
  onMenuClose,
  onView,
  onEdit,
  onDelete,
  onManagePermissions,
}: StaffTableProps) => {
  const getInitials = (staffName: string) =>
    staffName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getRoleChipSx = (staffRole: StaffRole) => {
    switch (staffRole) {
      case "Admin":
        return {
          bgcolor: "#f3e8ff",
          color: "#7e22ce",
        };

      case "Dine-in Staff":
        return {
          bgcolor: "#eff6ff",
          color: "#1d4ed8",
        };

      case "Counter Staff":
        return {
          bgcolor: "primary.light",
          color: "primary.dark",
        };

      default:
        return {
          bgcolor: "#f8fafc",
          color: "#334155",
        };
    }
  };

  const getStatusChipSx = (staffStatus: StaffStatus) => {
    switch (staffStatus) {
      case "Active":
        return {
          bgcolor: "#ecfdf5",
          color: "#047857",
        };

      case "Inactive":
        return {
          bgcolor: "#f1f5f9",
          color: "#475569",
        };

      default:
        return {
          bgcolor: "#f8fafc",
          color: "#334155",
        };
    }
  };

  const handleView = () => {
    if (menuMember) onView(menuMember);
  };

  const handleEdit = () => {
    if (menuMember) onEdit(menuMember);
  };

  const handleManagePermissions = () => {
    if (menuMember) onManagePermissions(menuMember);
  };

  const handleDelete = () => {
    if (menuMember) onDelete(menuMember);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              {["Staff", "Contact", "Role", "Status", "Actions"].map(
                (heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      typography: "caption",
                      fontWeight: 600,
                      color: "text.secondary",
                      textTransform: "uppercase",
                    }}
                  >
                    {heading}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No Staff found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "primary.light",
                          color: "primary.dark",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          typography: "body2",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(member.name)}
                      </Box>

                      <Box>
                        <Typography fontWeight={500}>
                          {member.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Staff ID: {member.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {member.email}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {member.phone}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={member.role}
                      size="small"
                      sx={getRoleChipSx(member.role)}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={member.status}
                      size="small"
                      sx={getStatusChipSx(member.status)}
                    />
                  </TableCell>

                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label={`Actions for ${member.name}`}
                      onClick={(event) => onMenuOpen(event, member)}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl && menuMember)}
        onClose={onMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} />
          View Staff
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Staff
        </MenuItem>

        <MenuItem onClick={handleManagePermissions}>
          <SecurityIcon fontSize="small" sx={{ mr: 1.5 }} />
          Manage Role Permissions
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete Staff
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default StaffTable;
