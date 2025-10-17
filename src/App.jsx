import React, { useState, useEffect, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Typography, Card, CardContent, Button, Box, CircularProgress, Alert, Chip, Grid } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard, Analytics, Settings, People, Inventory, Description, Map, InsertDriveFile } from '@mui/icons-material'
import theme from './theme/theme.js'
import Sidebar from './components/Layout/Sidebar.jsx'
import ProjectReview from './components/Dashboard/ProjectReview.jsx'
import FileUpload from './components/FileUpload.jsx'
import Login from './components/Login.jsx'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentView, setCurrentView] = useState('/dashboard');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Effect to handle authentication state
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  // Fetch files from the server
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
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
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch files. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch files when component mounts
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Helper function to get file icon based on type
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

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get user information from localStorage
  const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  };

  // Handle navigation from sidebar
  const handleNavigation = (path, id) => {
    setCurrentView(path);
    // Refresh files when navigating to dashboard
    if (path === '/dashboard') {
      fetchFiles();
    }
    console.log(`Navigating to: ${path} (${id})`);
  }

  // Fetch files when dashboard view is activated
  useEffect(() => {
    if (currentView === '/dashboard') {
      fetchFiles();
    }
  }, [currentView, fetchFiles]);

  // Handle file uploads (files: [{ id, name, parsed }])
  const handleFileUpload = async (files) => {
    console.log('Files uploaded:', files);
    // Refresh the dashboard files after upload
    if (currentView === '/dashboard') {
      await fetchFiles();
    }
  }

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case '/dashboard':
        return renderDashboardContent()
      case '/projects':
        return renderProjectsContent()
      case '/upload':
        return renderUploadContent()
      case '/reviews':
        return renderReviewsContent()
      case '/environmental':
        return renderEnvironmentalContent()
      case '/electrical':
        return renderElectricalContent()
      case '/civil':
        return renderCivilContent()
      case '/permitting':
        return renderPermittingContent()
      default:
        return renderDashboardContent()
    }
  }

  const renderDashboardContent = () => {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome to your project dashboard. Monitor all your projects and activities from here.
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Files Grid */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Files
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {files.length === 0 ? (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No files have been uploaded yet
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                files.map((file) => (
                  <Grid item xs={12} sm={6} md={4} key={file.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box 
                        sx={{ 
                          backgroundColor: 'grey.100',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          py: 3,
                          borderBottom: 1,
                          borderColor: 'grey.200'
                        }}
                      >
                        {React.cloneElement(getFileIcon(file.filename), {
                          sx: { 
                            fontSize: 64,
                            m: 0 
                          }
                        })}
                      </Box>
                      <CardContent sx={{ pt: 2 }}>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            mb: 2,
                            wordBreak: 'break-all',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          {file.filename}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ width: '100px' }}
                            >
                              File Type:
                            </Typography>
                            <Chip
                              label={file.filename.split('.').pop().toUpperCase()}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderRadius: 1,
                                textTransform: 'uppercase',
                                fontWeight: 500
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ width: '100px' }}
                            >
                              Uploaded by:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {file.uploaded_by}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ width: '100px' }}
                            >
                              Uploaded at:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(file.uploadDate)}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 1 }}
                        >
                          Approval Status:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {Object.entries(
                            typeof file.approvalStatus === 'string'
                              ? JSON.parse(file.approvalStatus || '{}')
                              : file.approvalStatus || {}
                          ).map(([dept, status]) => (
                            <Box 
                              key={dept} 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                backgroundColor: status === 'approved' ? 'success.lighter' : 
                                              status === 'rejected' ? 'error.lighter' : 
                                              'warning.lighter',
                                borderRadius: 1,
                                p: 1
                              }}
                            >
                              <Typography 
                                component="span" 
                                variant="body2" 
                                sx={{ 
                                  width: '100px',
                                  color: status === 'approved' ? 'success.main' : 
                                         status === 'rejected' ? 'error.main' : 
                                         'warning.main',
                                  fontWeight: 500
                                }}
                              >
                                {dept}:
                              </Typography>
                              <Typography 
                                variant="body2"
                                sx={{ 
                                  color: status === 'approved' ? 'success.main' : 
                                         status === 'rejected' ? 'error.main' : 
                                         'warning.main',
                                  fontWeight: 600
                                }}
                              >
                                {status === 'approved' ? '✓ ' : status === 'rejected' ? '✗ ' : '⏳ '}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Access frequently used features quickly.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={() => handleNavigation('/upload', 'upload')}>
                  Upload Files
                </Button>
                <Button size="small" variant="outlined" onClick={() => handleNavigation('/projects', 'projects')}>
                  View Projects
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  const renderProjectsContent = () => (
    <ProjectReview user={getUserInfo()} />
  )

  const renderUploadContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Files
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload Excel spreadsheets and KMZ files for your projects. Supported formats include .xlsx, .xls, .kmz, and .kml files.
      </Typography>
      <FileUpload 
        onFilesUpload={handleFileUpload}
        maxFiles={10}
        maxSize={50 * 1024 * 1024} // 50MB
      />

      {/* File Processing Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            File Processing Information
          </Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 Excel Files (.xlsx, .xls)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Excel files are processed for data extraction and analysis. Supported data includes:
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <Typography component="li" variant="body2">Project data and specifications</Typography>
                <Typography component="li" variant="body2">Budget and cost analysis</Typography>
                <Typography component="li" variant="body2">Resource allocation tables</Typography>
                <Typography component="li" variant="body2">Timeline and milestone data</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🌍 Geographic Files (.kmz, .kml)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                KMZ and KML files are processed for geographic visualization:
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <Typography component="li" variant="body2">Site boundaries and locations</Typography>
                <Typography component="li" variant="body2">Environmental survey data</Typography>
                <Typography component="li" variant="body2">Infrastructure layouts</Typography>
                <Typography component="li" variant="body2">3D models and overlays</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
// Visualization component for uploaded files


function FileVisualization({ file }) {
  if (!file || !file.parsed) return null;
  if (file.parsed.type === 'excel') {
    // Assume first row is header, rest is data
    const rows = file.parsed.data;
    if (!rows || rows.length < 2) return <Typography>No data to display.</Typography>;
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    // For demo: plot first two columns as X and Y
    const xKey = headers[0];
    const yKey = headers[1];
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>Excel Data Visualization</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke="#1976d2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  if (file.parsed.type === 'kmz' || file.parsed.type === 'kml') {
    const geojson = file.parsed.data;
    if (!geojson) return <Typography>No geospatial data found.</Typography>;
    // Center map on first feature or default
    let center = [20, 0];
    if (geojson.features && geojson.features.length > 0) {
      const coords = geojson.features[0].geometry.coordinates;
      if (Array.isArray(coords[0])) {
        center = [coords[0][1], coords[0][0]];
      } else {
        center = [coords[1], coords[0]];
      }
    }
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>Geospatial Visualization</Typography>
        <MapContainer center={center} zoom={8} style={{ height: 350, width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON data={geojson} />
        </MapContainer>
      </Box>
    );
  }
  if (file.parsed.error) {
    return <Typography color="error">Error: {file.parsed.error}</Typography>;
  }
  return null;
}

  const renderReviewsContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reviews
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Review project submissions and provide feedback.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pending Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have 3 reviews pending approval.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )

  const renderEnvironmentalContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Environmental
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Environmental assessments and compliance tracking.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Environmental Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage environmental impact assessments.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )

  const renderElectricalContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Electrical
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Electrical engineering and system management.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Electrical Systems
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor electrical installations and maintenance.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )

  const renderCivilContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Civil
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Civil engineering and infrastructure projects.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Civil Engineering
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage civil engineering projects and specifications.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )

  const renderPermittingContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Permitting
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track permits and regulatory compliance.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Permit Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor permit applications and approvals.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )

  const MainLayout = () => (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        user={getUserInfo()}
        currentView={currentView}
        onNavigate={handleNavigation}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuth) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login route */}
          <Route path="/login" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={() => setIsAuthenticated(true)} />
          } />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
