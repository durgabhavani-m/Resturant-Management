import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import type { Reservation, ReservationStatus } from "../../types/reservation";

const getStatusColor = (
  status: ReservationStatus
): "success" | "warning" | "info" | "error" => {
  if (status === "Confirmed") return "success";
  if (status === "Pending") return "warning";
  if (status === "Completed") return "info";
  return "error";
};

interface ReservationTableProps {
  reservations: Reservation[];
  openMenuId: string | null;
  menuAnchorEl: HTMLElement | null;
  menuReservation: Reservation | null;
  onToggleMenu: (event: React.MouseEvent<HTMLElement>, reservationId: string) => void;
  onCloseMenu: () => void;
  onView: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onConfirm: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
}

const ReservationTable = ({
  reservations,
  openMenuId,
  menuAnchorEl,
  menuReservation,
  onToggleMenu,
  onCloseMenu,
  onView,
  onEdit,
  onConfirm,
  onCancel,
}: ReservationTableProps) => {
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
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reservations.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.phone}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.date}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.time}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.guests}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.tableNumber ? `# ${item.tableNumber}` : "Not assigned"}
                  </Typography>

                  {item.tableNumber && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.tableSection || "-"}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    color={getStatusColor(item.status)}
                  />
                </TableCell>

                <TableCell>
                  <IconButton
                    size="small"
                    title="Actions"
                    onClick={(event) => {
                      if (openMenuId === item.id) {
                        onCloseMenu();
                        return;
                      }

                      onToggleMenu(event, item.id);
                    }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(openMenuId) && Boolean(menuAnchorEl)}
        onClose={onCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {menuReservation && (
          <>

          <MenuItem
          onClick={() => {
            onView(menuReservation);
            onCloseMenu();
          }}>
            View Details
          </MenuItem>

          {(menuReservation.status === "Pending" || 
            menuReservation.status === "Confirmed") && (
              <MenuItem
              onClick={() => {
                onEdit(menuReservation);
                onCloseMenu();
              }}>
                Edit
              </MenuItem>
            )}

            {menuReservation.status === "Pending" && (
              <MenuItem
              onClick={() => {
                onConfirm(menuReservation.id);
                onCloseMenu();
              }}
              sx={{color: "success.main"}}
              >
                Confirm
              </MenuItem>
            )}

            {(menuReservation.status === "Pending" || 
              menuReservation.status === "Confirmed") && (
                <MenuItem
                onClick={() => {
                  onCancel(menuReservation.id);
                  onCloseMenu();
                }}
                sx={{color: "error.main"}}
                >
                  Cancel Reservation
                </MenuItem>
              )}
          </>
        )}
      </Menu>

      {reservations.length === 0 && (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No reservation found.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ReservationTable;
