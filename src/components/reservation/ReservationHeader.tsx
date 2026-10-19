import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";

interface ReservationHeaderProps {
  onAddReservation: () => void;
}

const ReservationHeader = ({
  onAddReservation,
}: ReservationHeaderProps) => {
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

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onAddReservation}
      >
        Add Reservation
      </Button>
    </Box>
  );
};

export default ReservationHeader;
