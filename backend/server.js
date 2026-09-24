const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const employeeRoutes = require("./routes/employeeRoutes");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = (process.env.FRONTEND_URL || "https://khjnrb9t-5173.inc1.devtunnels.ms/").replace(/\/$/, "");

// Open CORS for the POC so a phone on the same Wi-Fi can load the digital ID.
app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "employee-digital-id", frontendUrl });
});

app.use("/api", employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ message: "Something went wrong", error: error.message });
});

const startServer = async () => {
  await connectDB();
  // Listen on all interfaces so phones on LAN can reach the API via 10.11.12.182
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://0.0.0.0:${PORT}`);
    console.log(`QR codes will open: ${frontendUrl}/id/:employeeId`);
  });
};

startServer();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         