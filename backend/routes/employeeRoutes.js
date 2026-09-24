const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeQR,
  getPublicEmployeeId,
  approveEmployee,
  rejectEmployee,
  uploadEmployeesCsv,
} = require("../controllers/employeeController");
const { register, login, getMe, updateMyProfile } = require("../controllers/authController");
const { getCompany, updateCompany } = require("../controllers/companyController");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Auth
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", authenticate, getMe);
router.put("/auth/me", authenticate, updateMyProfile);

// Company profile (public read; admin update)
router.get("/company", getCompany);
router.put("/company", authenticate, requireAdmin, updateCompany);

// Admin employee management
router.post("/employees", authenticate, requireAdmin, createEmployee);
router.post("/employees/upload-csv", authenticate, requireAdmin, uploadEmployeesCsv);
router.get("/employees", authenticate, requireAdmin, getEmployees);
router.get("/employees/:employeeId/qr", getEmployeeQR);
router.post("/employees/:employeeId/approve", authenticate, requireAdmin, approveEmployee);
router.post("/employees/:employeeId/reject", authenticate, requireAdmin, rejectEmployee);
router.get("/employees/:employeeId", authenticate, requireAdmin, getEmployeeById);
router.put("/employees/:employeeId", authenticate, requireAdmin, updateEmployee);
router.delete("/employees/:employeeId", authenticate, requireAdmin, deleteEmployee);

// Public digital ID used after a QR scan
router.get("/id/:employeeId", getPublicEmployeeId);

module.exports = router;
