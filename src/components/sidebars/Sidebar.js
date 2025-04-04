import React from "react";
import { NavLink } from "react-router-dom";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Divider, Box } from "@mui/material";
import { Home, Person, Description, ExitToApp, People, LocalHospital } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, toggleSidebar, onTabClick }) => {
  const { user, logout } = useAuth();

  const menuItems = {
    EMPLOYEE: [
      { text: "Dashboard", icon: <Home />, path: "/employee/dashboard" },
      { text: "Profile", icon: <Person />, path: "/employee/profile" },
      { text: "Doctors", icon: <LocalHospital />, path: "/employee/doctorsList" },
    ],
    ADMIN: [
      { text: "Dashboard", icon: <Home />, path: "/admin/dashboard" },
      { text: "Report Analysis", icon: <Description/>, path: "/admin/reportAnalytics"},
      { text: "Profile", icon: <Person />, path: "/admin/profile" },
      { text: "Employees", icon: <People />, path: "/admin/employeesList" },
      { text: "Doctors", icon: <LocalHospital />, path: "/admin/doctorsList" },
      { text: "Technicians", icon: <LocalHospital />, path: "/admin/techniciansList" },
    ],
    DOCTOR: [
      { text: "Dashboard", icon: <Home />, path: "/doctor/dashboard" },
      { text: "Profile", icon: <Person />, path: "/doctor/profile" },
      { text: "Employees", icon: <People />, path: "/doctor/employeesList" },
      { text: "Technicians", icon: <LocalHospital />, path: "/doctor/techniciansList" },
    ],
    TECHNICIAN: [
      { text: "Dashboard", icon: <Home />, path: "/technician/dashboard" },
      { text: "Profile", icon: <Person />, path: "/technician/profile" },
      { text: "Employees", icon: <People />, path: "/technician/employeesList" },
      { text: "Doctors", icon: <LocalHospital />, path: "/technician/doctorsList" },
    ],
    
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={toggleSidebar}
      variant="temporary"
      sx={{
        "& .MuiDrawer-paper": {
          width: isOpen ? 270 : 80,
          bgcolor: "#002147",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          transition: "width 0.3s ease-in-out",
          zIndex: 1300,
        },
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          padding: "10px 0",
          bgcolor: "#001A33",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#29c8dd",
            color: "#ffffff",
            width: 60,
            height: 60,
            fontSize: "24px",
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
        {isOpen && (
          <>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff", mt: 1 }}>
              {user?.name || "Loading..."}
            </Typography>
            <Typography variant="body2" sx={{ color: "#B0BEC5" }}>
              {user?.employeeId || "Loading..."}
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ bgcolor: "#FFD700", height: 2 }} />

      {/* Menu Items */}
      <List>
        {menuItems[user?.role]?.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={onTabClick}
              sx={{
                color: "white",
                "&.active": { bgcolor: "#0056b3", color: "#FFD700" },
                "&:hover": { bgcolor: "#003366" },
                justifyContent: isOpen ? "flex-start" : "center",
                alignItems: "center",
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: 0,
                  marginRight: isOpen ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {isOpen && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ padding: "10px 0", mb: 2 }}>
        <Divider sx={{ bgcolor: "#FFD700" }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={logout}
            sx={{
              bgcolor: "#B22222",
              color: "white",
              mt: 1,
              "&:hover": { bgcolor: "#8B0000" },
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <ListItemIcon
              sx={{
                color: "white",
                minWidth: 0,
                marginRight: isOpen ? 2 : "auto",
                justifyContent: "center",
              }}
            >
              <ExitToApp />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Logout" />}
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
