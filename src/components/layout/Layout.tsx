import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden", bgcolor: "background.default" }}>
      <Sidebar />

      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <Navbar />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: "auto",
            p: { xs: 2, md: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
