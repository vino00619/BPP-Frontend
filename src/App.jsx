import { useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Typography, Card, CardContent, Button, Box } from '@mui/material'
import { Dashboard, Analytics, Settings, People, Inventory } from '@mui/icons-material'
import theme from './theme/theme.js'
import Sidebar from './components/Layout/Sidebar.jsx'
import FileUpload from './components/FileUpload.jsx'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [count, setCount] = useState(0)
  const [currentView, setCurrentView] = useState('/dashboard')

  // User information
  const user = {
    name: 'vino00619',
    email: 'vino00619@example.com'
  }

  // Handle navigation from sidebar
  const handleNavigation = (path, id) => {
    setCurrentView(path)
    console.log(`Navigating to: ${path} (${id})`)
  }

  // Handle file uploads (files: [{ id, name, parsed }])
  const handleFileUpload = (files) => {
    console.log('Files uploaded:', files)
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

  const renderDashboardContent = () => (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome to your project dashboard. Monitor all your projects and activities from here.
        </Typography>
      </Box>

      {/* Demo content cards */}
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Track your project progress and milestones.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setCount(count + 1)}
              sx={{ mr: 2 }}
            >
              Projects Created: {count}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • File uploaded: Environmental_Report.pdf<br />
              • Review completed: Project_A_Design<br />
              • Permit submitted: Electrical_Installation<br />
              • Civil assessment: Foundation_Plans
            </Typography>
          </CardContent>
        </Card>

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
    </>
  )

  const renderProjectsContent = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Projects
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your projects and view project details.
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here you can view, create, and manage all your projects.
          </Typography>
        </CardContent>
      </Card>
    </Box>
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar 
          user={user}
          currentView={currentView}
          onNavigate={handleNavigation}
        />
        
        {/* Main Content Area */}
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
    </ThemeProvider>
  )
}

export default App
