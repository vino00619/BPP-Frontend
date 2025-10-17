import React, { useState } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { kml as toGeoJSONKML } from "@tmcw/togeojson";
// Note: togeojson expects a DOM Document for KML, so we'll use DOMParser
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
} from "@mui/material";
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  CheckCircle,
  Error,
  Description,
  Map,
  Send,
  Done,
} from "@mui/icons-material";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FileUpload = ({
  onFilesUpload,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
}) => {
  const theme = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sheetPreview, setSheetPreview] = useState(null);
  const [mapPreview, setMapPreview] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");

  // Accepted file types
  const acceptedTypes = {
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.google-earth.kmz": [".kmz"],
    "application/vnd.google-earth.kml+xml": [".kml"],
    "text/csv": [".csv"],
    "application/csv": [".csv"],
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: acceptedTypes,
      maxFiles: maxFiles,
      maxSize: maxSize,
      onDrop: handleFileDrop,
      onDropRejected: handleDropRejected,
    });

  async function handleFileDrop(acceptedFiles) {
    setError("");
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    const newFiles = [];
    const parsedResults = [];

    for (const file of acceptedFiles) {
      const id = Date.now() + Math.random();
      let parsed = null;
      let status = "uploading";
      let progress = 0;
      try {
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          // Excel file
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array" });
          // For demo: take first sheet and convert to JSON
          const firstSheet = workbook.SheetNames[0];
          const sheetData = XLSX.utils.sheet_to_json(
            workbook.Sheets[firstSheet],
            { header: 1 }
          );
          parsed = { type: "excel", data: sheetData, sheetName: firstSheet };
          setSheetPreview(sheetData);
        } else if (file.name.endsWith(".kmz")) {
          // KMZ file (zip containing KML)
          const zip = await JSZip.loadAsync(file);
          // Find first KML file in the zip
          let kmlFile = null;
          zip.forEach((relativePath, zipEntry) => {
            if (!kmlFile && zipEntry.name.endsWith(".kml")) {
              kmlFile = zipEntry;
            }
          });
          if (kmlFile) {
            const kmlText = await kmlFile.async("text");
            const parser = new DOMParser();
            const kmlDom = parser.parseFromString(kmlText, "application/xml");
            const geojson = toGeoJSONKML(kmlDom);
            parsed = { type: "kmz", data: geojson };
          } else {
            throw new Error("No KML file found in KMZ");
          }
        } else if (file.name.endsWith(".kml")) {
          // KML file
          const text = await file.text();
          const parser = new DOMParser();
          const kmlDom = parser.parseFromString(text, "application/xml");
          const geojson = toGeoJSONKML(kmlDom);
          parsed = { type: "kml", data: geojson };
        } else if (file.name.endsWith(".csv")) {
          // CSV file
          const text = await file.text();
          const workbook = XLSX.read(text, { type: "string" });
          const firstSheet = workbook.SheetNames[0];
          const sheetData = XLSX.utils.sheet_to_json(
            workbook.Sheets[firstSheet],
            { header: 1 }
          );
          parsed = { type: "csv", data: sheetData, sheetName: firstSheet };
        }
        status = "completed";
        progress = 100;
      } catch (err) {
        status = "error";
        parsed = { error: err.message };
      }
      newFiles.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status,
        progress,
        parsed,
      });
      parsedResults.push({ id, name: file.name, parsed });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setUploading(false);
    setUploadProgress(100);
    if (onFilesUpload) {
      onFilesUpload(parsedResults);
    }
  }

  function handleDropRejected(rejectedFiles) {
    const reasons = rejectedFiles.map(({ errors }) =>
      errors.map((error) => error.message).join(", ")
    );
    setError(`Upload failed: ${reasons.join("; ")}`);
  }

  function handleRemoveFile(fileId) {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((file) => file.id !== fileId);
      const fileToRemove = prev.find((file) => file.id === fileId);
      // If the previewed file is being deleted, close the preview
      if (fileToRemove && fileToRemove.name === previewFileName) {
        setSheetPreview(null);
        setPreviewFileName("");
      }
      return filtered;
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function getFileIcon(fileType) {
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return <Description sx={{ color: "#1976d2" }} />;
    }
    if (fileType.includes("kmz") || fileType.includes("kml")) {
      return <Map sx={{ color: "#4caf50" }} />;
    }
    return <InsertDriveFile />;
  }

  function getFileTypeChip(fileName) {
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
        }}
      />
    );
  }

  return (
    <Box>
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        sx={{
          mb: 3,
          cursor: "pointer",
          border: `2px dashed ${
            isDragActive
              ? theme.palette.primary.main
              : isDragReject
              ? theme.palette.error.main
              : theme.palette.divider
          }`,
          backgroundColor: isDragActive
            ? `${theme.palette.primary.main}08`
            : isDragReject
            ? `${theme.palette.error.main}08`
            : theme.palette.background.paper,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: `${theme.palette.primary.main}04`,
          },
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <input {...getInputProps()} />

          <CloudUpload
            sx={{
              fontSize: 48,
              color: isDragActive
                ? theme.palette.primary.main
                : theme.palette.text.secondary,
              mb: 2,
            }}
          />

          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? "Drop files here..."
              : "Drag & drop files or click to browse"}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Supported formats: Excel (.xlsx, .xls), CSV (.csv), Google Earth
            (.kmz, .kml)
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Maximum {maxFiles} files, {formatFileSize(maxSize)} per file
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
            >
              Choose Files
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body2" gutterBottom>
              Uploading files... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
      )}

      {/* Map Preview */}
      {mapPreview && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Map Preview {previewFileName ? `- ${previewFileName}` : ""}
              </Typography>
              <Button size="small" onClick={() => setMapPreview(null)}>
                Close
              </Button>
            </Box>
            <Box sx={{ height: "400px", width: "100%" }}>
              <MapContainer
                center={[0, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON data={mapPreview} />
              </MapContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uploaded Files ({uploadedFiles.length})
            </Typography>

            <List>
              {uploadedFiles.map((file) => (
                <ListItem
                  key={file.id}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mb: 1,
                    "&:last-child": { mb: 0 },
                  }}
                >
                  <ListItemIcon>
                    {file.status === "completed" ? (
                      <CheckCircle sx={{ color: theme.palette.success.main }} />
                    ) : file.status === "error" ? (
                      <Error sx={{ color: theme.palette.error.main }} />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {file.name}
                        </Typography>
                        {getFileTypeChip(file.name)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                        {file.status === "uploading" && (
                          <LinearProgress
                            size="small"
                            variant="indeterminate"
                            sx={{ mt: 0.5, height: 2 }}
                          />
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(file.id)}
                      size="small"
                      sx={{ color: theme.palette.error.main }}
                    >
                      <Delete />
                    </IconButton>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      disabled={file.status === "error" || !file.parsed}
                      onClick={() => {
                        if (file.parsed && file.parsed.data) {
                          if (
                            file.name.endsWith(".kmz") ||
                            file.name.endsWith(".kml")
                          ) {
                            // For KMZ/KML files, show map preview
                            setMapPreview(file.parsed.data);
                          } else {
                            // For Excel/CSV files, show sheet preview
                            setSheetPreview(file.parsed.data);
                          }
                          setPreviewFileName(file.name);
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mr: 1 }}
                      disabled={
                        file.status === "under_review" ||
                        file.status !== "completed"
                      }
                      startIcon={
                        file.status === "under_review" ? <Done /> : <Send />
                      }
                      onClick={async () => {
                        try {
                          // Get user info from localStorage
                          const userInfo = JSON.parse(
                            localStorage.getItem("userInfo")
                          );
                          if (!userInfo || !userInfo.id) {
                            throw new Error("User information not found");
                          }

                          // Update local state to show "under review" status
                          setUploadedFiles((prev) =>
                            prev.map((f) =>
                              f.id === file.id
                                ? { ...f, status: "under_review" }
                                : f
                            )
                          );

                          // Generate a unique file ID using timestamp and random number
                          const fileId = `FILE_${Date.now()}_${Math.random()
                            .toString(36)
                            .substr(2, 9)}`;

                          // Prepare the approval status JSON
                          const approvalStatus = JSON.stringify({
                            Environmental: "pending",
                            Electrical: "pending",
                            Civil: "pending",
                            Permitting: "pending",
                          });

                          // Prepare file data for the backend
                          const fileData = {
                            id: fileId,
                            filename: file.name,
                            originalName: file.name, // <-- add this
                            mimeType: file.type, // <-- add this
                            size: file.size,
                            version: 1,
                            uploaded_by: userInfo.id, // Using userId as expected by the backend
                            uploadDate: new Date().toISOString(),
                            status: "under_review",
                            type: file.name.split(".").pop().toLowerCase(),
                            description: `Uploaded file: ${file.name}`,
                            approvalStatus: approvalStatus, // Using camelCase to be consistent
                          };

                          // Send file data to backend
                          const response = await fetch(
                            "https://3f769fa3-ed5f-46d9-a9d3-94747066ab72-00-16aw6un3hn9io.worf.replit.dev/api/files",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(fileData),
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Failed to save file data");
                          }

                          const result = await response.json();
                          console.log("File data saved successfully:", result);

                          // Show success message
                          setSuccess("File sent for review successfully");
                          setError(""); // Clear any existing errors
                        } catch (error) {
                          console.error("Error saving file data:", error);
                          setError(
                            error.message || "Failed to send file for review"
                          );

                          // Revert the status if there was an error
                          setUploadedFiles((prev) =>
                            prev.map((f) =>
                              f.id === file.id
                                ? { ...f, status: "completed" }
                                : f
                            )
                          );
                        }
                      }}
                    >
                      {file.status === "under_review"
                        ? "Sent for Approval"
                        : "Send for Approval"}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Sheet Preview: Only show if preview data exists and is an array with at least one row */}
      {sheetPreview &&
        Array.isArray(sheetPreview) &&
        sheetPreview.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  File Preview {previewFileName ? `- ${previewFileName}` : ""}
                </Typography>
                <Button size="small" onClick={() => setSheetPreview(null)}>
                  Close
                </Button>
              </Box>
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <tbody>
                    {sheetPreview.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            style={{
                              border: "1px solid #ccc",
                              padding: "4px 8px",
                              background: i === 0 ? "#f5f5f5" : "inherit",
                              fontWeight: i === 0 ? 600 : 400,
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        )}
    </Box>
  );
};

FileUpload.propTypes = {
  onFilesUpload: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
};

export default FileUpload;
