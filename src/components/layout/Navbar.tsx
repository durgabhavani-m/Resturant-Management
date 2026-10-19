import { useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockResetIcon from "@mui/icons-material/LockReset";
import LogoutIcon from "@mui/icons-material/Logout";

import ChangePassword from "./ChangePassword"

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useStaff } from "../../context/StaffContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { staff, updateStaff } = useStaff();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);

  const staffMember = staff.find(
    (member) =>
      member.id === user?.id ||
      member.email.trim().toLowerCase() ===
        user?.email.trim().toLowerCase()
  );

  const displayName = staffMember?.name ?? user?.name ?? "Admin";
  const displayEmail = staffMember?.email ?? user?.email ?? "";
  const displayRole = staffMember?.role ?? user?.role ?? "Admin";

  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  const handleProfileClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };


  const handleOpenProfile = () => {
    handleClose();
    setProfileOpen(true);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    handleClose();
    setPasswordOpen(true);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: 80,
        flexShrink: 0,
        px: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        component="button"
        onClick={handleProfileClick}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          border: 0,
          bgcolor: "transparent",
          cursor: "pointer",
          p: 0.75,
          borderRadius: 2,
          color: "text.primary",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            width: 40,
            height: 40,
            fontWeight: 600,
          }}
        >
          {initial}
        </Avatar>

        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            textAlign: "left",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {displayName}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {displayRole}
          </Typography>
        </Box>

        <KeyboardArrowDownIcon fontSize="small" color="action" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              mt: 1.5,
              borderRadius: 2.5,
              boxShadow: 4,
            },
          },
        }}
      >
      
        <Box sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                width: 44,
                height: 44,
              }}
            >
              {initial}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {displayName}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: "anywhere" }}
              >
                {displayEmail}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5 }}
          >
            Role: {displayRole}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleOpenProfile}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>

        <MenuItem onClick={handleChangePassword}>
          <ListItemIcon>
            <LockResetIcon fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog 
      open={profileOpen}
      onClose={() => setProfileOpen(false)}
      fullWidth
      maxWidth="sm"
      >
        <DialogTitle>My Profile</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{py:1}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
            <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: 24,
            }}
            >
              {initial}
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={700}>
                {displayName}
              </Typography>

              <Typography color="text.secondary">
                {displayRole}
              </Typography>
            </Box>
            </Box>

            <Divider/>

            <Box >
              <Typography variant="caption" color="text.secondary">
                Full Name
              </Typography>

              <Typography>{displayName}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Email Address
              </Typography>

              <Typography sx={{overflowWrap: "anywhere"}}>
                {displayEmail}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Phone Number
              </Typography>

              <Typography>
                {staffMember?.phone || "Not provided"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Account Status
              </Typography>

              <Typography>
                {staffMember?.status || "Not available"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Member Since
              </Typography>

              <Typography>
                {staffMember?.createdAt
                ? new Date(staffMember.createdAt).toLocaleDateString("en-IN")
                : "Not available"}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{p:2}}>
          <Button onClick={() => setProfileOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ChangePassword
      open={passwordOpen}
      onClose={() => setPasswordOpen(false)}
      onSave={(currentPassword, newPassword) => {
        if(!user || !staffMember){
          return false; 
        }
        if(staffMember.password !== currentPassword){
          return false;
        }

        return updateStaff({
          ...staffMember,
          password: newPassword,
          passwordSet: true,
          mustResetPassword: false,
        })
      }}
      />
    </Box>
  );
};

export default Navbar;