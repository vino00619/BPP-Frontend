import React, { useState } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import {
  Home,
  Map,
  CloudUpload,
  RateReview,
  Nature,
  ElectricalServices,
  Engineering,
  Assignment,
} from "@mui/icons-material";

const Sidebar = ({ user, width = 240, currentView, onNavigate }) => {
  const theme = useTheme();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Navigation menu items as specified
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home />,
      path: "/dashboard",
    },
    {
      id: "projects",
      label: "Projects",
      icon: <Map />,
      path: "/projects",
    },
    {
      id: "upload",
      label: "Upload Files",
      icon: <CloudUpload />,
      path: "/upload",
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: <RateReview />,
      path: "/reviews",
    },
    {
      id: "environmental",
      label: "Environmental",
      icon: <Nature />,
      path: "/environmental",
    },
    {
      id: "electrical",
      label: "Electrical",
      icon: <ElectricalServices />,
      path: "/electrical",
    },
    {
      id: "civil",
      label: "Civil",
      icon: <Engineering />,
      path: "/civil",
    },
    {
      id: "permitting",
      label: "Permitting",
      icon: <Assignment />,
      path: "/permitting",
    },
  ];

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
          Project Management
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
                alignItems: "center",
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {user.email || "user@example.com"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  width: PropTypes.number,
  currentView: PropTypes.string,
  onNavigate: PropTypes.func,
};

export default Sidebar;
