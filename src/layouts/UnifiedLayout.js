import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebars/Sidebar";
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/icon.png";

const UnifiedLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onTabClick={() => setIsSidebarOpen(false)} // Close sidebar on tab click
      />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Navbar */}
        <AppBar position="fixed" sx={{ bgcolor: "#002147", zIndex: 1200 }}>
          <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
            {/* Sidebar Toggle Button */}
            <IconButton edge="start" color="inherit" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MenuIcon />
            </IconButton>

            {/* Logo and Title */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img src={logo} alt="SAIL Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
                SAIL Health Portal
              </Typography>
            </Box>

            {/* Profile Avatar */}
            <Box>
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar sx={{ bgcolor: "#ffffff", color: "#002147", fontWeight: "bold" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              {/* Profile Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={profileMenuOpen}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.name || "Loading..."}
                  </Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    {user?.role || "Loading..."}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={logout}>
                  <Typography variant="body2" color="error">
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 8, // Adjust for the height of the AppBar
            p: 3,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedLayout;
