import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Typography,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import {
  Home,
  Map,
  CloudUpload,
  Nature,
  ElectricalServices,
  Engineering,
  Assignment,
  LogoutOutlined,
} from "@mui/icons-material";

const Sidebar = ({ user, width = 240, currentView, onNavigate }) => {
  const theme = useTheme();
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  const handleSignOut = () => {
    try {
      // First navigate to login
      navigate('/login', { replace: true });
      // Then clear the localStorage
      localStorage.clear();
      // Force a page reload to clear any remaining state
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: force redirect to login
      window.location.href = '/login';
    }
  };

  // Common menu items that appear for all users
  const commonMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home />,
      path: "/dashboard",
    },
    {
      id: "projects",
      label: "Project Review",
      icon: <Map />,
      path: "/projects",
    },
  ];

  // Department-specific menu items
  const departmentMenuItems = {
    "Solar and Wind": [
      {
        id: "upload",
        label: "Upload Files",
        icon: <CloudUpload />,
        path: "/upload",
      }
    ],
    "Environmental": [], // All review departments only need Project Review
    "Electrical": [],
    "Civil": [],
    "Permitting": [],
  };

  // Get menu items based on user's department
  const departmentItems = user?.department ? departmentMenuItems[user.department] || [] : [];
  
  // Create ordered menu items
  const orderedItems = [
    ...commonMenuItems, // Dashboard and Project Review
    departmentItems.find(item => item.id === "upload"), // Upload Files (only for Solar and Wind)
    ...departmentItems.filter(item => !["upload"].includes(item.id)), // Department specific items
  ].filter(Boolean);
  
  // Combine ordered items with any remaining department-specific items
  const menuItems = orderedItems;

  const handleNavigation = (path, id) => {
    if (onNavigate) {
      onNavigate(path, id);
    }
  };

  const isActiveRoute = (path) => {
    return currentView === path;
  };

  return (
    <Box
      sx={{
        width: width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 2,
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.contrastText,
            textAlign: "center",
            fontSize: "1rem",
            lineHeight: 1.2,
          }}
        >
          {user?.department || "Project Management"}
          {user?.department && " Department"}
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: "auto", py: 1 }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            const isHovered = hoveredItem === item.id;

            return (
              <ListItem key={item.id} disablePadding sx={{ px: 2, py: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path, item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    backgroundColor: isActive
                      ? theme.palette.primary.main
                      : "transparent",
                    color: isActive
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                    "&:hover": {
                      backgroundColor: isActive
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                      transform: "translateX(4px)",
                      transition: "all 0.2s ease-in-out",
                    },
                    transition: "all 0.2s ease-in-out",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: isActive ? "70%" : "0%",
                      backgroundColor: isActive
                        ? theme.palette.secondary.main
                        : "transparent",
                      borderRadius: "0 2px 2px 0",
                      transition: "height 0.2s ease-in-out",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive
                        ? theme.palette.primary.contrastText
                        : theme.palette.primary.main,
                      transition: "all 0.2s ease-in-out",
                      transform:
                        isHovered && !isActive ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease-in-out",
                      color: isActive ? "#fff" : theme.palette.text.primary,
                    }}
                  />

                  {/* Active indicator dot */}
                  {isActive && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.secondary.main,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Info Section */}
      {user && (
        <>
          <Divider />
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontSize: "1rem",
                    fontWeight: 600,
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name || user.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      display: "block",
                      fontWeight: 500,
                    }}
                  >
                    {/* {user.role} */}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>Email:</span> 
                  {user.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>Department:</span> 
                  {user.department}
                </Typography>
                {user.id && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>ID:</span> 
                    {user.id}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Sign Out Button */}
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<LogoutOutlined />}
              onClick={handleSignOut}
              sx={{
                mt: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
                transition: 'all 0.3s ease',
                boxShadow: 1,
              }}
            >
              Sign Out
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string
  }),
  width: PropTypes.number,
  currentView: PropTypes.string,
  onNavigate: PropTypes.func,
};

export default Sidebar;
