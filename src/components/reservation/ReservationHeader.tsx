import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useNavigate } from "react-router-dom";

interface ReservationHeaderProps {
  onAddReservation: () => void;
}

const ReservationHeader = ({
  onAddReservation,
}: ReservationHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { sm: "center" },
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h1">Reservations</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage restaurant reservations
        </Typography>
      </Box>

      <Box
        sx={{ display: "flex", gap:1 }}>
          <Button
          variant="outlined"
          color="primary"
          startIcon={<AccessTimeIcon/>}
          onClick={() => navigate("/reservation-time-slots")}
          >
            Manage Time Slots
          </Button>
          
          <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddReservation}
          >
            Add Reservation
          </Button>
        </Box>
     </Box>
  );
};

export default ReservationHeader;
