import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Description,
  Map,
  InsertDriveFile,
  Visibility,
  NotificationsActive,
} from '@mui/icons-material';

const ProjectReview = ({ user }) => {
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch files and notifications when component mounts
  useEffect(() => {
    fetchFilesAndNotifications();
  }, []);

  const fetchFilesAndNotifications = async () => {
    try {
      // In a real app, this would be an API call
      const response = await fetch('/src/data/mockData.json');
      const data = await response.json();
      
      // Filter files that are under review and sort by most recent first
      const reviewFiles = data.files
        .filter(file => file.status === 'under_review')
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      setFiles(reviewFiles);

      // Create notifications for non-Solar departments
      if (user?.department && user.department !== 'Solar and Wind') {
        // Get all files that need this department's approval
        const newNotifications = reviewFiles
          .filter(file => {
            const departmentStatus = file.approvalStatus[user.department];
            // Only show notifications for pending approvals
            return departmentStatus === 'pending';
          })
          .map(file => {
            // Get uploader's name from users array
            const uploader = data.users.find(u => u.id === file.uploadedBy);
            return {
              id: `notify_${file.id}`,
              fileId: file.id,
              fileName: file.filename,
              timestamp: file.uploadDate,
              uploadedBy: uploader?.name || 'Unknown',
              department: 'Solar and Wind',
              isNew: true
            };
          });
        
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('xlsx') || fileType.includes('csv')) {
      return <Description sx={{ color: '#1976d2' }} />;
    }
    if (fileType.includes('kmz') || fileType.includes('kml')) {
      return <Map sx={{ color: '#4caf50' }} />;
    }
    return <InsertDriveFile />;
  };

  const getFileTypeChip = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const chipColors = {
      'xlsx': { color: '#1976d2', label: 'Excel' },
      'xls': { color: '#1976d2', label: 'Excel' },
      'csv': { color: '#ff9800', label: 'CSV' },
      'kmz': { color: '#4caf50', label: 'Google Earth' },
      'kml': { color: '#4caf50', label: 'KML' },
    };
    
    const chipInfo = chipColors[extension] || { color: '#666', label: extension.toUpperCase() };
    
    return (
      <Chip
        label={chipInfo.label}
        size="small"
        sx={{
          backgroundColor: `${chipInfo.color}20`,
          color: chipInfo.color,
          fontWeight: 500,
          ml: 1
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Project Review
      </Typography>

      {user?.department !== 'Solar and Wind' && notifications.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<NotificationsActive />}
        >
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              You have {notifications.length} new file{notifications.length > 1 ? 's' : ''} to review
            </Typography>
            {notifications.map((notification, index) => (
              <Typography key={notification.id} variant="body2" color="text.secondary">
                • {notification.fileName} (Uploaded by {notification.uploadedBy} from {notification.department})
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Card>
        <CardContent>
          <List>
            {files.map((file, index) => (
              <React.Fragment key={file.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 2,
                  }}
                >
                  {getFileIcon(file.filename)}
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {file.filename}
                        </Typography>
                        {getFileTypeChip(file.filename)}
                        {notifications.some(n => n.fileId === file.id) && (
                          <Badge
                            color="error"
                            variant="dot"
                            sx={{ ml: 2 }}
                          >
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded on {formatDate(file.uploadDate)}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'primary.main',
                            backgroundColor: 'primary.lighter',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                          }}>
                            by {file.uploadedBy}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {Object.entries(file.approvalStatus).map(([dept, status]) => (
                            <Chip
                              key={dept}
                              label={`${dept}: ${status}`}
                              size="small"
                              color={status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'error'}
                              variant={user?.department === dept ? 'filled' : 'outlined'}
                              sx={{ 
                                fontWeight: user?.department === dept ? 600 : 400,
                                boxShadow: user?.department === dept ? 1 : 0
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <Tooltip title="View File">
                    <IconButton>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              </React.Fragment>
            ))}
            {files.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" color="text.secondary" align="center">
                      No files are currently under review
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectReview;