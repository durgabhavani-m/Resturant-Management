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
): "success" | "warning" | "info" | "error" | "primary" | "default" => {
  switch(status){
    case "Confirmed":
      return "success";
    case "Pending":
      return "warning";
    case "Seated":
      return "primary";
    case "Completed":
      return "info";
    case "Cancelled":
    case "No-show":
      return "error";
    default:
      return "default";
  }
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

  onSeat?:(reservationId:string) => void;
  onComplete?:(reservationId:string) => void;
  onNoShow?: (reservationId:string) => void;
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
  onSeat,
  onComplete,
  onNoShow,
}: ReservationTableProps) => {
  const isEditable = (status:ReservationStatus) =>
    status === "Pending" || status === "Confirmed";

  const runAction = (action: () => void) => {
    action();
    onCloseMenu();
  }
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
                    title="Reservation Actions"
                    onClick={(event) => {
                      if (openMenuId === item.id) {
                        onCloseMenu();
                      }else{
                        onToggleMenu(event, item.id);
                      }                  
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

      {reservations.length === 0 && (
        <Box sx={{py:6, textAlign: "center"}}>
          <Typography variant="body2" color="text.secondary">
            No reservation found.
          </Typography>
        </Box>
      )}

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
          onClick={() => 
            runAction(() => onView(menuReservation))     
          }
          >
            View Details
          </MenuItem>

          {isEditable(menuReservation.status) && (
            <MenuItem 
            onClick={() => 
              runAction(() => onEdit(menuReservation))
            }
            >
              Edit
            </MenuItem>
          )}

            {menuReservation.status === "Pending" && (
              <MenuItem
              onClick={() => 
                runAction(() =>
                onConfirm(menuReservation.id))
              }
              sx={{color: "success.main"}}
              >
                Confirm
              </MenuItem>
            )}

            {menuReservation.status === "Confirmed" && onSeat && (
              <MenuItem
              onClick={() => 
                runAction(() => onSeat(menuReservation.id))
              }
              sx={{color:"primary.main"}}
              >
                Mark as Seated
              </MenuItem>
            )}

            {menuReservation.status === "Seated" && onComplete && (
              <MenuItem 
              onClick={() => 
                runAction(() => onComplete(menuReservation.id))
              }
              sx={{color: "success.main"}}
              >
                Complete Reservation
              </MenuItem>
            )}

            {menuReservation.status === "Confirmed" && onNoShow && (
              <MenuItem
              onClick={() => 
                runAction(() => onNoShow(menuReservation.id))
              }
              sx={{color: "error.main"}}
              >
                Mark as No-show
              </MenuItem>
            )}

            {isEditable(menuReservation.status) && (
              <MenuItem
              onClick={() => 
                runAction(() => onCancel(menuReservation.id))
              }
              sx={{color: "error.main"}}
              >
                Cancel Reservation
              </MenuItem>
            )}
          </>
        )}
      </Menu> 
    </Paper>
  );
};

export default ReservationTable;
