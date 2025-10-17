import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Typography,
  Link,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = ({ onLogin }) => {
  // Redirect to login if there's any leftover auth state
  useEffect(() => {
    // Clear any existing auth state when the login component mounts
    localStorage.clear();
  }, []);
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const departments = [
    "Solar and Wind",
    "Environmental",
    "Electrical",
    "Civil",
    "Permitting",
  ];

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      // Simulating API call to validate credentials
      const response = await fetch("/src/data/mockData.json");
      const data = await response.json();
      
      const user = data.users.find(
        (u) =>
          u.username === formData.username &&
          u.password === formData.password &&
          u.department === department
      );

      if (user) {
        // Store user info in localStorage (in a real app, you'd store a token)
        localStorage.setItem("userInfo", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");
        
        // Call the onLogin callback and navigate to dashboard
        onLogin();
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgb(243, 246, 249)",
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5))",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: "400px",
          p: 4,
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          bgcolor: "background.paper",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={department}
            label="Department"
            onChange={handleDepartmentChange}
            required
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          required
          InputProps={{
            endAdornment: (
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Button type="submit" fullWidth variant="contained" sx={{ mb: 2 }}>
          Login
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Link href="#" underline="hover" sx={{ display: "block", mb: 1 }}>
            Forgot Password?
          </Link>
          <Typography variant="body2">
            Not a user?{" "}
            <Link href="#" underline="hover">
              Signup
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
