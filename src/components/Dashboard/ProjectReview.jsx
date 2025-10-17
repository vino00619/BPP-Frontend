import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  CircularProgress,
  ButtonGroup,
} from "@mui/material";
import {
  Description,
  Map,
  InsertDriveFile,
  NotificationsActive,
  Error as ErrorIcon,
} from "@mui/icons-material";

const ProjectReview = ({ user }) => {
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleFileAction = async (fileId, actionType, currentApprovalStatus) => {
    if (!user?.department || !user?.id) return;
    setActionLoading(true);
    try {
      // Parse current approval status
      const approvalStatus = typeof currentApprovalStatus === 'string'
        ? JSON.parse(currentApprovalStatus || '{}')
        : currentApprovalStatus || {};

      // Update only the specific department's status while preserving others
      const updatedApprovalStatus = {
        ...approvalStatus,
        [user.department]: actionType === 'approve' ? 'approved' : 'rejected'
      };

      const response = await fetch(
        `https://3f769fa3-ed5f-46d9-a9d3-94747066ab72-00-16aw6un3hn9io.worf.replit.dev/api/files/${fileId}/approval`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section: user.department,
            action: actionType === 'approve' ? 'approved' : 'rejected',
            user_id: user.id,
            approval_status: updatedApprovalStatus // Send the complete updated status
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${actionType} file`);
      }

      // Refresh the files list after successful action
      await fetchFilesAndNotifications();
    } catch (error) {
      console.error(`Error ${actionType}ing file:`, error);
      setError(`Failed to ${actionType} file. Please try again later.`);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchFilesAndNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch files from the backend API
      const response = await fetch(
        "https://3f769fa3-ed5f-46d9-a9d3-94747066ab72-00-16aw6un3hn9io.worf.replit.dev/api/files"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await response.json();

      // Sort files by upload date (most recent first)
      const sortedFiles = data.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      );
      setFiles(sortedFiles);

      // Create notifications for non-Solar departments
      if (user?.department && user.department !== "Solar and Wind") {
        // Get all files that need this department's approval
        const newNotifications = data
          .filter((file) => {
            const approvalStatus = typeof file.approvalStatus === 'string'
              ? JSON.parse(file.approvalStatus || '{}')
              : file.approvalStatus || {};
            const departmentStatus = approvalStatus[user.department];
            // Only show notifications for pending approvals
            return departmentStatus === "pending";
          })
          .map((file) => {
            return {
              id: `notify_${file.id}`,
              fileId: file.id,
              fileName: file.filename,
              timestamp: file.uploadDate,
              uploadedBy: file.uploaded_by || "Unknown",
              department: "Solar and Wind",
              isNew: true,
            };
          });

        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch files. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as a dependency

  // Fetch files when component mounts
  useEffect(() => {
    fetchFilesAndNotifications();
  }, [fetchFilesAndNotifications]);

  const getFileIcon = (fileType) => {
    const iconStyle = {
      fontSize: 40,
      mr: 2,
      mt: 1,
      opacity: 0.8
    };

    if (fileType.includes("xlsx") || fileType.includes("csv")) {
      return <Description sx={{ ...iconStyle, color: "#1976d2" }} />;
    }
    if (fileType.includes("kmz") || fileType.includes("kml")) {
      return <Map sx={{ ...iconStyle, color: "#4caf50" }} />;
    }
    return <InsertDriveFile sx={iconStyle} />;
  };

  const getUserFileStatus = (file) => {
    const allowedSections = ["Environmental", "Electrical", "Civil", "Permitting"];
    
    // Check if user has a valid department and id
    if (!user?.department || !user?.id || !allowedSections.includes(user.department)) {
      return null;
    }

    const approvalStatus = typeof file.approvalStatus === 'string'
      ? JSON.parse(file.approvalStatus || '{}')
      : file.approvalStatus || {};
    
    return approvalStatus[user.department] || 'pending';
  };

  const canUserActOnFile = (file) => {
    // First check if user is from Solar and Wind department
    if (user?.department === "Solar and Wind") {
      return false;
    }
    
    // Then check the file status for other departments
    const status = getUserFileStatus(file);
    return status === 'pending' || !status;
  };

  const getFileTypeChip = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const chipColors = {
      xlsx: { color: "#1976d2", label: "Excel" },
      xls: { color: "#1976d2", label: "Excel" },
      csv: { color: "#ff9800", label: "CSV" },
      kmz: { color: "#4caf50", label: "Google Earth" },
      kml: { color: "#4caf50", label: "KML" },
    };

    const chipInfo = chipColors[extension] || {
      color: "#666",
      label: extension.toUpperCase(),
    };

    return (
      <Chip
        label={chipInfo.label}
        size="small"
        sx={{
          backgroundColor: `${chipInfo.color}20`,
          color: chipInfo.color,
          fontWeight: 500,
          ml: 1,
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Project Review
      </Typography>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          icon={<ErrorIcon />}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Notifications for reviewers */}
      {user?.department !== "Solar and Wind" && notifications.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<NotificationsActive />}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              You have {notifications.length} new file
              {notifications.length > 1 ? "s" : ""} to review
            </Typography>
            {notifications.map((notification) => (
              <Typography
                key={notification.id}
                variant="body2"
                color="text.secondary"
              >
                • {notification.fileName} (Uploaded by {notification.uploadedBy}{" "}
                from {notification.department})
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
            {files.map((file, index) => (
              <React.Fragment key={file.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    py: 2,
                    gap: 1,
                    position: 'relative',
                    minHeight: '100px'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minWidth: '60px',
                    height: '100%'
                  }}>
                    {getFileIcon(file.filename)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="subtitle1">
                          {file.filename}
                        </Typography>
                        {getFileTypeChip(file.filename)}
                        {notifications.some((n) => n.fileId === file.id) && (
                          <Badge color="error" variant="dot" sx={{ ml: 2 }}>
                            <Chip
                              label="New"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Badge>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Uploaded on {formatDate(file.uploadDate)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "primary.main",
                              backgroundColor: "primary.lighter",
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                            }}
                          >
                            by {file.uploaded_by}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          {Object.entries(
                            typeof file.approvalStatus === 'string' 
                              ? JSON.parse(file.approvalStatus || "{}") 
                              : file.approvalStatus || {}
                          ).map(([dept, status]) => {
                            const isCurrentDepartment = user?.department === dept;
                            const statusColors = {
                              pending: {
                                color: 'warning',
                                text: '⏳ Pending Review',
                                borderColor: '#ed6c02',
                              },
                              approved: {
                                color: 'success',
                                text: '✓ Approved',
                                borderColor: '#2e7d32',
                              },
                              rejected: {
                                color: 'error',
                                text: '✗ Rejected',
                                borderColor: '#d32f2f',
                              },
                            };

                            const statusConfig = statusColors[status] || statusColors.pending;

                            return (
                              <Chip
                                key={dept}
                                label={`${dept}: ${statusConfig.text}`}
                                size="small"
                                color={statusConfig.color}
                                variant={isCurrentDepartment ? "filled" : "outlined"}
                                sx={{
                                  fontWeight: isCurrentDepartment ? 600 : 400,
                                  boxShadow: isCurrentDepartment ? 2 : 0,
                                  borderColor: statusConfig.borderColor,
                                  '&.MuiChip-outlined': {
                                    borderWidth: isCurrentDepartment ? 2 : 1,
                                  },
                                  pl: 0.5,
                                  ...(isCurrentDepartment && status === 'approved' && {
                                    backgroundColor: 'success.main',
                                    color: 'white',
                                  }),
                                  ...(isCurrentDepartment && {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.2s ease-in-out',
                                  })
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    }
                  />
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      alignItems: 'center',
                      alignSelf: 'center',
                      ml: 'auto',
                      minHeight: '100%'
                    }}
                  >
                    {user?.department && (
                      <>
                        {canUserActOnFile(file) ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Approve File">
                              <IconButton
                                color="success"
                                disabled={actionLoading}
                                onClick={() => handleFileAction(file.id, 'approve', file.approvalStatus)}
                                sx={{
                                  padding: '12px',
                                  transition: 'all 0.15s ease-in-out',
                                  '&:hover': {
                                    backgroundColor: 'success.light',
                                    opacity: 0.95,
                                    transform: 'scale(1.01)',
                                  },
                                }}
                              >
                                <Chip
                                  label="Approve"
                                  color="success"
                                  sx={{ 
                                    cursor: 'pointer',
                                    height: '32px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    '& .MuiChip-label': {
                                      px: 2
                                    }
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject File">
                              <IconButton
                                color="error"
                                disabled={actionLoading}
                                onClick={() => handleFileAction(file.id, 'reject', file.approvalStatus)}
                                sx={{
                                  padding: '12px',
                                  transition: 'all 0.15s ease-in-out',
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                    opacity: 0.95,
                                    transform: 'scale(1.01)',
                                  },
                                }}
                              >
                                <Chip
                                  label="Reject"
                                  color="error"
                                  sx={{ 
                                    cursor: 'pointer',
                                    height: '32px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    '& .MuiChip-label': {
                                      px: 2
                                    }
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : getUserFileStatus(file) === 'approved' && (
                          <Chip
                            label="✓ Approved"
                            color="success"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 600,
                              borderWidth: 2,
                              height: '32px',
                              fontSize: '0.95rem',
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        )}
                      </>
                    )}
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
            {files.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      align="center"
                    >
                      No files are currently under review
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectReview;
