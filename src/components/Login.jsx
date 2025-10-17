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
  useEffect(() => {
    localStorage.clear();
  }, []);

  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    console.log("Login attempt started with:", {
      username: formData.username,
      department: department,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log(
        "Making API request to:",
        "https://3f769fa3-ed5f-46d9-a9d3-94747066ab72-00-16aw6un3hn9io.worf.replit.dev/auth/login"
      );

      const requestBody = {
        username: formData.username,
        password: formData.password,
        department: department,
      };
      console.log("Request payload:", requestBody);

      const API_URL =
        "https://3f769fa3-ed5f-46d9-a9d3-94747066ab72-00-16aw6un3hn9io.worf.replit.dev";
      console.log("Attempting to connect to:", `${API_URL}/auth/login`);

      // Add API version and ensure we're hitting the API endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        cache: "no-cache",
      });

      const contentType = response.headers.get("content-type");
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.log("Content type:", contentType);

      // Get the raw response text for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // If HTML, provide more specific error message
      if (responseText.trim().startsWith("<!DOCTYPE html>")) {
        console.error(
          "Received HTML instead of JSON. API endpoint might be incorrect or server might be down.",
          "\nTrying to reach:", `${API_URL}/auth/login`,
          "\nMake sure to:",
          "\n1. Use correct username (e.g., 'solarengg' not 'soalrengg')",
          "\n2. Check if the backend server is running",
          "\n3. Verify the API endpoint path"
        );
        throw new Error(
          "API endpoint not found or not responding correctly. Please check the server status."
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid JSON response from server");
      }

      // Validate content type
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Warning: Unexpected content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        // API error (e.g., 401)
        console.log("Login failed:", data.error || "Unknown error");
        throw new Error(data.error || "Login failed");
      }

      // Success!
      console.log("Login successful. User data:", {
        id: data.id,
        username: data.username,
        department: data.department,
      });

      // Store comprehensive user info
      const userInfo = {
        id: data.id,
        username: data.username,
        email: data.email,
        department: data.department,
        name: data.name || data.username, // Fallback to username if name isn't provided
        role: data.role || `${data.department} User`, // Fallback role
        permissions: data.permissions || [], // Store permissions if available
        createdAt: data.createdAt
      };

      // Store in both localStorage and sessionStorage
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("isAuthenticated", "true");

      if (typeof onLogin === "function") {
        onLogin();
      }
      console.log("Navigation to dashboard initiated");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error details:", {
        message: err.message,
        stack: err.stack,
        type: err.name,
      });
      if (err.message === "Server returned non-JSON response") {
        setError(
          "Server error: The API returned an invalid response format. Please contact support."
        );
        console.error(
          "Server responded with wrong format. Check if the API endpoint is correct and running."
        );
      } else if (err.message === "Failed to fetch") {
        setError(
          "Network error: Could not reach the server. Please check your connection."
        );
        console.error(
          "Network error - server might be down or URL might be incorrect"
        );
      } else if (err.message.includes("Invalid API response")) {
        setError(
          "Server error: The API returned HTML instead of JSON. Check the endpoint or contact support."
        );
      } else {
        setError(
          "An unexpected error occurred. Please try again or contact support."
        );
        console.error("Unexpected error:", err.message);
      }
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
