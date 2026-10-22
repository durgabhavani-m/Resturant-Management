import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

import { useOrder } from "../../context/OrderContext";

const statusColor = (status: string): "success" | "info" | "warning" | "default" => {
  if (status === "Completed") return "success";
  if (status === "Preparing") return "info";
  return "warning";
};

const getOrderDateLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const getKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  if (getKey(date) === getKey(today)) return "Today";
  if (getKey(date) === getKey(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const RecentOrders = () => {
  const { orders } = useOrder();

  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/orders",{
      state: {showAllOrders:true}
    });
  };

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography
            sx={{
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              fontWeight: 600,
              lineHeight: 1.3,
              }}
              >
                Recent Orders
              </Typography>
              
            <Typography variant="body2" color="text.secondary">
              Latest restaurant orders
            </Typography>
          </Box>
          <Button onClick={handleViewAll} size="small" color="primary">
            View all
          </Button>
        </Box>

        {recentOrders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No orders yet.
          </Typography>
        ) : (
          recentOrders.map((order, index) => (
            <Box key={order.id}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {order.orderNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {getOrderDateLabel(order.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{order.total.toLocaleString("en-IN")}
                  </Typography>
                  <Chip label={order.status} size="small" color={statusColor(order.status)} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
